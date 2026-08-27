# Familiar entry points for the wharfkit workspace. The build underneath is
# bun + Vite + @sveltejs/package, not the org's yarn + rollup convention:
# rollup cannot ship .svelte sources under the "svelte" export condition.

.PHONY: all check format dev clean

all: node_modules
	bun run build

node_modules:
	bun install

check: node_modules
	bun run check
	bun run lint

format: node_modules
	bun run format

dev: node_modules
	bun run dev

clean:
	rm -rf dist build .svelte-kit
