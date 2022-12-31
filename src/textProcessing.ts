import { EditorRange } from 'obsidian'

export function findRangeInHeaderString (lineText: string, lineNumber: number): EditorRange | undefined {
  // Regex to match the heading prefix, including the space after the hash(es), but not the heading text
  const regex = /^\s{0,4}#+( )?([0-9]+\.|[A-Z]\.)*([0-9]+|[A-Z])?[:.-]?( )+/g

  if (!lineText) return undefined

  const matches = lineText.match(regex)

  if (matches && matches.length !== 1) {
    // eslint-disable-next-line no-console
    console.log("Unexpected heading format: '" + lineText + "'")
    return undefined
  }

  const match = matches ? matches[0] : ''

  const from = {
    line: lineNumber,
    ch: 0
  }
  const to = {
    line: lineNumber,
    ch: match.length
  }

  return { from, to }
}
