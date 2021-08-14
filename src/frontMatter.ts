import { CachedMetadata, Editor, EditorPosition, parseFrontMatterEntry } from 'obsidian'
import { NumberHeadingsPluginSettings } from './settingsTypes'

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
): void => {
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
