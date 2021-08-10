# Header Numbering Plugin for Obsidian

Numbers headings in a doc with outline style numbering. For example, "1.1.2".

## How to install

There are two ways to get the plugin:

1. Install the latest release from Obsidian directly.
2. Unzip the most recent release into your `<vault>/.obsidian/plugins/` folder. You can find the latest release at <https://github.com/onlyafly/header-numbering-obsidian/releases/latest>.

After you have installed the plugin, make sure that the switch for "Header Numbering" is turned on.

You will see this plugin's commands in the command palette, by typing `CMD + P`.

You can also assign the commands to hotkeys for easy usage.

## How to use the plugin

| Action                                          | Hotkey          |
| ----------------------------------------------- | --------------- |
| Number all headings in document                 | None by default |
| Remove numbering from all headings in document  | None by default |
| Save settings to front matter                   | None by default |

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

- Update your `manifest.json` with your new version number, such as `1.0.1`, and the minimum Obsidian version required for your latest release.
- Update your `versions.json` file with `"new-plugin-version": "minimum-obsidian-version"` so older versions of Obsidian can download an older version of your plugin that's compatible.
- Create new GitHub release using your new version number as the "Tag version". Use the exact version number, don't include a prefix `v`. See here for an example: <https://github.com/obsidianmd/obsidian-sample-plugin/releases>
- Upload the files `manifest.json`, `main.js`, `styles.css` as binary attachments.
- Publish the release.

### Adding your plugin to the community plugin list

- Publish an initial version.
- Make sure you have a `README.md` file in the root of your repo.
- Make a pull request at <https://github.com/obsidianmd/obsidian-releases> to add your plugin.

### Manually installing the plugin

- Copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/your-plugin-id/`.

### API Documentation

See <https://github.com/obsidianmd/obsidian-api>
