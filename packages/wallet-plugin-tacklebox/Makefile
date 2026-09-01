SHELL := /bin/bash
SRC_FILES := $(shell find src -name '*.ts' -o -name '*.json')
TEST_FILES := $(shell find test -name '*.ts')
BIN := ./node_modules/.bin

lib: ${SRC_FILES} package.json tsconfig.json node_modules rollup.config.js
	@${BIN}/rollup -c && touch lib

.PHONY: test
test: node_modules
	@npm test

.PHONY: coverage
coverage: node_modules
	@npm run coverage

.PHONY: check
check: node_modules
	@npm run lint && echo "Ok"

.PHONY: format
format: node_modules
	@npm run format

node_modules:
	npm install

.PHONY: clean
clean:
	rm -rf lib/ build/

.PHONY: distclean
distclean: clean
	rm -rf node_modules/
