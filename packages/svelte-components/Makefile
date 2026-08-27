# Familiar entry points for the wharfkit workspace. The build underneath is
# bun + Vite + @sveltejs/package, not the org's yarn + rollup convention:
# rollup cannot ship .svelte sources under the "svelte" export condition.

.PHONY: all check format dev test browser clean

all: node_modules
	bun run build

node_modules:
	bun install --cwd ../..

check: node_modules
	bun run check
	bun run lint

format: node_modules
	bun run format

dev: node_modules
	bun run dev

test: node_modules
	@echo 'svelte-components has no test suite'

browser:
	@echo 'svelte-components has no browser bundle'

clean:
	rm -rf dist build .svelte-kit
