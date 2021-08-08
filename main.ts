import { showJobDoneMessage } from 'messages'
import { replaceHeaderNumbering } from 'numbering'
import { App, MarkdownView, Plugin, PluginSettingTab, Setting } from 'obsidian'

interface HeaderNumberingPluginSettings {
  skipTopLevel: boolean,
  maxLevel: number,
}

const DEFAULT_SETTINGS: HeaderNumberingPluginSettings = {
  skipTopLevel: false,
  maxLevel: 10
}

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

    new Setting(containerEl)
      .setName('Skip top heading level')
      .setDesc('If selected, numbering will not be applied to the top heading level. Defaults to false.')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.skipTopLevel)
        .setTooltip('Skip top heading level')
        .onChange(async (value) => {
          this.plugin.settings.skipTopLevel = value
          await this.plugin.saveSettings()
        }))

    new Setting(containerEl)
      .setName('Maximum heading level')
      .setDesc('Maximum heading level to number. Defaults to 10.')
      .addSlider(slider => slider
        .setLimits(1, 10, 1)
        .setValue(this.plugin.settings.maxLevel)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.plugin.settings.maxLevel = value
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
            const editor = activeView.editor
            const data = this.app.metadataCache.getFileCache(activeView.file) || {}
            replaceHeaderNumbering(data, editor, this.settings.skipTopLevel, this.settings.maxLevel)

            showJobDoneMessage(this.app, 'Successfully updated all header numbering in the document. See settings panel to change how headings are numbered.')
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
