SHELL := /bin/bash

check:
	bun scripts/check-closure.ts

verify:
	bun scripts/release.ts verify

release:
	bun scripts/release.ts bump $(v)

release-dry:
	bun scripts/release.ts bump $(v) --dry-run

.PHONY: check verify release release-dry
