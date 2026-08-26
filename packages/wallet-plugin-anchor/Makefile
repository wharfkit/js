SHELL := /bin/bash
SRC_FILES := $(shell find src -name '*.ts')
TEST_FILES := $(shell find test/tests -name '*.ts' | sort)
BIN := ./node_modules/.bin
STRIP_TYPES_FLAG := $(shell node -e 'const [a,b]=process.versions.node.split(".").map(Number); if (a>22||(a===22&&b>=6)) console.log("--no-experimental-strip-types")')
MOCHA_ENV := TSX_TSCONFIG_PATH=test/tsconfig.json NODE_OPTIONS='$(STRIP_TYPES_FLAG)'
MOCHA_OPTS := -u tdd --require tsx -r test/setup.ts --extension ts --exit
NYC_OPTS := --temp-dir build/nyc_output --report-dir build/coverage

lib: ${SRC_FILES} package.json tsconfig.json node_modules rollup.config.mjs
	@${BIN}/rollup -c && touch lib

.PHONY: test
test: node_modules
	@${MOCHA_ENV} MOCK_DIR='./test/data' \
		${BIN}/mocha ${MOCHA_OPTS} ${TEST_FILES} --grep '$(grep)'

build/coverage: ${SRC_FILES} ${TEST_FILES} node_modules
	@${MOCHA_ENV} \
		${BIN}/nyc ${NYC_OPTS} --reporter=html \
		${BIN}/mocha ${MOCHA_OPTS} -R nyan ${TEST_FILES}

.PHONY: coverage
coverage: build/coverage
	@open build/coverage/index.html

.PHONY: ci-test
ci-test: node_modules
	@${MOCHA_ENV} MOCK_DIR='./test/data' \
		${BIN}/nyc ${NYC_OPTS} --reporter=text \
		${BIN}/mocha ${MOCHA_OPTS} -R list ${TEST_FILES}

.PHONY: check
check: node_modules
	@${BIN}/eslint src --max-warnings 0 && echo "Ok"

.PHONY: format
format: node_modules
	@${BIN}/eslint src --fix

.PHONY: publish
publish: | distclean node_modules
	@git diff-index --quiet HEAD || (echo "Uncommitted changes, please commit first" && exit 1)
	@git fetch origin && git diff origin/master --quiet || (echo "Changes not pushed to origin, please push first" && exit 1)
	@yarn config set version-tag-prefix "" && yarn config set version-git-message "Version %s"
	@yarn publish && git push && git push --tags

.PHONY: docs
docs: build/docs
	@open build/docs/index.html

build/docs: $(SRC_FILES) node_modules
	@${BIN}/typedoc --out build/docs \
		--excludeInternal --excludePrivate --excludeProtected \
		--includeVersion --hideGenerator --readme none \
		src/index.ts

build/pages: build/docs build/browser.html
	@mkdir -p build/pages
	@cp -r build/docs/* build/pages/
	@cp build/browser.html build/pages/tests.html

.PHONY: deploy-pages
deploy-pages: | clean build/pages node_modules
	@${BIN}/gh-pages -d build/pages

build/browser.html: $(SRC_FILES) $(TEST_FILES) test/rollup.config.mjs node_modules
	@${BIN}/rollup -c test/rollup.config.mjs

.PHONY: browser-test
browser-test: build/browser.html
	@open build/browser.html

node_modules:
	yarn install --non-interactive --frozen-lockfile --ignore-scripts

.PHONY: clean
clean:
	rm -rf lib/ build/

.PHONY: distclean
distclean: clean
	rm -rf node_modules/
