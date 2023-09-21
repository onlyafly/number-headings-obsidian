import { Editor, EditorChange, EditorRange, HeadingCache } from 'obsidian'
import { ViewInfo } from './activeViewHelpers'
import { NumberingToken, firstNumberingTokenInStyle, makeNumberingString, nextNumberingToken, startAtOrZerothInStyle } from './numberingTokens'
import { NumberHeadingsPluginSettings, doesContentsHaveValue } from './settingsTypes'
import { SupportFlags, createSupportFlagsFromSettings, findRangeInHeaderString } from './textProcessing'

const TOC_LIST_ITEM_BULLET = '-'

function makeHeadingHashString(editor: Editor, heading: HeadingCache): string | undefined {
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

function findHeadingPrefixRange(editor: Editor, heading: HeadingCache, flags: SupportFlags): EditorRange | undefined {
  const lineNumber = heading.position.start.line
  const lineText = editor.getLine(lineNumber)
  return findRangeInHeaderString(lineText, lineNumber, flags)
}

function cleanHeadingTextForToc(htext: string): string {
  if (htext.contains('^')) {
    const x = htext.split('^')
    if (x.length > 1) {
      return x[0].trim()
    }
  }
  return htext.trim()
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function createTocEntry(h: HeadingCache, settings: NumberHeadingsPluginSettings, initialHeadingLevel: number): string {
  const text = h.heading
  const cleanText = cleanHeadingTextForToc(text)

  let bulletIndent = ''
  const startLevel = initialHeadingLevel
  for (let i = startLevel; i < h.level; i++) {
    bulletIndent += '\t'
  }

  const entryLink = `[[#${text}|${cleanText}]]`

  return bulletIndent + TOC_LIST_ITEM_BULLET + ' ' + entryLink
}

// Replace a range, but only if there is a change in text, to prevent poluting the undo stack
function replaceRangeEconomically(editor: Editor, changes: EditorChange[], range: EditorRange, text: string): void {
  const previousText = editor.getRange(range.from, range.to)

  if (previousText !== text) {
    changes.push({
      text: text,
      from: range.from,
      to: range.to
    })
  }
}

export const updateHeadingNumbering = (
  viewInfo: ViewInfo | undefined,
  settings: NumberHeadingsPluginSettings
): void => {
  if (!viewInfo) return
  const headings = viewInfo.data.headings ?? []
  const editor = viewInfo.editor
  const supportFlags = createSupportFlagsFromSettings(settings.styleLevel1, settings.styleLevelOther)

  let previousLevel = 1

  let numberingStack: NumberingToken[] = [startAtOrZerothInStyle(settings.startAt, settings.styleLevel1)]

  if (settings.firstLevel > 1) {
    previousLevel = settings.firstLevel
  } else if (settings.skipTopLevel) {
    previousLevel = 2
  }

  const changes: EditorChange[] = []

  for (const heading of headings) {
    // Update the numbering stack based on the level and previous level

    const level = heading.level

    // Handle skipped & ignored levels.
    if ((settings.firstLevel > level) || (settings.skipTopLevel && level === 1)) {
      // Resets the numbering when a level is skipped.
      // Note: This leaves headings as they are, allowing people to have numbers at the start of
      // ignored headings.

      numberingStack = [startAtOrZerothInStyle(settings.startAt, settings.styleLevel1)]

      if (settings.firstLevel > 1) {
        previousLevel = settings.firstLevel
      } else if (settings.skipTopLevel) {
        previousLevel = 2
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
    const prefixRange = findHeadingPrefixRange(editor, heading, supportFlags)
    if (prefixRange === undefined) return
    const headingHashString = makeHeadingHashString(editor, heading)
    if (headingHashString === undefined) return
    const prefixString = makeNumberingString(numberingStack)
    replaceRangeEconomically(editor, changes, prefixRange, headingHashString + prefixString + settings.separator + ' ')
  }

  // Execute the transaction to make all the changes at once
  if (changes.length > 0) {
    // eslint-disable-next-line no-console
    console.log('Number Headings Plugin: Applying headings numbering changes:', changes.length)
    editor.transaction({
      changes: changes
    })
  }
}

export const updateTableOfContents = (
  viewInfo: ViewInfo | undefined,
  settings: NumberHeadingsPluginSettings
): void => {
  if (!viewInfo) return
  const headings = viewInfo.data.headings ?? []
  const editor = viewInfo.editor

  if (!doesContentsHaveValue(settings.contents)) return

  let tocHeading: HeadingCache | undefined
  let tocBuilder = '\n'
  const changes: EditorChange[] = []

  // In case headings start above level 1, we don't want to indent the bullets too much
  let initialHeadingLevel = 1
  if (headings.length > 0) {
    initialHeadingLevel = headings[0].level
  }

  for (const heading of headings) {
    // ORDERING: Important to find the TOC heading before skipping skipped headings, since that is for numbering

    // Find the TOC heading
    if (heading.heading.endsWith(settings.contents)) {
      tocHeading = heading
    }

    /* This code lets us skip TOC lines for skipped headings, but doesn't work well with first-level setting
    if ((settings.skipTopLevel && heading.level === 1) || (heading.level > settings.maxLevel)) {
      continue
    }
    */

    const tocEntry = createTocEntry(heading, settings, initialHeadingLevel)
    tocBuilder += tocEntry + '\n'
  }

  // Insert the generated table of contents
  if (tocHeading) {
    const from = {
      line: tocHeading.position.start.line + 1,
      ch: 0
    }

    // Find the end of the TOC section
    const startingLine = tocHeading.position.start.line + 1
    let endingLine = startingLine
    let foundList = false
    const lastLineInEditor = editor.lastLine()
    for (; ; endingLine++) {
      const line = editor.getLine(endingLine)
      if (line === undefined || endingLine > lastLineInEditor) {
        // Reached end of file, insert at the start of the TOC section
        endingLine = startingLine
        break
      }
      const trimmedLineText = line.trimStart()
      if (foundList) {
        if (!trimmedLineText.startsWith(TOC_LIST_ITEM_BULLET)) break
        if (trimmedLineText.startsWith('#')) break
      } else {
        if (trimmedLineText.startsWith(TOC_LIST_ITEM_BULLET)) {
          foundList = true
        } else if (trimmedLineText.startsWith('#')) {
          // Reached the next heading without finding existing TOC list, insert at the start of the TOC section
          endingLine = startingLine
          break
        } else {
          continue
        }
      }
    }

    if (tocBuilder === '\n') {
      tocBuilder = ''
    }

    const to = {
      line: endingLine,
      ch: 0
    }
    const range = { from, to }
    replaceRangeEconomically(editor, changes, range, tocBuilder)
  }

  // Execute the transaction to make all the changes at once
  if (changes.length > 0) {
    // eslint-disable-next-line no-console
    console.log('Number Headings Plugin: Applying table of contents changes:', changes.length)
    editor.transaction({
      changes: changes
    })
  }
}

export const removeHeadingNumbering = (
  viewInfo: ViewInfo | undefined
): void => {
  if (!viewInfo) return
  const headings = viewInfo.data.headings ?? []
  const editor = viewInfo.editor

  const changes: EditorChange[] = []

  for (const heading of headings) {
    const prefixRange = findHeadingPrefixRange(editor, heading, { alphabet: true, roman: true })
    if (prefixRange === undefined) return
    const headingHashString = makeHeadingHashString(editor, heading)
    if (headingHashString === undefined) return
    replaceRangeEconomically(editor, changes, prefixRange, headingHashString + ' ')
  }

  if (changes.length > 0) {
    editor.transaction({
      changes: changes
    })
  }
}
