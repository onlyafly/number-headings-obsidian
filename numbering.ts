import { CachedMetadata, Editor, EditorRange, HeadingCache } from 'obsidian'

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

function makeNumberingString (numberingStack: number[]): string {
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
  const regex = /^#+ ([0-9.]+)?( )*/g
  const headerLineString = editor.getLine(heading.position.start.line)
  const matches = headerLineString.match(regex)

  if (matches.length !== 1) {
    // eslint-disable-next-line no-console
    console.log("Unexpected header format: '" + headerLineString + "'")
    return undefined
  }

  const match = matches[0]

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

export const replaceHeaderNumbering = (
  { headings = [] }: CachedMetadata,
  editor: Editor,
  skipTopLevel: boolean,
  maxLevel: number
) => {
  let previousLevel = 1
  const numberingStack: number[] = [0]

  if (skipTopLevel) {
    previousLevel = 2
  }

  for (const heading of headings) {
    // Update the numbering stack based on the level and previous level

    const level = heading.level

    // Remove any header numbering in these two cases:
    // 1. this is a top level and we are skipping top level headings
    // 2. this level is higher than the max level setting
    if ((skipTopLevel && level === 1) || (level > maxLevel)) {
      const prefixRange = getHeaderPrefixRange(editor, heading)
      const headerHashString = makeHeaderHashString(editor, heading)
      const prefixString = makeNumberingString([])
      editor.replaceRange(headerHashString + prefixString + ' ', prefixRange.from, prefixRange.to)
      continue
    }

    if (level === previousLevel) {
      const x = numberingStack.pop()
      numberingStack.push(x + 1)
    } else if (level < previousLevel) {
      for (let i = previousLevel; i > level; i--) {
        numberingStack.pop()
      }
      const x = numberingStack.pop()
      numberingStack.push(x + 1)
    } else if (level > previousLevel) {
      for (let i = previousLevel; i < level; i++) {
        numberingStack.push(1)
      }
    }

    // Set the previous level to this level for the next iteration
    previousLevel = level

    if (level > maxLevel) {
      // If we are above the max level, just don't number it
      continue
    }

    const prefixRange = getHeaderPrefixRange(editor, heading)
    const headerHashString = makeHeaderHashString(editor, heading)
    const prefixString = makeNumberingString(numberingStack)
    editor.replaceRange(headerHashString + prefixString + ' ', prefixRange.from, prefixRange.to)
  }
}
