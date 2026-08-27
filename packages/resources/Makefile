SRC_FILES := $(shell find src -name '*.ts')
BIN := ../../node_modules/.bin
STRIP_TYPES_FLAG := $(shell node -e 'const [a,b]=process.versions.node.split(".").map(Number); if (a>22||(a===22&&b>=6)) console.log("--no-experimental-strip-types")')
MOCHA_ENV := TSX_TSCONFIG_PATH=test/tsconfig.json NODE_OPTIONS='$(STRIP_TYPES_FLAG)'

lib: ${SRC_FILES} package.json tsconfig.json node_modules rollup.config.mjs
	@${BIN}/rollup -c && touch lib

.PHONY: test
test: node_modules
	@${MOCHA_ENV} MOCK_DIR=./test/data ${BIN}/mocha  \
		-u tdd --require tsx --extension ts test/*.ts --grep '$(grep)'

.PHONY: coverage
coverage: node_modules
	@${MOCHA_ENV} ${BIN}/nyc --reporter=html \
		${BIN}/mocha MOCK_DIR=./test/data -u tdd --require tsx --extension ts test/*.ts \
		-R nyan && open coverage/index.html

.PHONY: lint
lint: node_modules
	@${BIN}/eslint src --fix

.PHONY: ci-test
ci-test: node_modules
	@${MOCHA_ENV} MOCK_DIR=./test/data ${BIN}/nyc --reporter=text \
		${BIN}/mocha -u tdd --require tsx --extension ts test/*.ts -R list

.PHONY: ci-lint
ci-lint: node_modules
	@${BIN}/eslint src --max-warnings 0 && echo "Ok"

docs: $(SRC_FILES) node_modules
	@${BIN}/typedoc --out docs \
		--excludeInternal --excludePrivate --excludeProtected \
		--includeVersion --readme none \
		src/index.ts

.PHONY: deploy-pages
deploy-pages: docs
	@${BIN}/gh-pages -d docs

node_modules:
	yarn install --non-interactive --frozen-lockfile --ignore-scripts

.PHONY: clean
clean:
	rm -rf lib/ coverage/ docs/

.PHONY: distclean
distclean: clean
	rm -rf node_modules/
