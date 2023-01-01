import { App, Plugin, PluginSettingTab, Setting } from 'obsidian'
import { getViewInfo, isViewActive } from './activeViewHelpers'
import { getFrontMatterSettingsOrAlternative, saveSettingsToFrontMatter } from './frontMatter'
import { showNumberingDoneMessage } from './messages'
import { removeHeadingNumbering, updateHeadingNumbering, updateTableOfContents } from './numbering'
import { NumberingStyle } from './numberingTokens'
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
    number headings: first-level 1, start-at 2, max 6, 1.1, auto, contents ^toc
    ---`
    })

    containerEl.createEl('div', {
      text: `
      The 'number headings' front matter key is used to store numbering settings specific to the file. There are four possible options
      in the value to the right of the colon, separated by commas.
    `
    })

    const ul = containerEl.createEl('ul', {})

    const li0 = ul.createEl('li', { })
    li0.createEl('b', { text: 'Automatic numbering' })
    li0.createEl('span', { text: ': If \'auto\' appears, the document will be automatically numbered.' })

    const li1 = ul.createEl('li', { })
    li1.createEl('b', { text: 'First level to number' })
    li1.createEl('span', { text: ': If \'first-level 2\' appears, the numbering will start at the second level' })

    const li2 = ul.createEl('li', { })
    li2.createEl('b', { text: 'Start numbering first heading at' })
    li2.createEl('span', { text: ': If \'start-at C\' appears, the numbering of the first level will start at C, instead of A' })

    const li3 = ul.createEl('li', { })
    li3.createEl('b', { text: 'Maximum level to number' })
    li3.createEl('span', { text: ': If \'max 6\' appears, the headings above level 6 will be skipped.' })

    const li4 = ul.createEl('li', { })
    li4.createEl('b', { text: 'Table of contents anchor' })
    li4.createEl('span', { text: ': If \'contents ^toc\' appears, the heading that ends with the anchor ^toc will have a table of contents inserted beneath it.' })

    const li5 = ul.createEl('li', { })
    li5.createEl('b', { text: 'Numbering style' })
    li5.createEl('span', {
      text: `:
      A style text like '1.1', 'A.1', or '_.1.1' tells the plugin how to format the headings.
      If a style string ends with '.' (a dot), ':' (a colon), '-' (a dash), or '—' (an emdash), the heading numbers will be separated from the heading title
      with that symbol.`
    })

    const ul3 = li5.createEl('ul', {})
    ul3.createEl('li', {
      text: `      
      For example, '1.1' means both top level and other headings will be numbered starting from '1'.
    `
    })
    ul3.createEl('li', {
      text: `      
      For example, 'A.1' means top level headings will be numbered starting from 'A'.
    `
    })
    ul3.createEl('li', {
      text: `      
      For example, '_.A.1' means top level headings will NOT be numbered, but the next levels will be numbered with letters and numbers.
    `
    })
    ul3.createEl('li', {
      text: `      
      For example, '1.1:' means headings will look like '## 2.4: Example Heading'
    `
    })
    ul3.createEl('li', {
      text: `      
      For example, 'A.1-' means headings will look like '## B.5- Example Heading'
    `
    })
    ul3.createEl('li', {
      text: `      
      For example, 'I.A —' means headings will look like '## IV.A — Example Heading' (with Roman numerals)
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
      .setName('First heading level')
      .setDesc('First heading level to number.')
      .addSlider(slider => slider
        .setLimits(1, 6, 1)
        .setValue(this.plugin.settings.firstLevel)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.plugin.settings.firstLevel = value
          await this.plugin.saveSettings()
        }))

    new Setting(containerEl)
      .setName('Start numbering at')
      .setDesc('Start numbering the first heading level from this value.')
      .addText(text => text
        .setValue(this.plugin.settings.startAt)
        .onChange(async (value) => {
          this.plugin.settings.startAt = value
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
      .setDesc('Defines the numbering style for level one headings. Valid values are 1 (for numbers) or A (for capital letters) or I (for Roman numerals).')
      .addText(text => text
        .setValue(this.plugin.settings.styleLevel1)
        .onChange(async (value) => {
          this.plugin.settings.styleLevel1 = value as NumberingStyle
          await this.plugin.saveSettings()
        }))

    new Setting(containerEl)
      .setName('Style for lower level headings (below level 1)')
      .setDesc('Defines the numbering style for headings below level one. Valid values are 1 (for numbers) or A (for capital letters) or I (for Roman numerals).')
      .addText(text => text
        .setValue(this.plugin.settings.styleLevelOther)
        .onChange(async (value) => {
          this.plugin.settings.styleLevelOther = value as NumberingStyle
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
      .setDesc('Defines the separator style between the heading number and the heading text. Valid values are : (colon) or . (dot) or - (dash) or — (emdash). You can also leave it blank for no separator, or have a space before the separator.')
      .addText(text => text
        .setValue(this.plugin.settings.separator)
        .onChange(async (value) => {
          this.plugin.settings.separator = value
          await this.plugin.saveSettings()
        }))

    new Setting(containerEl)
      .setName('Table of Contents Anchor')
      .setDesc('Anchor which labels the header where a table of contents should be inserted. The anchor should be added at the end of a header. For example, ^toc.')
      .addText(text => text
        .setValue(this.plugin.settings.contents)
        .onChange(async (value) => {
          this.plugin.settings.contents = value
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
      id: 'number-headings-with-options',
      name: 'Number all headings in document (and show options)',
      checkCallback: (checking: boolean) => {
        if (checking) return isViewActive(this.app)

        const viewInfo = getViewInfo(this.app)
        if (viewInfo) {
          const settings = getFrontMatterSettingsOrAlternative(viewInfo.data, this.settings)
          updateHeadingNumbering(viewInfo, settings)
          setTimeout(() => {
            // HACK: This must happen after a timeout so that there is time for the editor transaction to complete
            const postNumberingViewInfo = getViewInfo(this.app)
            updateTableOfContents(postNumberingViewInfo, settings)
          }, 3000)

          showNumberingDoneMessage(this.app, settings, viewInfo)
        }

        return false
      }
    })

    this.addCommand({
      id: 'number-headings',
      name: 'Number all headings in document',
      checkCallback: (checking: boolean) => {
        if (checking) return isViewActive(this.app)

        const viewInfo = getViewInfo(this.app)
        if (viewInfo) {
          const settings = getFrontMatterSettingsOrAlternative(viewInfo.data, this.settings)
          updateHeadingNumbering(viewInfo, settings)
          setTimeout(() => {
            // HACK: This must happen after a timeout so that there is time for the editor transaction to complete
            const postNumberingViewInfo = getViewInfo(this.app)
            updateTableOfContents(postNumberingViewInfo, settings)
          }, 3000)

          // NOTE: The line below is intentionally commented out, since this command is the same as
          //       the above command, except for this line
          // showNumberingDoneMessage(this.app, settings, viewInfo)
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
        removeHeadingNumbering(viewInfo)

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
          updateHeadingNumbering(viewInfo, settings)
          setTimeout(() => {
            // HACK: This must happen after a timeout so that there is time for the editor transaction to complete
            const postNumberingViewInfo = getViewInfo(this.app)
            updateTableOfContents(postNumberingViewInfo, settings)
          }, 3000)
          // eslint-disable-next-line no-console
          console.log('Number Headings Plugin: Automatically numbered document')
        }
      }
    }, 10 * 1000))
  }

  async loadSettings (): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  async saveSettings (): Promise<void> {
    await this.saveData(this.settings)
  }
}
