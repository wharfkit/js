# Familiar entry points for the wharfkit workspace. The build underneath is bun + Vite,
# not the org's rollup convention: the dist is a self-contained IIFE and ESM pair for
# script-tag consumers, so it has no externals and ships no types.

.PHONY: all check test browser clean distclean

all: node_modules
	bun run build

node_modules:
	bun install --cwd ../..

check: node_modules
	bun run check

test: node_modules all
	bun run test

browser:
	@echo 'bundle is itself the browser bundle'

clean:
	rm -rf dist

distclean: clean
	rm -rf node_modules
