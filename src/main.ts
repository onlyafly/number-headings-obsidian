import { getViewInfo, isViewActive } from 'src/activeViewHelpers'
import { NumberingDoneConfig, showNumberingDoneMessage } from 'src/messages'
import { getFrontMatterSettingsOrAlternative, removeNumberHeadings, replaceNumberHeadings, saveSettingsToFrontMatter } from 'src/numbering'
import { App, Plugin, PluginSettingTab, Setting } from 'obsidian'
import { DEFAULT_SETTINGS, NumberHeadingsPluginSettings } from 'src/settingsTypes'

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
    - space
    - science-fiction
    number-headings-skip-top-level: true
    number-headings-max-level: 3
    number-headings-style-level-1: A
    number-headings-style-level-other: 1
    number-headings-auto: true
    ---`
    })

    new Setting(containerEl)
      .setName('Skip top heading level')
      .setDesc('If selected, numbering will not be applied to the top heading level. Use "number-headings-skip-top-level" to define in front matter.')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.skipTopLevel)
        .setTooltip('Skip top heading level')
        .onChange(async (value) => {
          this.plugin.settings.skipTopLevel = value
          await this.plugin.saveSettings()
        }))

    new Setting(containerEl)
      .setName('Maximum heading level')
      .setDesc('Maximum heading level to number. Use "number-headings-max-level" to define in front matter.')
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
      .setDesc(`Defines the numbering style for level one headings. Valid values are 1 (for numbers) or A (for capital letters).
                Use "number-headings-style-level-1" to define in front matter.`)
      .addText(text => text
        .setValue(this.plugin.settings.styleLevel1)
        .onChange(async (value) => {
          this.plugin.settings.styleLevel1 = value
          await this.plugin.saveSettings()
        }))

    new Setting(containerEl)
      .setName('Style for lower level headings (below level 1)')
      .setDesc(`Defines the numbering style for headings below level one. Valid values are 1 (for numbers) or A (for capital letters).
                Use "number-headings-style-level-other" to define in front matter.`)
      .addText(text => text
        .setValue(this.plugin.settings.styleLevelOther)
        .onChange(async (value) => {
          this.plugin.settings.styleLevelOther = value
          await this.plugin.saveSettings()
        }))

    new Setting(containerEl)
      .setName('Automatic numbering')
      .setDesc('Turns on automatic numbering. Use "number-headings-auto" to define in the front matter. Valid values are true or false.')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.auto)
        .setTooltip('Turn on automatic numbering')
        .onChange(async (value) => {
          this.plugin.settings.auto = value
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

          const saveSettingsCallback = (): void => {
            saveSettingsToFrontMatter(viewInfo.data, viewInfo.editor, settings)
          }
          const config: NumberingDoneConfig = {
            message: `Successfully updated all heading numbers in the document, using the settings below. 
              See settings panel to change how headings are numbered, or use front matter
              (see settings panel).`,
            preformattedMessage: `  number-headings-skip-top-level: ${settings.skipTopLevel}
  number-headings-max-level: ${settings.maxLevel}
  number-headings-style-level-1: ${settings.styleLevel1}
  number-headings-style-level-other: ${settings.styleLevelOther}`,
            saveSettingsCallback
          }
          showNumberingDoneMessage(this.app, config)
        }
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
