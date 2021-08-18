# Number Headings Plugin for Obsidian

*(I recently renamed this plugin from `header-numbering-obsidian` to `number-headings-obsidian` to be compatible with Obsidian's naming, as recommended by Obsidian's authors.)*

Numbers headings in a doc with outline style numbering. For example, "1.1.2".

## How to install

There are two ways to get the plugin:

1. Install the latest release from Obsidian directly.
2. Unzip the most recent release into your `<vault>/.obsidian/plugins/` folder. You can find the latest release at <https://github.com/onlyafly/number-headings-obsidian/releases/latest>.

After you have installed the plugin, make sure that the switch for "Number Headings" is turned on.

You will see this plugin's commands in the command palette, by typing `CMD + P`.

You can also assign the commands to hotkeys for easy usage.

## How to use the plugin

| Action                                          | Hotkey          |
| ----------------------------------------------- | --------------- |
| Number all headings in document                 | None by default |
| Remove numbering from all headings in document  | None by default |
| Save settings to front matter                   | None by default |

## Version History

### 1.7.1 (August 18, 2021)

* Fixed bug where skipped headings might have separators incorrectly inserted.

### 1.7.0 (August 18, 2021)

* Added support for custom separators between the heading numbering and the heading text.

### 1.6.1 (August 15, 2021)

* Improved how headings are inserted, so that the undo history is not polluted with too many irrelevant changes.

### 1.6.0 (August 14, 2021)

* Simplified the front matter settings to use a single key

### 1.5.1 (August 14, 2021)

* Fixed some bugs where "undefined" sometimes got printed at the start of lines after user removed a heading

## Credits

I was inspired partially by the Obsidian plugin <https://github.com/hipstersmoothie/obsidian-plugin-toc> and some of the code logic is descended from that plugin. Thanks!

## Developing the plugin

### How to setup your development environment

1. Clone your repo to a local development folder. For convenience, you can place this folder in your `.obsidian/plugins/your-plugin-name` folder.
2. Install NodeJS, then run `npm i` in the command line under your repo folder.
3. Run `make build` to compile your plugin from `main.ts` to `main.js`.
4. Make changes to `main.ts` (or create new `.ts` files). Those changes should be automatically compiled into `main.js`.
5. Reload Obsidian to load the new version of your plugin.
6. Enable plugin in settings window.
7. For updates to the Obsidian API run `npm update` in the command line under your repo folder.

### Releasing new releases

* Update your `manifest.json` with your new version number, such as `1.0.1`, and the minimum Obsidian version required for your latest release.
* Update your `versions.json` file with `"new-plugin-version": "minimum-obsidian-version"` so older versions of Obsidian can download an older version of your plugin that's compatible.
* Create new GitHub release using your new version number as the "Tag version". Use the exact version number, don't include a prefix `v`. See here for an example: <https://github.com/obsidianmd/obsidian-sample-plugin/releases>
* Upload the files `manifest.json`, `main.js`, `styles.css` as binary attachments.
* Publish the release.

### Adding your plugin to the community plugin list

* Publish an initial version.
* Make sure you have a `README.md` file in the root of your repo.
* Make a pull request at <https://github.com/obsidianmd/obsidian-releases> to add your plugin.

### Manually installing the plugin

* Copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/your-plugin-id/`.

### Obsidian API Documentation

See <https://github.com/obsidianmd/obsidian-api>
