import { App, Plugin, PluginSettingTab, Setting } from 'obsidian'
import { getViewInfo, isViewActive } from './activeViewHelpers'
import { getFrontMatterSettingsOrAlternative, saveSettingsToFrontMatter } from './frontMatter'
import { NumberingDoneConfig, showNumberingDoneMessage } from './messages'
import { removeNumberHeadings, replaceNumberHeadings } from './numbering'
import { DEFAULT_SETTINGS, NumberHeadingsPluginSettings } from './settingsTypes'

class NumberHeadingsPluginSettingTab extends PluginSettingTab {
  plugin: NumberHeadingsPlugin

  constructor (app: App, plugin: NumberHeadingsPlugin) {
    super(app, plugin)
    this.plugin = plugin
  }

  display (): void {
    const { containerEl } = this

    containerEl.empty()

    containerEl.createEl('h2', { text: 'Number Headings - Settings' })

    containerEl.createEl('div', { text: 'To add numbering to your document, bring up the command window (on Mac, type CMD+P), and then type "Number Headings" to see a list of available commands.' })

    containerEl.createEl('br', {})

    containerEl.createEl('div', { text: 'If the document has front matter defined with the below settings, the project-wide settings defined on this screen will be ignored. You can define front matter like this:' })

    containerEl.createEl('pre', {
      text: `    ---
    alias:
    - Example Alias
    tags:
    - example-tag
    number headings: max 6, 1.1, auto
    ---`
    })

    containerEl.createEl('div', {
      text: `
      The 'number-headings' front matter key is used to store numbering settings specific to the file. There are three settings
      in the value to the right of the colon, separated by commas.
    `
    })

    const ul = containerEl.createEl('ul', {})
    ul.createEl('li', {
      text: `
      If 'auto' appears there, the document will be automatically numbered.
    `
    })
    ul.createEl('li', {
      text: `
      If 'max 6' appears, the headings above level 6 will be skipped.
    `
    })
    ul.createEl('li', {
      text: `
      A style text like '1.1', 'A.1', or '_.1.1' tells the plugin how to format the headings.
      For example, '1.1' means both top level and other headings will be numbered starting from '1'.
      For example, 'A.1' means top level headings will be numbered starting from 'A'.
      For example, '_.A.1' means top level headings will NOT be numbered, but the next levels will be numbered with letters and numbers.
    `
    })
    ul.createEl('li', {
      text: `
      If a style string ends with '.' (a dot), ':' (a colon), or '-' (a dash), the heading numnbers will be separated from the heading title
      with that symbol.
      For example, '1.1:' means headings will look like '## 2.4: Example Heading'
      For example, 'A.1-' means headings will look like '## B.5- Example Heading'
    `
    })

    new Setting(containerEl)
      .setName('Skip top heading level')
      .setDesc('If selected, numbering will not be applied to the top heading level.')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.skipTopLevel)
        .setTooltip('Skip top heading level')
        .onChange(async (value) => {
          this.plugin.settings.skipTopLevel = value
          await this.plugin.saveSettings()
        }))

    new Setting(containerEl)
      .setName('Maximum heading level')
      .setDesc('Maximum heading level to number.')
      .addSlider(slider => slider
        .setLimits(1, 6, 1)
        .setValue(this.plugin.settings.maxLevel)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.plugin.settings.maxLevel = value
          await this.plugin.saveSettings()
        }))

    new Setting(containerEl)
      .setName('Style for level 1 headings')
      .setDesc('Defines the numbering style for level one headings. Valid values are 1 (for numbers) or A (for capital letters).')
      .addText(text => text
        .setValue(this.plugin.settings.styleLevel1)
        .onChange(async (value) => {
          this.plugin.settings.styleLevel1 = value
          await this.plugin.saveSettings()
        }))

    new Setting(containerEl)
      .setName('Style for lower level headings (below level 1)')
      .setDesc('Defines the numbering style for headings below level one. Valid values are 1 (for numbers) or A (for capital letters).')
      .addText(text => text
        .setValue(this.plugin.settings.styleLevelOther)
        .onChange(async (value) => {
          this.plugin.settings.styleLevelOther = value
          await this.plugin.saveSettings()
        }))

    new Setting(containerEl)
      .setName('Automatic numbering')
      .setDesc('Turns on automatic numbering of documents.')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.auto)
        .setTooltip('Turn on automatic numbering')
        .onChange(async (value) => {
          this.plugin.settings.auto = value
          await this.plugin.saveSettings()
        }))

    new Setting(containerEl)
      .setName('Separator style')
      .setDesc('Defines the separator style between the heading number and the heading text. Valid values are : (colon) or . (dot) or - (dash). You can also leave it blank for no separator.')
      .addText(text => text
        .setValue(this.plugin.settings.separator)
        .onChange(async (value) => {
          this.plugin.settings.separator = value
          await this.plugin.saveSettings()
        }))
  }
}

