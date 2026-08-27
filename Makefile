SHELL := /usr/bin/env bash
BIN := ./node_modules/.bin

check:
	bun scripts/check-closure.ts
	bun scripts/check-deps.ts
	@$(BIN)/prettier --check '**/*.{ts,mjs}'

verify:
	bun scripts/release.ts verify

release:
	bun scripts/release.ts bump $(v)

release-dry:
	bun scripts/release.ts bump $(v) --dry-run

.PHONY: check verify release release-dry
