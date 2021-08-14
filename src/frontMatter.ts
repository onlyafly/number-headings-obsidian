import { CachedMetadata, Editor, EditorPosition, FrontMatterCache, parseFrontMatterEntry } from 'obsidian'
import { DEFAULT_SETTINGS, isValidFlag, isValidLevelStyle, isValidMaxLevel, NumberHeadingsPluginSettings } from './settingsTypes'

function compactFrontMatterSettings (fm: FrontMatterCache): NumberHeadingsPluginSettings | undefined {
  const entry = parseFrontMatterEntry(fm, 'number headings')
  if (entry) {
    const entryString = String(entry)
    const parts = entryString.split(',')
    const settings: NumberHeadingsPluginSettings = { ...DEFAULT_SETTINGS }

    for (const part of parts) {
      const cleanPart = part.trim()
      if (cleanPart === 'auto') {
        settings.auto = true
      } else if (cleanPart.startsWith('max')) {
        const nstring = cleanPart.substring(4)
        const n = parseInt(nstring)
        if (isValidMaxLevel(n)) {
          settings.maxLevel = n
        }
      } else {
        const descriptors = cleanPart.split('.')
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
    const compactSettings = compactFrontMatterSettings(frontmatter)
    if (compactSettings !== undefined) return compactSettings

    // NOTE: some of the below keys are for backwards compatibility

    const skipTopLevelEntry = parseFrontMatterEntry(frontmatter, 'number-headings-skip-top-level') ?? parseFrontMatterEntry(frontmatter, 'header-numbering-skip-top-level')
    const skipTopLevel = isValidFlag(skipTopLevelEntry) ? skipTopLevelEntry : alternativeSettings.skipTopLevel

    const maxLevelEntry = parseFrontMatterEntry(frontmatter, 'number-headings-max-level') ?? parseFrontMatterEntry(frontmatter, 'header-numbering-max-level')
    const maxLevel = isValidMaxLevel(maxLevelEntry) ? maxLevelEntry : alternativeSettings.maxLevel

    const styleLevel1Entry = String(
      parseFrontMatterEntry(frontmatter, 'number-headings-style-level-1') ??
      parseFrontMatterEntry(frontmatter, 'header-numbering-style-level-1')
    )
    const styleLevel1 = isValidLevelStyle(styleLevel1Entry) ? styleLevel1Entry : alternativeSettings.styleLevel1

    const styleLevelOtherEntry = String(
      parseFrontMatterEntry(frontmatter, 'number-headings-style-level-other') ??
      parseFrontMatterEntry(frontmatter, 'header-numbering-style-level-other')
    )
    const styleLevelOther = isValidLevelStyle(styleLevelOtherEntry) ? styleLevelOtherEntry : alternativeSettings.styleLevelOther

    const autoEntry = parseFrontMatterEntry(frontmatter, 'number-headings-auto') ?? parseFrontMatterEntry(frontmatter, 'header-numbering-auto')
    const auto = isValidFlag(autoEntry) ? autoEntry : alternativeSettings.auto

    return { skipTopLevel, maxLevel, styleLevel1, styleLevelOther, auto }
  } else {
    return alternativeSettings
  }
}

function settingsToCompactFrontMatterValue (settings: NumberHeadingsPluginSettings): string {
  const autoPart = settings.auto ? 'auto, ' : ''
  const maxPart = (`max ${settings.maxLevel}, `)
  const skipTopLevelString = settings.skipTopLevel ? '_.' : ''
  const stylePart = `${skipTopLevelString}${settings.styleLevel1}.${settings.styleLevelOther}`
  return autoPart + maxPart + stylePart
}

function findLineWhichStartsWith (editor: Editor, search: string, afterLine: number): number | undefined {
  // Find the location of the frontmatter
  for (let i = afterLine; i < editor.lastLine(); i++) {
    const lineString = editor.getLine(i)
    if (lineString.startsWith(search)) {
      return i
    }
  }
  return undefined
}

export const saveSettingsToFrontMatter = (
  { frontmatter }: CachedMetadata,
  editor: Editor,
  settings: NumberHeadingsPluginSettings
): void => {
  if (frontmatter !== undefined) {
    // Front matter already exists, so we'll need to insert the settings into the front matter

    const frontMatterLine = frontmatter.position.start.line
    const v = settingsToCompactFrontMatterValue(settings)
    const frontMatterAdditions = `number headings: ${v}\n`

    if (frontmatter['number headings'] !== undefined) {
      // Key already present, replace it
      const keyLine = findLineWhichStartsWith(editor, 'number headings', frontMatterLine)
      if (keyLine === undefined) throw new Error('Number Headings Plugin: "number headings" key exists but not found.')
      const from: EditorPosition = { line: keyLine, ch: 0 }
      const to: EditorPosition = { line: keyLine + 1, ch: 0 }
      editor.replaceRange(frontMatterAdditions, from, to)
    } else {
      // Key not present, insert new key
      const from: EditorPosition = { line: frontMatterLine + 1, ch: 0 }
      const to: EditorPosition = { line: frontMatterLine + 1, ch: 0 }
      editor.replaceRange(frontMatterAdditions, from, to)
    }
  } else {
    // NOTE: Formatting below is very important!
    const v = settingsToCompactFrontMatterValue(settings)
    const newFrontMatter = `---\nnumber headings: ${v}\n---\n\n`
    const from: EditorPosition = { line: 0, ch: 0 }
    const to: EditorPosition = { line: 0, ch: 0 }
    editor.replaceRange(newFrontMatter, from, to)
    // Front matter does not exist, so we will create it from scratch
  }
}
