import { App, Modal } from 'obsidian'
import { ViewInfo } from './activeViewHelpers'
import { saveSettingsToFrontMatter } from './frontMatter'
import { NumberHeadingsPluginSettings } from './settingsTypes'

export interface NumberingDoneConfig {
  message: string
  preformattedMessage: string
  saveSettingsCallback: (shouldAddAutoFlag: boolean) => void
}

class NumberingDoneModal extends Modal {
  config: NumberingDoneConfig

  constructor (app: App, config: NumberingDoneConfig) {
    super(app)
    this.config = config
  }

  onOpen (): void {
    const { contentEl, titleEl } = this
    titleEl.setText('Number Headings - Successfully Completed')

    contentEl.createEl('div', { text: this.config.message })
    contentEl.createEl('pre', { text: this.config.preformattedMessage })

    contentEl.createEl('div', { text: "Do you want to save these settings in the document's front matter?", cls: 'number-headings-question' })

    const containerForButtons = contentEl.createEl('div', { cls: 'number-headings-button-container' })

    const noButton = containerForButtons.createEl('button', { })
    noButton.setText('No')
    noButton.onClickEvent((ev: MouseEvent) => {
      this.close()
      return ev
    })

    const yesButton = containerForButtons.createEl('button', { })
    yesButton.setText('Yes, save settings in document')
    yesButton.onClickEvent((ev: MouseEvent) => {
      this.config.saveSettingsCallback(false)
      this.close()
      return ev
    })

    const yesAndAutoButton = containerForButtons.createEl('button', { })
    yesAndAutoButton.setText('Yes, save settings in document, and automatically number')
    yesAndAutoButton.onClickEvent((ev: MouseEvent) => {
      this.config.saveSettingsCallback(true)
      this.close()
      return ev
    })
  }

  onClose (): void {
    const { contentEl, titleEl } = this
    contentEl.empty()
    titleEl.empty()
  }
}

export function showNumberingDoneMessage (app: App, settings: NumberHeadingsPluginSettings, viewInfo: ViewInfo): void {
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
First heading level: ${settings.firstLevel}
Maximum heading level: ${settings.maxLevel}
Style for level 1 headings: ${settings.styleLevel1}
Style for lower level headings (below level 1): ${settings.styleLevelOther}
Separator: ${settings.separator}
Table of Contents Anchor: ${settings.contents}`,
    saveSettingsCallback
  }

  const leaf = app.workspace.activeLeaf
  if (leaf) {
    new NumberingDoneModal(app, config).open()
  }
}
