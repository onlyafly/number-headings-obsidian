# Number Headings Plugin for Obsidian

Add numbers to headings in a doc with outline style numbering. For example, "1.1.2".

## How to install

There are two ways to get the plugin:

1. Install the latest release from Obsidian directly. Go to Settings -> Community Plugins -> Browse.
2. Unzip the most recent release into your `<vault>/.obsidian/plugins/` folder. You can find the latest release at <https://github.com/onlyafly/number-headings-obsidian/releases/latest>.

After you have installed the plugin, make sure that the switch for "Number Headings" is turned on.

## How to use the plugin

To use this plugin:

1. Open the command palette (type `CMD + P` on Mac or its equivalent on other platforms).
2. Start typing the name of one of the actions. See below:

| Action                                          | Hotkey          |
| ----------------------------------------------- | --------------- |
| Number all headings in document                 | None by default |
| Remove numbering from all headings in document  | None by default |
| Save settings to front matter                   | None by default |

You can also assign the commands to hotkeys for easy usage.

See the settings page for the plugin for detailed instructions on the various settings you can use with the plugin.

## Version History

### 1.8.0 (August 31, 2021)

* Add automatic table of contents rendering

### 1.7.3 (August 24, 2021)

* Cleaned up explanations of front matter in settings screen.

### 1.7.2 (August 19, 2021)

* Improved how numbering is inserted behind the scenes, so that undo history is preserved better and works faster.

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
