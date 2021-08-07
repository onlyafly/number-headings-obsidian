import { App, Modal } from 'obsidian'

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

export function showJobDoneMessage (app: App, message: string) {
  const leaf = app.workspace.activeLeaf
  if (leaf) {
    new JobDoneModal(app, message).open()
  }
}
