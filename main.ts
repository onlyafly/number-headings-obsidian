import { showJobDoneMessage } from 'messages'
import { getFrontMatterSettingsOrProvided as getFrontMatterSettingsOrAlternative, removeHeaderNumbering, replaceHeaderNumbering } from 'numbering'
import { App, MarkdownView, Plugin, PluginSettingTab, Setting } from 'obsidian'
import { DEFAULT_SETTINGS, HeaderNumberingPluginSettings } from 'settingsTypes'

class HeaderNumberingPluginSettingTab extends PluginSettingTab {
  plugin: HeaderNumberingPlugin

  constructor (app: App, plugin: HeaderNumberingPlugin) {
    super(app, plugin)
    this.plugin = plugin
  }

  display (): void {
    const { containerEl } = this

    containerEl.empty()

    containerEl.createEl('h2', { text: 'Header Numbering - Settings' })

    containerEl.createEl('div', { text: 'If the document has front matter defined for the below settings, the setting will be ignored. You can define front matter like this:' })

    containerEl.createEl('pre', {
      text: `    ---
    alias:
    - Example Alias
    tags:
    - space
    - science-fiction
    header-numbering-skip-top-level: true
    header-numbering-max-level: 3
    header-numbering-style-level-1: A
    header-numbering-style-level-other: 1
    ---`
    })

    new Setting(containerEl)
      .setName('Skip top heading level')
      .setDesc('If selected, numbering will not be applied to the top heading level. Defaults to false. To define this in your document front matter, use the header-numbering-skip-top-level key.')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.skipTopLevel)
        .setTooltip('Skip top heading level')
        .onChange(async (value) => {
          this.plugin.settings.skipTopLevel = value
          await this.plugin.saveSettings()
        }))

    new Setting(containerEl)
      .setName('Maximum heading level')
      .setDesc('Maximum heading level to number. Defaults to 10. To define this in your document front matter, use the header-numbering-max-level key.')
      .addSlider(slider => slider
        .setLimits(1, 10, 1)
        .setValue(this.plugin.settings.maxLevel)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.plugin.settings.maxLevel = value
          await this.plugin.saveSettings()
        }))

    new Setting(containerEl)
      .setName('Style for level 1 headings')
      .setDesc(`Defines the numbering style for level one headings. Valid values are 1 (for numbers) or A (for capital letters).
                Defaults to 1. To define this in your document front matter, use the header-numbering-style-level-1 key.`)
      .addText(text => text
        .setValue(this.plugin.settings.styleLevel1)
        .onChange(async (value) => {
          this.plugin.settings.styleLevel1 = value
          await this.plugin.saveSettings()
        }))

    new Setting(containerEl)
      .setName('Style for lower level headings (below level 1)')
      .setDesc(`Defines the numbering style for headings below level one. Valid values are 1 (for numbers) or A (for capital letters).
                Defaults to 1. To define this in your document front matter, use the header-numbering-style-level-other key.`)
      .addText(text => text
        .setValue(this.plugin.settings.styleLevelOther)
        .onChange(async (value) => {
          this.plugin.settings.styleLevelOther = value
          await this.plugin.saveSettings()
        }))
  }
}

export default class HeaderNumberingPlugin extends Plugin {
  settings: HeaderNumberingPluginSettings

  async onload () {
    // eslint-disable-next-line no-console
    console.info('Loading Header Numbering Plugin, version ' + this.manifest.version)

    await this.loadSettings()

    this.addCommand({
      id: 'number-headings',
      name: 'Number all headings in document',
      checkCallback: (checking: boolean) => {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView)
        if (activeView && activeView.file) {
          if (!checking) {
            const data = this.app.metadataCache.getFileCache(activeView.file) || {}
            const editor = activeView.editor
            const settings = getFrontMatterSettingsOrAlternative(data, this.settings)

            replaceHeaderNumbering(data, editor, settings)

            showJobDoneMessage(
              this.app,
              `Successfully updated all header numbering in the document, using the settings below. 
              See settings panel to change how headings are numbered, or use front matter
              (see settings panel).`,
              `
header-numbering-skip-top-level: ${settings.skipTopLevel}
header-numbering-max-level: ${settings.maxLevel}
header-numbering-style-level-1: ${settings.styleLevel1}
header-numbering-style-level-other: ${settings.styleLevelOther}
`
            )
          }

          return true
        }

        return false // This command is not available if the view is not selected
      }
    })

    this.addCommand({
      id: 'remove-number-headings',
      name: 'Remove numbering from all headings in document',
      checkCallback: (checking: boolean) => {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView)
        if (activeView && activeView.file) {
          if (!checking) {
            const editor = activeView.editor
            const data = this.app.metadataCache.getFileCache(activeView.file) || {}
            removeHeaderNumbering(data, editor)

            showJobDoneMessage(this.app, 'Successfully removed all header numbering in the document.', '')
          }

          return true
        }

        return false // This command is not available if the view is not selected
      }
    })

    this.addSettingTab(new HeaderNumberingPluginSettingTab(this.app, this))
  }

  async loadSettings () {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  async saveSettings () {
    await this.saveData(this.settings)
  }
}
