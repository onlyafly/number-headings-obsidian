import { App, CachedMetadata, Editor, EditorPosition, MarkdownView, Modal, Plugin } from 'obsidian';

/* Unused feature: settings
interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}
*/

export default class MyPlugin extends Plugin {
	/* Unused feature: settings
	settings: MyPluginSettings;
	*/

	async onload() {
		console.log('loading plugin');

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
			// 	console.log('Simple Callback');
			// },
			checkCallback: (checking: boolean) => {
				const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (activeView && activeView.file) {

					if (!checking) {
						const editor = activeView.editor;
						const cursor = editor.getCursor();
						const data = this.app.metadataCache.getFileCache(activeView.file) || {};
						replaceHeaderNumbering(data, cursor, editor);

						showMessage(this.app)
					}

					return true;
				}

				return false; // This command is not available if the view is not selected
			}
		});

		/* Unused feature: settings
		this.addSettingTab(new SampleSettingTab(this.app, this));
		*/

		this.registerCodeMirror((cm: CodeMirror.Editor) => {
			console.log('codemirror', cm);
		});

		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click (from header numbering plugin)', evt);
		});

		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {
		console.log('unloading plugin');
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

function replaceHeaderNumbering(data: CachedMetadata, cursor: EditorPosition, editor: Editor) {
	console.log("start replaceHeaderNumbering")
	const x = "dude"
	editor.replaceRange(x, cursor);

	console.log("finished replaceHeaderNumbering")
}

function showMessage(app: App) {
	let leaf = app.workspace.activeLeaf;
	if (leaf) {
		new SampleModal(app).open();
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		let { contentEl } = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		let { contentEl } = this;
		contentEl.empty();
	}
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