.PHONY: install build local-deploy

install:
	npm install

# Compile plugin from main.ts to main.js
build:
	npm run dev

local-deploy:
	cp -R . ~/Dropbox/KPA\ Brain/.obsidian/plugins/header-numbering-obsidian