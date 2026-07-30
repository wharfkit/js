# @wharfkit/web-ui

###### Web UI - An embedded UI renderer for WharfKit SessionKit

A modern, Shadow DOM-based user interface for [SessionKit](https://github.com/wharfkit/session). It renders the login, transact, and prompt flows as a modal layer inside your web application. The default palette is neutral, so the modal sits cleanly on any host site, and every color can be themed to match your brand. Successor to [`@wharfkit/web-renderer`](https://github.com/wharfkit/web-renderer).

## Installation

The `@wharfkit/web-ui` package is distributed on [npm](https://www.npmjs.com/package/@wharfkit/web-ui).

```
npm install --save @wharfkit/web-ui
# or
yarn add @wharfkit/web-ui
# or
bun add @wharfkit/web-ui
```

`@wharfkit/session` and `@wharfkit/common` are peer dependencies.

## Usage

Pass a `WebUI` instance as the `ui` option when creating a SessionKit:

```ts
import SessionKit, {Chains} from '@wharfkit/session'
import {WalletPluginAnchor} from '@wharfkit/wallet-plugin-anchor'
import {WebUI} from '@wharfkit/web-ui'

const sessionKit = new SessionKit({
    appName: 'My App',
    chains: [Chains.Jungle4],
    ui: new WebUI(),
    walletPlugins: [new WalletPluginAnchor()],
})

const {session} = await sessionKit.login()
```

WebUI mounts itself into the page automatically and handles every SessionKit interaction from there: wallet selection, transaction signing, prompts, and session key consent.

### Options

All options are optional:

```ts
const ui = new WebUI({
    theme: 'auto',              // 'light' | 'dark' | 'auto' (follows prefers-color-scheme)
    appearance: {...},          // custom colors, covered in Styling below
    appName: 'My App',          // shown in the login view ("Connect to My App");
                                // picked up automatically from SessionKit if unset
    locale: 'en',               // 'en' | 'ko' | 'zh-Hans' | 'zh-Hant' | 'tr'
    closeOnOverlayClick: true,  // clicking the backdrop cancels the current flow
    closeOnEscape: true,        // pressing Escape cancels the current flow
    zIndex: 999999,             // stacking order of the modal layer
    minimal: false,             // suppress non-essential UI (progress states, optional prompts)
    logging: false,             // verbose console logging for development
})
```

## Styling

WebUI ships with a neutral palette in both light and dark mode, so it looks at home on any site without configuration. The `appearance` option rethemes the modal to match your brand without forking the package.

```ts
const ui = new WebUI({
    appearance: {
        accent: '#e05d2d',
        background: '#1a1614',
        surface: '#242019',
        text: '#f4efe9',
        borderRadius: 8,
        fontFamily: '"Inter", sans-serif',
    },
})
```

Every key is optional. Set only what you want to change:

| Key | Type | Controls |
| --- | --- | --- |
| `accent` | color | Primary action button and focus rings. This is the key that colors the confirm/login button. |
| `accentHover` | color | Primary button hover state. Derived from `accent` if unset. |
| `accentText` | color | Text on the primary button. Defaults to `background` if unset. |
| `background` | color | Modal background |
| `surface` | color | Raised surfaces: hover states, wells, secondary panels |
| `text` | color | Primary text |
| `textSecondary` | color | Secondary/muted text |
| `border` | color | Borders and dividers, including the secondary button outline |
| `error` | color | Error states |
| `success` | color | Success states |
| `backdropColor` | color | The dimming overlay behind the modal |
| `borderRadius` | number | Corner radius of the modal, in pixels |
| `fontFamily` | string | Font stack for UI text (code-like values such as transaction IDs keep a monospace stack) |

Colors accept any CSS color value (`#hex`, `rgb()`, `oklch()`, and so on).

Setting `accent` is enough to restyle the buttons: hover, text, and focus ring colors are derived from it automatically unless you override them. The accent color appears only on the primary action and focus rings. Everything else stays in tinted neutrals, so the modal reads as trustworthy infrastructure rather than a competing brand.

Secondary buttons and wallet cards share the modal's palette on purpose. They follow `surface`, `text`, and `border` rather than taking their own colors, which keeps the visual hierarchy quiet and the primary action unmistakable.

`theme` and `appearance` compose. Your appearance overrides apply on top of whichever base theme is active, so with `theme: 'auto'` you can override just `accent` and let light and dark mode handle the rest.

### CSS custom properties

The `appearance` option covers the supported theming surface and is the recommended path. It works by setting `--web-ui-*` custom properties on the modal's host element (`div#web-ui`). Custom properties inherit through the Shadow DOM boundary, so page-level CSS targeting `#web-ui` can set them as well:

```css
#web-ui {
    --web-ui-accent: #e05d2d;
}
```

This suits projects whose theming already lives in CSS, such as design tokens that flip with a site-wide theme toggle. The variable names mirror the `appearance` keys. The `--wharfkit-*` variables from the old `@wharfkit/web-renderer` do not exist here.

## Localization

WebUI ships with translations for English (`en`), Korean (`ko`), Simplified and Traditional Chinese (`zh-Hans`, `zh-Hant`), and Turkish (`tr`). The locale can be set at construction time (`locale` option) or changed at runtime with `ui.setLocale()`. Wallet plugin translations can be registered with `ui.addTranslations()`.

## Developing

You need [Make](https://www.gnu.org/software/make/) and [Bun](https://bun.sh) installed.

Clone the repository and run `make` to install dependencies and build the library. `make dev` starts a Vite dev server with a sample host app (`dev/`) exercising every view against both real wallet plugins and mock flows.

```
make          # install deps + build lib/
make dev      # dev server with HMR
make test     # unit tests (Vitest)
make check    # lint (Biome + Prettier)
make format   # auto-fix formatting
```

Before submitting a pull request make sure to run `make check` and `make format`.

## Reporting Issues

If you think you've found an issue with this codebase, please submit a pull request with a failing unit test to better help us reproduce and understand the issue you are experiencing.

To do this, fork this repository and create your own branch. In this new branch, write a test (Vitest, under `test/`) that either fails to execute, throws an error, or doesn't return the anticipated response. Once your test is failing and successfully shows the issue occurring, please submit a pull request to this repository. Feel free to include any additional details in the body of the pull request that might help us understand the situation.

## Dependencies

-   [@wharfkit/session](https://github.com/wharfkit/session): SessionKit, which this package renders a UI for (peer dependency).
-   [@wharfkit/common](https://github.com/wharfkit/common): Shared types and utilities (peer dependency).
-   [Svelte 5](https://svelte.dev): Compiled away at build time; your app takes on no runtime framework dependency.

---

Made with ☕️ & ❤️ by [Greymass](https://greymass.com).
