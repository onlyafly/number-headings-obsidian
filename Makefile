.PHONY: install build local-deploy

install:
	npm install

# Compile plugin from main.ts to main.js
build:
	npm run dev

local-deploy:
	rm -rf ~/Dropbox/KPA\ Brain\ -\ Heading\ Tests/.obsidian/plugins/number-headings-obsidian
	mkdir ~/Dropbox/KPA\ Brain\ -\ Heading\ Tests/.obsidian/plugins/number-headings-obsidian
	cp main.js ~/Dropbox/KPA\ Brain\ -\ Heading\ Tests/.obsidian/plugins/number-headings-obsidian/
	cp manifest.json ~/Dropbox/KPA\ Brain\ -\ Heading\ Tests/.obsidian/plugins/number-headings-obsidian/
	cp styles.css ~/Dropbox/KPA\ Brain\ -\ Heading\ Tests/.obsidian/plugins/number-headings-obsidian/