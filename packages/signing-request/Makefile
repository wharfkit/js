SRC_FILES := $(shell find src -name '*.ts')
BIN := ./node_modules/.bin
STRIP_TYPES_FLAG := $(shell node -e 'const [a,b]=process.versions.node.split(".").map(Number); if (a>22||(a===22&&b>=6)) console.log("--no-experimental-strip-types")')
MOCHA_ENV := TSX_TSCONFIG_PATH=test/tsconfig.json NODE_OPTIONS='$(STRIP_TYPES_FLAG)'

lib: ${SRC_FILES} package.json tsconfig.json node_modules rollup.config.mjs
	@${BIN}/rollup -c && touch lib

.PHONY: test
test: node_modules
	@${MOCHA_ENV} ${BIN}/mocha --require tsx --extension ts test/*.ts --grep '$(grep)'

.PHONY: coverage
coverage: node_modules
	@${MOCHA_ENV} ${BIN}/nyc --reporter=html ${BIN}/mocha --require tsx --extension ts test/*.ts -R nyan && open coverage/index.html

.PHONY: lint
lint: node_modules
	@${BIN}/eslint src --fix

.PHONY: ci-test
ci-test: node_modules
	@${MOCHA_ENV} ${BIN}/nyc --reporter=text ${BIN}/mocha --require tsx --extension ts test/*.ts -R list

.PHONY: ci-lint
ci-lint: node_modules
	@${BIN}/eslint src --max-warnings 0 && echo "Ok"

node_modules:
	yarn install --non-interactive --frozen-lockfile --ignore-scripts

.PHONY: publish
publish: | distclean node_modules
	@git diff-index --quiet HEAD || (echo "Uncommitted changes, please commit first" && exit 1)
	@git fetch origin && git diff origin/master --quiet || (echo "Changes not pushed to origin, please push first" && exit 1)
	@yarn config set version-tag-prefix "" && yarn config set version-git-message "Version %s"
	@yarn publish && git push && git push --tags

.PHONY: clean
clean:
	rm -rf lib/ coverage/

.PHONY: distclean
distclean: clean
	rm -rf node_modules/
