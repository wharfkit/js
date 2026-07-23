SRC_FILES := $(shell find src -name '*.ts' -o -name '*.svelte')

CODEX_MODEL ?= gpt-5.6-luna
CODEX_REASONING ?= low

EXTRACT := bunx wuchale --clean

lib: ${SRC_FILES} package.json tsconfig.json node_modules vite.config.ts
	@./node_modules/.bin/vite build && touch lib

.PHONY: dev
dev: node_modules
	@./node_modules/.bin/vite

.PHONY: translate
translate: node_modules
	@command -v codex >/dev/null 2>&1 || { \
		echo "Codex CLI is required. Install it, then run 'codex login'."; \
		exit 1; \
	}
	@codex login status >/dev/null 2>&1 || { \
		echo "Codex CLI is not authenticated. Run 'codex login' and try again."; \
		exit 1; \
	}
	WUCHALE_AI=codex \
	WUCHALE_CODEX_MODEL="$(CODEX_MODEL)" \
	WUCHALE_CODEX_REASONING="$(CODEX_REASONING)" \
	bunx wuchale

.PHONY: extract
extract: node_modules
	@$(EXTRACT)

.PHONY: test
test: node_modules lib
	@./node_modules/.bin/vitest run

.PHONY: test/watch
test/watch: node_modules
	@./node_modules/.bin/vitest

.PHONY: check
check: node_modules
	@./node_modules/.bin/biome check . && ./node_modules/.bin/prettier --check "**/*.svelte" && $(EXTRACT) && git diff --exit-code src/locales && echo "Ok"

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
