import { App, Modal } from 'obsidian'

class JobDoneModal extends Modal {
  message: string
  preformattedMessage: string

  constructor (app: App, message: string, preformattedMessage: string) {
    super(app)
    this.message = message
    this.preformattedMessage = preformattedMessage
  }

  onOpen () {
    const { contentEl, titleEl } = this
    titleEl.setText('Header Numbering Plugin')

    contentEl.createEl('div', { text: this.message })
    contentEl.createEl('pre', { text: this.preformattedMessage })
  }

  onClose () {
    const { contentEl, titleEl } = this
    contentEl.empty()
    titleEl.empty()
  }
}

export function showJobDoneMessage (app: App, message: string, preformattedMessage: string) {
  const leaf = app.workspace.activeLeaf
  if (leaf) {
    new JobDoneModal(app, message, preformattedMessage).open()
  }
}
