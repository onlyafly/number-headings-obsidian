import { EditorRange } from 'obsidian'
import { NumberingStyle } from './numberingTokens'
import { isValidNumberingStyleString, isValidSeparator, NumberHeadingsPluginSettings } from './settingsTypes'

export type SupportFlags = {
  alphabet: boolean,
  roman: boolean,
}

export function createSupportFlagsFromSettings (styleLevel1: string, styleLevelOther: string): SupportFlags {
  return {
    alphabet: styleLevel1 === 'A' || styleLevelOther === 'A',
    roman: styleLevel1 === 'I' || styleLevelOther === 'I'
  }
}

function getRegexForHeaderString (flags: SupportFlags): RegExp {
  if (flags.alphabet && flags.roman) {
    // Regex to match the heading prefix, including the space after the hash(es), but not the heading text
    return /^\s{0,4}#+( )?([0-9]+\.|[A-Z]\.|[IVXLCDM]+\.)*([0-9]+|[A-Z]|[IVXLCDM]+)?( )?[)—:.-]?( )+/g
  } else if (!flags.alphabet && flags.roman) {
    // Regex to match the heading prefix, including the space after the hash(es), but not the heading text
    return /^\s{0,4}#+( )?([0-9]+\.|[IVXLCDM]+\.)*([0-9]+|[IVXLCDM]+)?( )?[)—:.-]?( )+/g
  } else if (flags.alphabet && !flags.roman) {
    // Regex to match the heading prefix, including the space after the hash(es), but not the heading text
    return /^\s{0,4}#+( )?([0-9]+\.|[A-Z]\.)*([0-9]+|[A-Z])?( )?[)—:.-]?( )+/g
  } else if (!flags.alphabet && !flags.roman) {
    // Regex to match the heading prefix, including the space after the hash(es), but not the heading text
    return /^\s{0,4}#+( )?([0-9]+\.)*([0-9]+)?( )?[)—:.-]?( )+/g
  }

  throw new Error('Unexpected combination of support flags')
}

export function findRangeInHeaderString (lineText: string, lineNumber: number, flags: SupportFlags): EditorRange | undefined {
  const regex = getRegexForHeaderString(flags)

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
  // Parse the separator
  let partWithoutSeparator = part
  const potentialTwoCharSeparator = part.slice(-2)
  if (isValidSeparator(potentialTwoCharSeparator)) {
    settings.separator = potentialTwoCharSeparator
    partWithoutSeparator = part.slice(0, -2)
  } else {
    const potentialOneCharSeparator = part.slice(-1)
    if (isValidSeparator(potentialOneCharSeparator)) {
      settings.separator = potentialOneCharSeparator
      partWithoutSeparator = part.slice(0, -1)
    } else {
      settings.separator = ''
    }
  }

  // Parse the numbering style
  const descriptors = partWithoutSeparator.split('.')
  let firstNumberedDescriptor = 0

  // Handle the case where the first descriptor is an underscore
  if (descriptors.length > 1 && descriptors[0] === '_') {
    // The first descriptor is an instruction to skip top levels, so skip them
    settings.skipTopLevel = true
    firstNumberedDescriptor = 1
  } else {
    settings.skipTopLevel = false
  }

  if (descriptors.length - firstNumberedDescriptor >= 2) {
    const styleLevel1 = descriptors[firstNumberedDescriptor]
    if (isValidNumberingStyleString(styleLevel1)) {
      settings.styleLevel1 = styleLevel1 as NumberingStyle
    }
    const styleLevelOther = descriptors[firstNumberedDescriptor + 1]
    if (isValidNumberingStyleString(styleLevelOther)) {
      settings.styleLevelOther = styleLevelOther as NumberingStyle
    }
  }

  return settings
}
