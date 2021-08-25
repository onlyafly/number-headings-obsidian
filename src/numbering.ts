import { CachedMetadata, Editor, EditorChange, EditorRange, HeadingCache } from 'obsidian'
import { NumberHeadingsPluginSettings } from './settingsTypes'

function makeHeadingHashString (editor: Editor, heading: HeadingCache): string | undefined {
  const regex = /^\s{0,4}#+/g
  const headingLineString = editor.getLine(heading.position.start.line)
  if (!headingLineString) return undefined

  const matches = headingLineString.match(regex)
  if (!matches) return undefined

  if (matches.length !== 1) {
    // eslint-disable-next-line no-console
    console.log("Unexpected heading format: '" + headingLineString + "'")
    return undefined
  }

  const match = matches[0]
  return match.trimLeft()
}

function makeNumberingString (numberingStack: NumberingToken[]): string {
  let numberingString = ''

  for (let i = 0; i < numberingStack.length; i++) {
    if (i === 0) {
      numberingString += ' '
    } else {
      numberingString += '.'
    }
    numberingString += numberingStack[i].toString()
  }

  return numberingString
}

function getHeadingPrefixRange (editor: Editor, heading: HeadingCache): EditorRange | undefined {
  const regex = /^\s{0,4}#+( )?([0-9]+\.|[A-Z]\.)*([0-9]+|[A-Z])?[:.-]?( )+/g
  const headingLineString = editor.getLine(heading.position.start.line)
  if (!headingLineString) return undefined

  const matches = headingLineString.match(regex)

  if (matches && matches.length !== 1) {
    // eslint-disable-next-line no-console
    console.log("Unexpected heading format: '" + headingLineString + "'")
    return undefined
  }

  const match = matches ? matches[0] : ''

  const from = {
    line: heading.position.start.line,
    ch: 0
  }
  const to = {
    line: heading.position.start.line,
    ch: match.length
  }

  return { from, to }
}

type NumberingToken = string | number

function zerothNumberingTokenInStyle (style: string): NumberingToken {
  if (style === '1') {
    return 0
  } else if (style === 'A') {
    return 'Z'
  }

  return 0
}

function firstNumberingTokenInStyle (style: string): NumberingToken {
  if (style === '1') {
    return 1
  } else if (style === 'A') {
    return 'A'
  }

  return 1
}

function nextNumberingToken (t: NumberingToken): NumberingToken {
  if (typeof t === 'number') {
    return t + 1
  }

  if (typeof t === 'string') {
    if (t === 'Z') return 'A'
    else return String.fromCharCode(t.charCodeAt(0) + 1)
  }

  return 1
}

// Replace a range, but only if there is a change in text, to prevent poluting the undo stack
function replaceRangeSafely (editor: Editor, changes: EditorChange[], range: EditorRange, text: string): void {
  const previousText = editor.getRange(range.from, range.to)

  if (previousText !== text) {
    changes.push({
      text: text,
      from: range.from,
      to: range.to
    })
  }
}

export const replaceNumberHeadings = (
  { headings = [] }: CachedMetadata,
  editor: Editor,
  settings: NumberHeadingsPluginSettings
): void => {
  let previousLevel = 1

  const numberingStack: NumberingToken[] = [zerothNumberingTokenInStyle(settings.styleLevel1)]

  if (settings.skipTopLevel) {
    previousLevel = 2
  }

  let tocHeading: HeadingCache | undefined
  let tocText = ''

  const changes: EditorChange[] = []

  for (const heading of headings) {
    // Update the numbering stack based on the level and previous level

    const level = heading.level

    // Remove any heading numbers in these two cases:
    // 1. this is a top level and we are skipping top level headings
    // 2. this level is higher than the max level setting
    if ((settings.skipTopLevel && level === 1) || (level > settings.maxLevel)) {
      const prefixRange = getHeadingPrefixRange(editor, heading)

      if (prefixRange) {
        const headingHashString = makeHeadingHashString(editor, heading)
        if (headingHashString === undefined) continue
        replaceRangeSafely(editor, changes, prefixRange, headingHashString + ' ')
      }
      continue
    }

    // Adjust numbering stack
    if (level === previousLevel) {
      const x = numberingStack.pop()
      if (x !== undefined) {
        numberingStack.push(nextNumberingToken(x))
      }
    } else if (level < previousLevel) {
      for (let i = previousLevel; i > level; i--) {
        numberingStack.pop()
      }
      const x = numberingStack.pop()
      if (x !== undefined) {
        numberingStack.push(nextNumberingToken(x))
      }
    } else if (level > previousLevel) {
      for (let i = previousLevel; i < level; i++) {
        numberingStack.push(firstNumberingTokenInStyle(settings.styleLevelOther))
      }
    }

    // Set the previous level to this level for the next iteration
    previousLevel = level

    if (level > settings.maxLevel) {
      // If we are above the max level, just don't number it
      continue
    }

    // Find the range to replace, and then do it
    const prefixRange = getHeadingPrefixRange(editor, heading)
    if (prefixRange === undefined) return
    const headingHashString = makeHeadingHashString(editor, heading)
    if (headingHashString === undefined) return
    const prefixString = makeNumberingString(numberingStack)
    replaceRangeSafely(editor, changes, prefixRange, headingHashString + prefixString + settings.separator + ' ')

    // Handle table of contents work
    if (heading.heading.endsWith('^toc')) {
      tocHeading = heading
    }
    if (tocHeading !== undefined) {
      tocText += '* ' + heading.heading + '\n'
    }
  }

  // Insert the generated table of contents
  if (tocText.length > 0 && tocHeading) {
    const from = {
      line: tocHeading.position.start.line + 1,
      ch: 0
    }
    const to = {
      line: tocHeading.position.start.line + 1,
      ch: 0
    }
    const range = { from, to }
    replaceRangeSafely(editor, changes, range, tocText)
  }

  // Execute the transaction to make all the changes at once
  if (changes.length > 0) {
    editor.transaction({
      changes: changes
    })
  }
}

export const removeNumberHeadings = (
  { headings = [] }: CachedMetadata,
  editor: Editor
): void => {
  const changes: EditorChange[] = []

  for (const heading of headings) {
    const prefixRange = getHeadingPrefixRange(editor, heading)
    if (prefixRange === undefined) return
    const headingHashString = makeHeadingHashString(editor, heading)
    if (headingHashString === undefined) return
    replaceRangeSafely(editor, changes, prefixRange, headingHashString + ' ')
  }

  if (changes.length > 0) {
    editor.transaction({
      changes: changes
    })
  }
}
