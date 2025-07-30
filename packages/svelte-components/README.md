# Unicove Component library

Svelte components for Unicove and related projects.

## Using

Install the component library and make sure all peerDependencies are also installed

```bash
bun install unicove-components

```

Ensure tailwindcss is setup correctly in the v4 style.

Then import the Unicove base styles and allow tailwind to detect the classes in the library components.

```css
/* app.css */
@import 'tailwindcss';
@import 'unicove-components';
@source "../node_modules/unicove-components";
```

Then you can use the components in svelte

```svelte
<script>
	import { Button, Checkbox, CopyButton, Stack } from 'unicove-components';
</script>

<Stack>
	<Checkbox checked={false} id="a" />

	<CopyButton data="test" />

	<Button>Test</Button>
</Stack>
```

## Developing

Once you've created a project and installed dependencies with `bun install` start a development server:

```bash
bun run dev

# or start the server and open the app in a new browser tab
bun run dev -- --open
```

Everything inside `src/lib` is part of your library, everything inside `src/routes` can be used as a showcase or preview app.

## Building

To build your library:

```bash
bun run package
```

To create a production version of your showcase app:

```bash
bun run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Publishing

```bash
bun publish
```
