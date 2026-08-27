# Shared build rules for every member package. Include from packages/<name>/Makefile
# after setting any of the variables below; add genuinely local targets afterwards.
#
#   MOCK_DIR      fixture directory exported to mocha runs (unset means no MOCK_DIR)
#   MOCHA_EXTRA   extra mocha flags appended to MOCHA_OPTS
#   MOCHA_UI      mocha interface flag (default: -u tdd; empty selects mocha's bdd)
#   TEST_FILES    test sources (default: test/tests/**/*.ts; empty means no suite)
#   TEST_DEPS     extra prerequisites for the test targets
#   LINT_PATHS    eslint targets (default: src)
#   DOCS_ENTRY    typedoc entry point (default: src/index.ts)
#   BROWSER_OUT   browser bundle output, matching test/rollup.config.mjs (empty means none)
#   CLEAN_EXTRA   extra paths removed by clean

SHELL := /usr/bin/env bash
ROOT := $(patsubst %/,%,$(dir $(lastword $(MAKEFILE_LIST))))
BIN ?= $(ROOT)/node_modules/.bin

SRC_FILES := $(shell find src -name '*.ts')
TEST_FILES ?= $(shell find test/tests -name '*.ts' 2>/dev/null | sort)
LINT_PATHS ?= src
MOCHA_UI ?= -u tdd
DOCS_ENTRY ?= src/index.ts
BROWSER_OUT ?= build/browser.html

STRIP_TYPES_FLAG := $(shell node -e 'const [a,b]=process.versions.node.split(".").map(Number); if (a>22||(a===22&&b>=6)) console.log("--no-experimental-strip-types")')
MOCHA_ENV := TSX_TSCONFIG_PATH=test/tsconfig.json NODE_OPTIONS='$(STRIP_TYPES_FLAG)' $(if $(MOCK_DIR),MOCK_DIR='$(MOCK_DIR)',)
MOCHA_OPTS := $(MOCHA_UI) --require tsx --extension ts $(MOCHA_EXTRA)
NYC_OPTS := --temp-dir build/nyc_output --report-dir build/coverage

lib: $(SRC_FILES) package.json tsconfig.json $(ROOT)/node_modules rollup.config.mjs
	@$(BIN)/rollup -c && touch lib

.PHONY: test
test: $(ROOT)/node_modules $(TEST_DEPS)
ifeq ($(strip $(TEST_FILES)),)
	@echo '$(notdir $(CURDIR)) has no test suite'
else
	@$(MOCHA_ENV) \
		$(BIN)/mocha $(MOCHA_OPTS) $(TEST_FILES) --grep '$(grep)'
endif

.PHONY: test/watch
test/watch: $(ROOT)/node_modules $(TEST_DEPS)
	@$(MOCHA_ENV) \
		$(BIN)/mocha --watch $(MOCHA_OPTS) $(TEST_FILES) --grep '$(grep)'

.PHONY: ci-test
ci-test: $(ROOT)/node_modules $(TEST_DEPS)
ifeq ($(strip $(TEST_FILES)),)
	@echo '$(notdir $(CURDIR)) has no test suite'
else
	@$(MOCHA_ENV) \
		$(BIN)/nyc $(NYC_OPTS) --reporter=text \
		$(BIN)/mocha $(MOCHA_OPTS) -R list $(TEST_FILES)
endif

build/coverage: $(SRC_FILES) $(TEST_FILES) $(ROOT)/node_modules $(TEST_DEPS)
	@$(MOCHA_ENV) \
		$(BIN)/nyc $(NYC_OPTS) --reporter=html \
		$(BIN)/mocha $(MOCHA_OPTS) -R nyan $(TEST_FILES)

.PHONY: coverage
coverage: build/coverage
	@open build/coverage/index.html

.PHONY: check
check: $(ROOT)/node_modules
	@$(BIN)/eslint $(LINT_PATHS) --max-warnings 0 && echo "Ok"

.PHONY: format
format: $(ROOT)/node_modules
	@$(BIN)/eslint $(LINT_PATHS) --fix

build/docs: $(SRC_FILES) $(ROOT)/node_modules
	@$(BIN)/typedoc --out build/docs \
		--excludeInternal --excludePrivate --excludeProtected \
		--includeVersion --hideGenerator --readme none \
		$(DOCS_ENTRY)

.PHONY: docs
docs: build/docs
	@open build/docs/index.html

ifneq ($(strip $(BROWSER_OUT)),)
$(BROWSER_OUT): $(SRC_FILES) $(TEST_FILES) test/rollup.config.mjs $(ROOT)/node_modules
	@$(BIN)/rollup -c test/rollup.config.mjs

.PHONY: browser
browser: $(BROWSER_OUT)

.PHONY: browser-test
browser-test: $(BROWSER_OUT)
	@open $(BROWSER_OUT)
else
.PHONY: browser
browser:
	@echo '$(notdir $(CURDIR)) has no browser bundle'
endif

build/pages: build/docs build/coverage $(BROWSER_OUT)
	@mkdir -p build/pages
	@cp -r build/docs/* build/pages/
	@cp -r build/coverage build/pages/coverage
	@$(if $(BROWSER_OUT),cp $(BROWSER_OUT) build/pages/tests.html,true)

.PHONY: deploy-pages
deploy-pages: | clean lib build/pages
	@$(BIN)/gh-pages -d build/pages

$(ROOT)/node_modules:
	@bun install --cwd $(ROOT)

.PHONY: clean
clean:
	rm -rf lib/ build/ $(CLEAN_EXTRA)

.PHONY: distclean
distclean: clean
	rm -rf node_modules/
