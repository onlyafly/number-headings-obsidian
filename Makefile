.PHONY: install build local-deploy

install:
	npm install

# Compile plugin from main.ts to main.js
build:
	npm run dev

local-deploy:
	rm -rf ~/Library/CloudStorage/Dropbox/KPA\ Brain\ -\ Heading\ Tests/.obsidian/plugins/number-headings-obsidian
	mkdir ~/Library/CloudStorage/Dropbox/KPA\ Brain\ -\ Heading\ Tests/.obsidian/plugins/number-headings-obsidian
	cp main.js ~/Library/CloudStorage/Dropbox/KPA\ Brain\ -\ Heading\ Tests/.obsidian/plugins/number-headings-obsidian/
	cp manifest.json ~/Library/CloudStorage/Dropbox/KPA\ Brain\ -\ Heading\ Tests/.obsidian/plugins/number-headings-obsidian/
	cp styles.css ~/Library/CloudStorage/Dropbox/KPA\ Brain\ -\ Heading\ Tests/.obsidian/plugins/number-headings-obsidian/

test:
	npm test