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

| Action                                             | Hotkey          |
| -------------------------------------------------- | --------------- |
| Number all headings in document (and show options) | None by default |
| Number all headings in document                    | None by default |
| Remove numbering from all headings in document     | None by default |
| Save settings to front matter                      | None by default |

You can also assign the commands to hotkeys for easy usage.

See the settings page for the plugin for detailed instructions on the various settings you can use with the plugin.

## Version History

### 1.16.0 (Oct 3, 2023)

* Added support for skipping headings using the `skip` front matter setting. See <https://github.com/onlyafly/number-headings-obsidian/issues/25>.

### 1.15.0 (Sep 23, 2023)

* Added option to turn off automatic numbering for specific files. See <https://github.com/onlyafly/number-headings-obsidian/issues/43>.

### 1.14.0 (Sep 21, 2023)

* Fixed bug where you could no longer automatically insert settings on a per document basis. See <https://github.com/onlyafly/number-headings-obsidian/issues/54>.

### 1.13.0 (Jan 6, 2023)

* Added support for a right parenthesis as a separator.

### 1.12.0 (Jan 1, 2023)

* Added support for Roman numerals as numbers. See <https://github.com/onlyafly/number-headings-obsidian/issues/34>.

### 1.11.0 (Jan 1, 2023)

* Added the 'start-at' setting to allow numbering to start at a number other than 1. See <https://github.com/onlyafly/number-headings-obsidian/issues/33>.
* Fixed bug where table of contents would cause Obsidian to freeze if there is no other headings. See <https://github.com/onlyafly/number-headings-obsidian/issues/37>.

### 1.10.1 (Dec 31, 2022)

* Fixed bug where a separator like " -" (space before a dash) would cause a loop during header updates. See <https://github.com/onlyafly/number-headings-obsidian/issues/36>.

### 1.10.0 (June 29, 2022)

* Added new command "Number all headings in document (and show options)" which shows the options dialog after numbering. Changed the old command "Number all headings in document" to number without showing the dialog. See <https://github.com/onlyafly/number-headings-obsidian/issues/15>.

### 1.9.0 (June 19, 2022)

* Fixed several bugs. See <https://github.com/onlyafly/number-headings-obsidian/issues/29>, <https://github.com/onlyafly/number-headings-obsidian/issues/23>, and <https://github.com/onlyafly/number-headings-obsidian/issues/13>.

### 1.8.1 (December 15, 2021)

* Fixed bug where in some situations settings were not transferred to the front matter. See <https://github.com/onlyafly/number-headings-obsidian/issues/19>

### 1.8.0 (October 26, 2021)

* Add automatic table of contents rendering
* Add first-level setting to allow skipping several heading levels
* Fixed bug where skipped headings that started with numbers would be erased

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
