import { App, Modal } from 'obsidian'

interface NumberDoneModalConfig {
  message: string
  preformattedMessage: string
}

class NumberingDoneModal extends Modal {
  config: NumberDoneModalConfig

  constructor (app: App, config: NumberDoneModalConfig) {
    super(app)
    this.config = config
  }

  onOpen () {
    const { contentEl, titleEl } = this
    titleEl.setText('Header Numbering - Successfully Completed')

    contentEl.createEl('div', { text: this.config.message })
    contentEl.createEl('pre', { text: this.config.preformattedMessage })

    contentEl.createEl('div', { text: "Do you want to save these settings in the document's front matter?", cls: 'header-numbering-question' })

    const containerForButtons = contentEl.createEl('div', { cls: 'header-numbering-button-container' })

    const noButton = containerForButtons.createEl('button', { })
    noButton.setText('No')
    noButton.onClickEvent((ev: MouseEvent) => {
      console.log('testing 123 no')
      return ev
    })

    const yesButton = containerForButtons.createEl('button', { })
    yesButton.setText('Yes, save settings in document')
    yesButton.onClickEvent((ev: MouseEvent) => {
      console.log('testing 123 yes')
      return ev
    })
  }

  onClose () {
    const { contentEl, titleEl } = this
    contentEl.empty()
    titleEl.empty()
  }
}

export function showNumberingDoneMessage (app: App, message: string, preformattedMessage: string) {
  const leaf = app.workspace.activeLeaf
  if (leaf) {
    const config = {
      message,
      preformattedMessage
    }
    new NumberingDoneModal(app, config).open()
  }
}
