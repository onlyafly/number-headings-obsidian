import { replaceHeaderNumbering } from 'numbering'
import { App, MarkdownView, Modal, Plugin } from 'obsidian'

/* Unused feature: settings
interface MyPluginSettings {
  mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
  mySetting: 'default'
}
*/

class JobDoneModal extends Modal {
  message: string

  constructor (app: App, message: string) {
    super(app)
    this.message = message
  }

  onOpen () {
    const { contentEl, titleEl } = this
    contentEl.setText(this.message)
    titleEl.setText('Header Numbering Plugin')
  }

  onClose () {
    const { contentEl, titleEl } = this
    contentEl.empty()
    titleEl.empty()
  }
}

function showJobDoneMessage (app: App, message: string) {
  const leaf = app.workspace.activeLeaf
  if (leaf) {
    new JobDoneModal(app, message).open()
  }
}

export default class MyPlugin extends Plugin {
  /* Unused feature: settings
  settings: MyPluginSettings;
  */

  async onload () {
    // eslint-disable-next-line no-console
    console.log('loading HN plugin, v0.0.1.11')

    /* Unused feature: settings
    await this.loadSettings();
    */

    /* Unused feature: ribbon icon
    this.addRibbonIcon('dice', 'Sample Plugin', () => {
      new Notice('This is a notice!');
    });
    */

    /* Unused feature: status text
    this.addStatusBarItem().setText('Status Bar Text');
    */

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

    /* Unused feature: settings
    this.addSettingTab(new SampleSettingTab(this.app, this));
    */
  }

  onunload () {
    // DELETE console.log('unloading plugin');
  }

  /* Unused feature: settings
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
  */
}

/* Unused feature: settings
class SampleSettingTab extends PluginSettingTab {
  plugin: MyPlugin;

  constructor(app: App, plugin: MyPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    let { containerEl } = this;

    containerEl.empty();

    containerEl.createEl('h2', { text: 'Settings for my awesome plugin.' });

    new Setting(containerEl)
      .setName('Setting #1')
      .setDesc('It\'s a secret')
      .addText(text => text
        .setPlaceholder('Enter your secret')
        .setValue('')
        .onChange(async (value) => {
          console.log('Secret: ' + value);
          this.plugin.settings.mySetting = value;
          await this.plugin.saveSettings();
        }));
  }
}
*/