export default class NumberHeadingsPlugin extends Plugin {
  settings!: NumberHeadingsPluginSettings

  async onload (): Promise<void> {
    // eslint-disable-next-line no-console
    console.info('Loading Number Headings Plugin, version ' + this.manifest.version)

    await this.loadSettings()

    this.addCommand({
      id: 'number-headings',
      name: 'Number all headings in document',
      checkCallback: (checking: boolean) => {
        if (checking) return isViewActive(this.app)

        const viewInfo = getViewInfo(this.app)
        if (viewInfo) {
          const settings = getFrontMatterSettingsOrAlternative(viewInfo.data, this.settings)
          replaceNumberHeadings(viewInfo.data, viewInfo.editor, settings)

          const saveSettingsCallback = (shouldAddAutoFlag: boolean): void => {
            const tweakedSettings = { ...settings }
            if (shouldAddAutoFlag) tweakedSettings.auto = true
            saveSettingsToFrontMatter(viewInfo.data, viewInfo.editor, tweakedSettings)
          }
          const config: NumberingDoneConfig = {
            message: `Successfully updated all heading numbers in the document, using the settings below. 
              See settings panel to change how headings are numbered, or use front matter
              (see settings panel).`,
            preformattedMessage: `  Skip top heading level: ${settings.skipTopLevel}
  Maximum heading level: ${settings.maxLevel}
  Style for level 1 headings: ${settings.styleLevel1}
  Style for lower level headings (below level 1): ${settings.styleLevelOther}
  Separator: ${settings.separator}`,
            saveSettingsCallback
          }
          showNumberingDoneMessage(this.app, config)
        }

        return false
      }
    })

    this.addCommand({
      id: 'remove-number-headings',
      name: 'Remove numbering from all headings in document',
      checkCallback: (checking: boolean) => {
        if (checking) return isViewActive(this.app)

        const viewInfo = getViewInfo(this.app)
        if (viewInfo) {
          removeNumberHeadings(viewInfo.data, viewInfo.editor)
        }

        return true
      }
    })

    this.addCommand({
      id: 'save-settings-to-front-matter',
      name: 'Save settings to front matter',
      checkCallback: (checking: boolean) => {
        if (checking) return isViewActive(this.app)

        const viewInfo = getViewInfo(this.app)
        if (viewInfo) {
          const settings = getFrontMatterSettingsOrAlternative(viewInfo.data, this.settings)
          saveSettingsToFrontMatter(viewInfo.data, viewInfo.editor, settings)
        }

        return false
      }
    })

    this.addSettingTab(new NumberHeadingsPluginSettingTab(this.app, this))

    this.registerInterval(window.setInterval(() => {
      const viewInfo = getViewInfo(this.app)
      if (viewInfo) {
        const settings = getFrontMatterSettingsOrAlternative(viewInfo.data, this.settings)

        if (settings.auto) {
          replaceNumberHeadings(viewInfo.data, viewInfo.editor, settings)
          // eslint-disable-next-line no-console
          console.log('Number Headings Plugin: automatically numbered document')
        }
      }
    }, 5 * 1000))
  }

  async loadSettings (): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  async saveSettings (): Promise<void> {
    await this.saveData(this.settings)
  }
}
