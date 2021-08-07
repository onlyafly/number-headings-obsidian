import { showJobDoneMessage } from 'messages'
import { replaceHeaderNumbering } from 'numbering'
import { App, MarkdownView, Plugin, PluginSettingTab, Setting } from 'obsidian'

interface MyPluginSettings {
  mySetting: string
}

const DEFAULT_SETTINGS: MyPluginSettings = {
  mySetting: 'default'
}

class SampleSettingTab extends PluginSettingTab {
  plugin: HeaderNumberingPlugin

  constructor (app: App, plugin: HeaderNumberingPlugin) {
    super(app, plugin)
    this.plugin = plugin
  }

  display (): void {
    const { containerEl } = this

    containerEl.empty()

    containerEl.createEl('h2', { text: 'Settings for my awesome plugin.' })

    new Setting(containerEl)
      .setName('Setting #1')
      .setDesc('It\'s a secret')
      .addText(text => text
        .setPlaceholder('Enter your secret')
        .setValue('')
        .onChange(async (value) => {
          // DELETE console.log('Secret: ' + value)
          this.plugin.settings.mySetting = value
          await this.plugin.saveSettings()
        }))
  }
}

export default class HeaderNumberingPlugin extends Plugin {
  settings: MyPluginSettings

  async onload () {
    // eslint-disable-next-line no-console
    console.log('loading HN plugin, v0.0.1.11')

    await this.loadSettings()

    this.addCommand({
      id: 'number-headings',
      name: 'Number Headings',
      // callback: () => {
      //   console.log('Simple Callback');
      // },
      checkCallback: (checking: boolean) => {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView)
        if (activeView && activeView.file) {
          if (!checking) {
            const editor = activeView.editor
            const data = this.app.metadataCache.getFileCache(activeView.file) || {}
            replaceHeaderNumbering(data, editor)

            showJobDoneMessage(this.app, 'Successfully updated all header numbering in the document.')
          }

          return true
        }

        return false // This command is not available if the view is not selected
      }
    })

    this.addSettingTab(new SampleSettingTab(this.app, this))
  }

  async loadSettings () {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  async saveSettings () {
    await this.saveData(this.settings)
  }
}
