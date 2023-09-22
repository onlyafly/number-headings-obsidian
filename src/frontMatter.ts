import { CachedMetadata, FileManager, FrontMatterCache, TFile, parseFrontMatterEntry } from 'obsidian'
import { NumberingStyle } from './numberingTokens'
import { DEFAULT_SETTINGS, NumberHeadingsPluginSettings, isValidContents, isValidFirstOrMaxLevel, isValidFlag, isValidNumberingStyleString, isValidNumberingValueString } from './settingsTypes'
import { updateSettingsFromFrontMatterFormatPart } from './textProcessing'

const AUTO_PART_KEY = 'auto'
const FIRST_LEVEL_PART_KEY = 'first-level'
const MAX_LEVEL_PART_KEY = 'max'
const CONTENTS_PART_KEY = 'contents'
const START_AT_PART_KEY = 'start-at'

function parseCompactFrontMatterSettings(fm: FrontMatterCache): NumberHeadingsPluginSettings | undefined {
  const entry = parseFrontMatterEntry(fm, 'number headings')
  if (entry) {
    const entryString = String(entry)
    const parts = entryString.split(',')
    let settings: NumberHeadingsPluginSettings = { ...DEFAULT_SETTINGS }

    for (const part of parts) {
      const trimmedPart = part.trim()
      if (trimmedPart.length === 0) continue

      if (trimmedPart === AUTO_PART_KEY) {
        // Parse auto numbering part
        settings.auto = true
      } else if (trimmedPart.startsWith(FIRST_LEVEL_PART_KEY)) {
        // Parse first level part
        const nstring = trimmedPart.substring(FIRST_LEVEL_PART_KEY.length + 1)
        const n = parseInt(nstring)
        if (isValidFirstOrMaxLevel(n)) {
          settings.firstLevel = n
        }
      } else if (trimmedPart.startsWith(MAX_LEVEL_PART_KEY)) {
        // Parse max level part
        const nstring = trimmedPart.substring(MAX_LEVEL_PART_KEY.length + 1)
        const n = parseInt(nstring)
        if (isValidFirstOrMaxLevel(n)) {
          settings.maxLevel = n
        }
      } else if (trimmedPart.startsWith(START_AT_PART_KEY)) {
        // Parse "start at" part
        const value = trimmedPart.substring(START_AT_PART_KEY.length + 1)
        if (isValidNumberingValueString(value)) {
          settings.startAt = value
        }
      } else if (trimmedPart.startsWith(CONTENTS_PART_KEY)) {
        if (trimmedPart.length <= CONTENTS_PART_KEY.length + 1) continue
        // Parse contents heading part
        const tocHeading = trimmedPart.substring(CONTENTS_PART_KEY.length + 1)
        if (isValidContents(tocHeading)) {
          settings.contents = tocHeading
        }
      } else {
        // Parse formatting part
        settings = updateSettingsFromFrontMatterFormatPart(trimmedPart, settings)
      }
    }

    return settings
  }

  return undefined
}

export const getFrontMatterSettingsOrAlternative = (
  { frontmatter }: CachedMetadata,
  alternativeSettings: NumberHeadingsPluginSettings
): NumberHeadingsPluginSettings => {
  if (frontmatter !== undefined) {
    const decompactedSettings = parseCompactFrontMatterSettings(frontmatter)
    if (decompactedSettings !== undefined) return decompactedSettings

    // NOTE: Everything below is for backwards compatibility only

    const skipTopLevelEntry = parseFrontMatterEntry(frontmatter, 'number-headings-skip-top-level') ?? parseFrontMatterEntry(frontmatter, 'header-numbering-skip-top-level')
    const skipTopLevel = isValidFlag(skipTopLevelEntry) ? skipTopLevelEntry : alternativeSettings.skipTopLevel

    const maxLevelEntry = parseFrontMatterEntry(frontmatter, 'number-headings-max-level') ?? parseFrontMatterEntry(frontmatter, 'header-numbering-max-level')
    const maxLevel = isValidFirstOrMaxLevel(maxLevelEntry) ? maxLevelEntry : alternativeSettings.maxLevel

    const styleLevel1Entry = String(
      parseFrontMatterEntry(frontmatter, 'number-headings-style-level-1') ??
      parseFrontMatterEntry(frontmatter, 'header-numbering-style-level-1')
    )
    const styleLevel1: NumberingStyle = isValidNumberingStyleString(styleLevel1Entry) ? styleLevel1Entry as NumberingStyle : alternativeSettings.styleLevel1

    const styleLevelOtherEntry = String(
      parseFrontMatterEntry(frontmatter, 'number-headings-style-level-other') ??
      parseFrontMatterEntry(frontmatter, 'header-numbering-style-level-other')
    )
    const styleLevelOther: NumberingStyle = isValidNumberingStyleString(styleLevelOtherEntry) ? styleLevelOtherEntry as NumberingStyle : alternativeSettings.styleLevelOther

    const autoEntry = parseFrontMatterEntry(frontmatter, 'number-headings-auto') ?? parseFrontMatterEntry(frontmatter, 'header-numbering-auto')
    const auto = isValidFlag(autoEntry) ? autoEntry : alternativeSettings.auto

    return { ...alternativeSettings, skipTopLevel, maxLevel, styleLevel1, styleLevelOther, auto }
  } else {
    return alternativeSettings
  }
}

function settingsToCompactFrontMatterValue(settings: NumberHeadingsPluginSettings): string {
  const autoPart = settings.auto ? 'auto, ' : ''
  const firstLevelPart = `first-level ${settings.firstLevel}, `
  const maxPart = `max ${settings.maxLevel}, `
  const contentsPart = settings.contents && settings.contents.length > 0 ? `contents ${settings.contents}, ` : ''
  const skipTopLevelString = settings.skipTopLevel ? '_.' : ''
  const stylePart = `${skipTopLevelString}${settings.styleLevel1}.${settings.styleLevelOther}${settings.separator}`
  const startAtPart = settings.startAt !== '' ? `start-at ${settings.startAt}, ` : ''
  return autoPart + firstLevelPart + maxPart + contentsPart + startAtPart + stylePart
}

export const saveSettingsToFrontMatter = (
  fileManager: FileManager,
  file: TFile,
  settings: NumberHeadingsPluginSettings
): void => {
  fileManager.processFrontMatter(file, frontmatter => {
    const v: string = settingsToCompactFrontMatterValue(settings)
    frontmatter['number headings'] = v
  })
}
