SRC_FILES := $(shell find src -name '*.ts' -o -name '*.svelte')

lib: ${SRC_FILES} package.json tsconfig.json node_modules vite.config.ts
	@./node_modules/.bin/vite build && touch lib

.PHONY: dev
dev: node_modules
	@./node_modules/.bin/vite

.PHONY: test
test: node_modules
	@./node_modules/.bin/vitest run

.PHONY: test/watch
test/watch: node_modules
	@./node_modules/.bin/vitest

.PHONY: check
check: node_modules
	@./node_modules/.bin/biome check . && ./node_modules/.bin/prettier --check "**/*.svelte" && echo "Ok"

.PHONY: format
format: node_modules
	@./node_modules/.bin/biome check --write . && ./node_modules/.bin/prettier --write "**/*.svelte"

.PHONY: clean
clean:
	rm -rf lib/ coverage/

.PHONY: distclean
distclean: clean
	rm -rf node_modules/

node_modules:
	bun install
