import { CachedMetadata, Editor } from 'obsidian'

function makeNumberingString (numberingStack: number[]): string {
  let builder = ''

  for (let i = 0; i < numberingStack.length; i++) {
    if (i !== 0) {
      builder += '.'
    }
    builder += numberingStack[i].toString()
  }

  const headerHashes = '#'.repeat(numberingStack.length)

  return headerHashes + ' ' + builder
}

export const replaceHeaderNumbering = (
  { headings = [] }: CachedMetadata,
  editor: Editor
) => {
  let previousLevel = 1
  const numberingStack: number[] = [0]

  for (const heading of headings) {
    // Update the numbering stack based on the level and previous level

    const level = heading.level

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

    const regex = /^#+ ([0-9.]+)?( )*/g
    const headerLineString = editor.getLine(heading.position.start.line)
    const matches = headerLineString.match(regex)

    if (matches.length !== 1) {
      // eslint-disable-next-line no-console
      console.log("Unexpected header format: '" + headerLineString + "'")
      continue
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

    const numberingString = makeNumberingString(numberingStack)
    editor.replaceRange(numberingString + ' ', from, to)
  }
}
