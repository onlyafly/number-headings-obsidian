import { EditorRange } from 'obsidian'
import { isValidLevelStyle, isValidSeparator, NumberHeadingsPluginSettings } from './settingsTypes'

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

export function updateSettingsFromFrontMatterFormatPart (part: string, settings: NumberHeadingsPluginSettings): NumberHeadingsPluginSettings {
  const lastChar = part[part.length - 1]
  let remainingPart = part
  if (isValidSeparator(lastChar)) {
    settings.separator = lastChar
    remainingPart = part.substring(0, part.length - 1)
  } else {
    settings.separator = ''
  }
  const descriptors = remainingPart.split('.')
  let firstNumberedDescriptor = 0
  if (descriptors.length > 1 && descriptors[0] === '_') {
    settings.skipTopLevel = true
    firstNumberedDescriptor = 1
  } else {
    settings.skipTopLevel = false
  }
  if (descriptors.length - firstNumberedDescriptor >= 2) {
    const styleLevel1 = descriptors[firstNumberedDescriptor]
    if (isValidLevelStyle(styleLevel1)) {
      settings.styleLevel1 = styleLevel1
    }
    const styleLevelOther = descriptors[firstNumberedDescriptor + 1]
    if (isValidLevelStyle(styleLevelOther)) {
      settings.styleLevelOther = styleLevelOther
    }
  }

  return settings
}
