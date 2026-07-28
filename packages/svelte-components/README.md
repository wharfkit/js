# @wharfkit/svelte-components

Svelte 5 and Tailwind v4 component library for Antelope applications.

[Component showcase →](https://wharfkit.github.io/svelte-components)

## Requirements

This library has two hard peer dependencies, and there is no way to use it without them:

- **Tailwind CSS v4**
- **Svelte 5**, with the Svelte Vite plugin

The supported minimum is **plain Vite + `@sveltejs/vite-plugin-svelte`**. SvelteKit is _not_ required — the package imports nothing from `$app`, `$env` or `$lib`, and works in both client builds and bare-Node SSR.

> **If you have no Tailwind at all**, installing this package produces a peer-dependency warning and nothing else. Your build will succeed and your app will render completely unstyled, with no error to search for. We can't fix that from here — but now you know what it looks like.

## Install & CSS entry

```bash
npm install @wharfkit/svelte-components
```

```css
/* app.css */
@import 'tailwindcss';
@import '@wharfkit/svelte-components';
```

**You do not need to write an `@source` line.** The shipped stylesheet registers its own source paths, so Tailwind finds our component classes automatically.

<details>
<summary>Fallback, if your components render unstyled</summary>

Some dependency layouts can defeat the self-registered path. If your app builds cleanly but the components are unstyled, add the `@source` line manually, pointing at wherever the package actually resolved:

```css
@source "../node_modules/@wharfkit/svelte-components/dist";
```

The symptom to look for is emitted CSS in the ~10 kB range instead of ~45 kB.

</details>

```svelte
<script>
	import { Button, Checkbox, CopyButton, Stack } from '@wharfkit/svelte-components';
</script>

<Stack>
	<Checkbox checked={false} id="a" />
	<CopyButton data="test" />
	<Button>Test</Button>
</Stack>
```

## Fonts

Fonts are **opt-in**. The library declares `--font-sans` and `--font-mono` with full fallback stacks, so if you skip this step you get different-looking text — not a broken reference and not a missing-font error.

To use the bundled faces (Inter Variable and JetBrains Mono Variable, ~88 kB of self-hosted woff2, no extra dependencies):

```css
@import '@wharfkit/svelte-components/fonts.css';
```

The fonts are licensed under [OFL-1.1](./LICENSE-OFL), which is shipped in the package.

## Required host behaviour

**This library wipes Tailwind's default colour palette across your whole app.** Our stylesheet declares `--color-*: initial`, which removes `bg-red-500`, `text-blue-600` and every other default colour utility — not just inside our components, but everywhere in your app.

This is deliberate and load-bearing: it is what forces all colour through the semantic `--role-*` system, so that reseeding the theme actually reseeds everything. It is also the single most invasive thing this package does, so it gets its own section.

If you need Tailwind's palette back, re-declare the parts you want after importing us:

```css
@import 'tailwindcss';
@import '@wharfkit/svelte-components';

@theme {
	--color-red-500: oklch(0.637 0.237 25.331);
	/* …and any others you rely on */
}
```

## Theming

Every colour derives from a single seed. There are two supported override tiers.

**Tier 1 — reseed.** Set one value and the entire palette re-derives:

```css
:root {
	--theme-seed: #3650a2;
}
```

**Tier 2 — override roles directly.** Any `--role-*` can be set to a flat value, bypassing derivation:

```css
:root {
	--role-background: #111a2d;
	--role-outline: rgba(255, 255, 255, 0.14);
}
```

Typography is overridable the same way. Override `--theme-font-*` and `--theme-text-*` (not `--font-*` / `--text-*`, which are the Tailwind-facing aliases):

```css
:root {
	--theme-font-sans: 'Your Face', sans-serif;
	--theme-text-display: 3rem;
}
```

### The one role that is not seed-derived

Every role derives from `--theme-seed` except `--role-focus`, which is deliberately independent so the focus indicator stays visible against your brand — override it if you have an accessible alternative.

A focus ring's job is to contrast _against_ the brand colour, so tying it to the brand is self-defeating: a focus ring derived from `primary` is invisible on a primary-coloured button.

### Dark mode

Two signals are accepted on any ancestor element:

```html
<html data-scheme="dark">
	<!-- or -->
	<html class="dark"></html>
</html>
```

`data-scheme="dark"` is the documented primary; `.dark` is accepted so a Tailwind- or shadcn-style class toggle works without rewiring. Both work on any ancestor, including portalled subtrees, so you can force a scheme on part of the page.

The library does **not** auto-detect `prefers-color-scheme`. Deciding the scheme — and controlling the flash of wrong theme on first paint — is yours.

Two notes:

- Because the palette flips wholesale, you rarely need `dark:` utilities. There are four in this entire library.
- `:root` sets `color-scheme: dark light`, so an app with no scheme system gets a light page with dark-styled scrollbars and form controls.

### Not themeable

1. **`--breakpoint-xs`** — build-time only, because `@media (width >= var(--x))` is not valid CSS. It is the only such token.
2. **The role _set_** — you can change any role's value, but roles can't be added or removed. Declare your own tokens in your own `@theme`.
3. **The Material-3 semantic model** — the surface / on-surface / container-tier vocabulary. Reseed within it; don't replace it.
4. **The per-scheme derivation maths** — the lightness curves that make light and dark work.
5. **Component internals** — padding, radius, sizes, structure are not tokenised.

On (5), most but **not all** components merge a `class` prop onto their root element (30 of 62 files use the merge helper). Where it works it is a real escape hatch; where it doesn't, there is no prop to reach the internals. Check the component before relying on it.

## Stability

**0.x: the API will change. Pin a minor.**

This is a young public package and an API redesign is expected. Under 0.x, breaking changes ship in the minor position, so `^0.7.0` will not auto-adopt one.

## Browser support

The theme is built on `oklch()` relative colour (`oklch(from …)`), which needs Safari 18 / Chrome 131 / Firefox 133 — roughly 88% of browsers. Below that, the structural palette falls back to **neutral greys** so the interface stays legible rather than collapsing to transparent backgrounds and inherited text. Brand colour is lost; readability is not.

## What this is not

Stated plainly, so nothing here is a surprise:

- **No documentation site.** This README and the showcase are the documentation.
- **No accessibility standard.** No audit has been performed and no conformance is claimed. Components built on Melt UI inherit its focus management and ARIA, but that is inherited, not asserted, and unverified.
- **No support commitment.** Issues may go unanswered.
- **No external contribution process.** There is no `CONTRIBUTING` guide and no review workflow for outside PRs.

## Developing

```bash
bun install
bun run dev      # showcase at src/routes
bun run check    # svelte-check
bun run lint     # prettier + eslint
bun run build    # showcase + package
```

`make`, `make check` and `make format` forward to the same scripts.

Everything in `src/lib` is the published library; `src/routes` is the showcase.

## Releasing

[release-please](https://github.com/googleapis/release-please) opens a release PR from conventional commits and tags the release when it merges. **Publishing is manual**, from a maintainer's machine:

```bash
git pull                 # get the release commit release-please merged
bun install
bun run build
npm publish              # not bun publish
```

> **Never run `bun publish`** — it ignores the `files` field and would ship `src/`, `.svelte-kit/`, `build/` and `bun.lock`: about 2.9 MB across 506 files. Version 0.6.1 shipped that way. A `prepublishOnly` guard now refuses bun and aborts if the tarball exceeds 400 kB or contains any of those paths, but the guard is a backstop, not a licence to guess.

Publishing locally means releases carry **no npm provenance** — provenance requires CI's OIDC token and cannot be generated from a laptop.

## License

BSD-3-Clause — see [LICENSE](./LICENSE). Copyright (c) 2026 Greymass Inc.

Bundled fonts are OFL-1.1 ([LICENSE-OFL](./LICENSE-OFL)). Note that the `@wharfkit/antelope` dependency carries BSD-3-Clause-No-Military-License.
