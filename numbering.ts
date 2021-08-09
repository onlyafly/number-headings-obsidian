import { CachedMetadata, Editor, EditorRange, HeadingCache, parseFrontMatterEntry } from 'obsidian'
import { HeaderNumberingPluginSettings } from 'settingsTypes'

function makeHeaderHashString (editor: Editor, heading: HeadingCache): string {
  const regex = /^#+/g
  const headerLineString = editor.getLine(heading.position.start.line)
  const matches = headerLineString.match(regex)

  if (matches.length !== 1) {
    // eslint-disable-next-line no-console
    console.log("Unexpected header format: '" + headerLineString + "'")
    return undefined
  }

  const match = matches[0]
  return match
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

function getHeaderPrefixRange (editor: Editor, heading: HeadingCache): EditorRange {
  const regex = /^#+( )?([0-9]+\.|[A-Z]\.)*([0-9]+|[A-Z])?( )+/g
  const headerLineString = editor.getLine(heading.position.start.line)
  const matches = headerLineString.match(regex)

  if (matches && matches.length !== 1) {
    // eslint-disable-next-line no-console
    console.log("Unexpected header format: '" + headerLineString + "'")
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

export const replaceHeaderNumbering = (
  { headings = [] }: CachedMetadata,
  editor: Editor,
  settings: HeaderNumberingPluginSettings
) => {
  let previousLevel = 1

  const numberingStack: NumberingToken[] = [zerothNumberingTokenInStyle(settings.styleLevel1)]

  if (settings.skipTopLevel) {
    previousLevel = 2
  }

  for (const heading of headings) {
    // Update the numbering stack based on the level and previous level

    const level = heading.level

    // Remove any header numbering in these two cases:
    // 1. this is a top level and we are skipping top level headings
    // 2. this level is higher than the max level setting
    if ((settings.skipTopLevel && level === 1) || (level > settings.maxLevel)) {
      const prefixRange = getHeaderPrefixRange(editor, heading)
      const headerHashString = makeHeaderHashString(editor, heading)
      const prefixString = makeNumberingString([])
      editor.replaceRange(headerHashString + prefixString + ' ', prefixRange.from, prefixRange.to)
      continue
    }

    if (level === previousLevel) {
      const x = numberingStack.pop()
      numberingStack.push(nextNumberingToken(x))
    } else if (level < previousLevel) {
      for (let i = previousLevel; i > level; i--) {
        numberingStack.pop()
      }
      const x = numberingStack.pop()
      numberingStack.push(nextNumberingToken(x))
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

    const prefixRange = getHeaderPrefixRange(editor, heading)
    const headerHashString = makeHeaderHashString(editor, heading)
    const prefixString = makeNumberingString(numberingStack)
    editor.replaceRange(headerHashString + prefixString + ' ', prefixRange.from, prefixRange.to)
  }
}

export const removeHeaderNumbering = (
  { headings = [] }: CachedMetadata,
  editor: Editor
) => {
  for (const heading of headings) {
    const prefixRange = getHeaderPrefixRange(editor, heading)
    const headerHashString = makeHeaderHashString(editor, heading)
    const prefixString = makeNumberingString([])
    editor.replaceRange(headerHashString + prefixString + ' ', prefixRange.from, prefixRange.to)
  }
}

export const getFrontMatterSettingsOrProvided = (
  { frontmatter }: CachedMetadata,
  alternativeSettings: HeaderNumberingPluginSettings
): HeaderNumberingPluginSettings => {
  if (frontmatter !== undefined) {
    const skipTopLevelEntry = parseFrontMatterEntry(frontmatter, 'header-numbering-skip-top-level')
    const skipTopLevel = (skipTopLevelEntry !== true && skipTopLevelEntry !== false) ? alternativeSettings.skipTopLevel : skipTopLevelEntry

    const maxLevelEntry = parseFrontMatterEntry(frontmatter, 'header-numbering-max-level')
    const maxLevel = (typeof maxLevelEntry !== 'number' || maxLevelEntry < 1 || maxLevelEntry > 6) ? alternativeSettings.maxLevel : maxLevelEntry

    const styleLevel1Entry = String(parseFrontMatterEntry(frontmatter, 'header-numbering-style-level-1'))
    const styleLevel1 = (styleLevel1Entry !== '1' && styleLevel1Entry !== 'A') ? alternativeSettings.styleLevel1 : styleLevel1Entry

    const styleLevelOtherEntry = String(parseFrontMatterEntry(frontmatter, 'header-numbering-style-level-other'))
    const styleLevelOther = (styleLevelOtherEntry !== '1' && styleLevelOtherEntry !== 'A') ? alternativeSettings.styleLevelOther : styleLevelOtherEntry

    const autoEntry = parseFrontMatterEntry(frontmatter, 'header-numbering-auto')
    const auto = (autoEntry !== true) ? false : autoEntry

    return { skipTopLevel, maxLevel, styleLevel1, styleLevelOther, auto }
  } else {
    return alternativeSettings
  }
}
