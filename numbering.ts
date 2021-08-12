import { CachedMetadata, Editor, EditorPosition, EditorRange, HeadingCache, parseFrontMatterEntry } from 'obsidian'
import { NumberHeadingsPluginSettings } from 'settingsTypes'

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
  const regex = /^\s{0,4}#+( )?([0-9]+\.|[A-Z]\.)*([0-9]+|[A-Z])?( )+/g
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

export const replaceNumberHeadings = (
  { headings = [] }: CachedMetadata,
  editor: Editor,
  settings: NumberHeadingsPluginSettings
) => {
  let previousLevel = 1

  const numberingStack: NumberingToken[] = [zerothNumberingTokenInStyle(settings.styleLevel1)]

  if (settings.skipTopLevel) {
    previousLevel = 2
  }

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
        const prefixString = makeNumberingString([])
        editor.replaceRange(headingHashString + prefixString + ' ', prefixRange.from, prefixRange.to)
      }
      continue
    }

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

    const prefixRange = getHeadingPrefixRange(editor, heading)
    if (prefixRange === undefined) return
    const headingHashString = makeHeadingHashString(editor, heading)
    if (headingHashString === undefined) return
    const prefixString = makeNumberingString(numberingStack)
    editor.replaceRange(headingHashString + prefixString + ' ', prefixRange.from, prefixRange.to)
  }
}

export const removeNumberHeadings = (
  { headings = [] }: CachedMetadata,
  editor: Editor
) => {
  for (const heading of headings) {
    const prefixRange = getHeadingPrefixRange(editor, heading)
    if (prefixRange === undefined) return
    const headingHashString = makeHeadingHashString(editor, heading)
    if (headingHashString === undefined) return
    const prefixString = makeNumberingString([])
    editor.replaceRange(headingHashString + prefixString + ' ', prefixRange.from, prefixRange.to)
  }
}

export const getFrontMatterSettingsOrAlternative = (
  { frontmatter }: CachedMetadata,
  alternativeSettings: NumberHeadingsPluginSettings
): NumberHeadingsPluginSettings => {
  if (frontmatter !== undefined) {
    // NOTE: some of the below keys are for backwards compatibility

    const skipTopLevelEntry = parseFrontMatterEntry(frontmatter, 'number-headings-skip-top-level') ?? parseFrontMatterEntry(frontmatter, 'header-numbering-skip-top-level')
    const skipTopLevel = (skipTopLevelEntry !== true && skipTopLevelEntry !== false) ? alternativeSettings.skipTopLevel : skipTopLevelEntry

    const maxLevelEntry = parseFrontMatterEntry(frontmatter, 'number-headings-max-level') ?? parseFrontMatterEntry(frontmatter, 'header-numbering-max-level')
    const maxLevel = (typeof maxLevelEntry !== 'number' || maxLevelEntry < 1 || maxLevelEntry > 6) ? alternativeSettings.maxLevel : maxLevelEntry

    const styleLevel1Entry = String(
      parseFrontMatterEntry(frontmatter, 'number-headings-style-level-1') ??
      parseFrontMatterEntry(frontmatter, 'header-numbering-style-level-1')
    )
    const styleLevel1 = (styleLevel1Entry !== '1' && styleLevel1Entry !== 'A') ? alternativeSettings.styleLevel1 : styleLevel1Entry

    const styleLevelOtherEntry = String(
      parseFrontMatterEntry(frontmatter, 'number-headings-style-level-other') ??
      parseFrontMatterEntry(frontmatter, 'header-numbering-style-level-other')
    )
    const styleLevelOther = (styleLevelOtherEntry !== '1' && styleLevelOtherEntry !== 'A') ? alternativeSettings.styleLevelOther : styleLevelOtherEntry

    const autoEntry = parseFrontMatterEntry(frontmatter, 'number-headings-auto') ?? parseFrontMatterEntry(frontmatter, 'header-numbering-auto')
    const auto = (autoEntry !== true && autoEntry !== false) ? alternativeSettings.auto : autoEntry

    return { skipTopLevel, maxLevel, styleLevel1, styleLevelOther, auto }
  } else {
    return alternativeSettings
  }
}

export const saveSettingsToFrontMatter = (
  { frontmatter }: CachedMetadata,
  editor: Editor,
  settings: NumberHeadingsPluginSettings
) => {
  if (frontmatter !== undefined) {
    // Front matter already exists, so we'll need to insert the settings into the front matter

    // Find the location of the frontmatter
    let frontMatterLine = -1
    for (let i = 0; i < editor.lastLine(); i++) {
      const lineString = editor.getLine(i)
      if (lineString === '---') {
        frontMatterLine = i + 1
      } else if (lineString && lineString.trim() !== '') {
        break
      }
    }
    if (frontMatterLine === -1) {
      throw new Error('Number Headings Plugin: Front matter not found at start of document.')
    }

    let frontmatterAdditions = ''

    if (frontmatter['number-headings-skip-top-level'] === undefined) {
      frontmatterAdditions += `number-headings-skip-top-level: ${settings.skipTopLevel}\n`
    }
    if (frontmatter['number-headings-max-level'] === undefined) {
      frontmatterAdditions += `number-headings-max-level: ${settings.maxLevel}\n`
    }
    if (frontmatter['number-headings-style-level-1'] === undefined) {
      frontmatterAdditions += `number-headings-style-level-1: ${settings.styleLevel1}\n`
    }
    if (frontmatter['number-headings-style-level-other'] === undefined) {
      frontmatterAdditions += `number-headings-style-level-other: ${settings.styleLevelOther}\n`
    }
    if (frontmatter['number-headings-auto'] === undefined) {
      frontmatterAdditions += `number-headings-auto: ${settings.auto}\n`
    }

    const from: EditorPosition = { line: frontMatterLine, ch: 0 }
    const to: EditorPosition = { line: frontMatterLine, ch: 0 }
    editor.replaceRange(frontmatterAdditions, from, to)
  } else {
    // NOTE: Formatting below is very important!
    const newFrontmatterString = `---
number-headings-skip-top-level: ${settings.skipTopLevel}
number-headings-max-level: ${settings.maxLevel}
number-headings-style-level-1: ${settings.styleLevel1}
number-headings-style-level-other: ${settings.styleLevelOther}
number-headings-auto: ${settings.auto}
---

`

    const from: EditorPosition = { line: 0, ch: 0 }
    const to: EditorPosition = { line: 0, ch: 0 }
    editor.replaceRange(newFrontmatterString, from, to)
    // Front matter does not exist, so we will create it from scratch
  }
}
