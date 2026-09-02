# wallet-plugin-tacklebox

A `WalletPlugin` for use with [`@wharfkit/session`](https://github.com/wharfkit/session) that lets
dapps login and sign transactions with [TackleBox](https://github.com/on-a-t-break/tacklebox),
the native wallet and block explorer for Antelope blockchains (EOS/Vaulta, WAX, Telos, and
friends).

> TackleBox's dapp-link support is currently marked **experimental** in the wallet itself. The
> protocol is the anchor-link protocol (ESR identity requests, buoy callbacks, sealed push
> channels), so this plugin will keep working as the wallet feature matures.

## How it works

The flow mirrors Anchor's: requests open the wallet directly, with QR and copy-paste fallbacks.

1. **Login** — the plugin fires a `tacklebox://request/…` deep link that opens TackleBox with
   the ESR identity request (the wallet registers the `tacklebox:` scheme per user, and claims
   `esr:` only when no other wallet owns it — so an Anchor install keeps its links). The prompt
   keeps a **Launch TackleBox** link, a QR code and a **Copy login request** fallback
   (paste target: **Contracts → ESR → CONNECT AS LOGIN**). TackleBox answers over a
   [buoy](https://github.com/greymass/buoy) callback and announces its sealed push channel
   (`link_ch` / `link_key` / `link_name`).
2. **Transact** — signing requests are sealed to the wallet's session key and pushed straight
   into TackleBox over that channel; the wallet raises its own window for review. Every request
   still passes TackleBox's whitelist guard, contract-hash verification and signing review
   before a signature is produced and returned via callback. **Open TackleBox** and
   **Sign manually instead** fallbacks cover a closed wallet or another device.

While a TackleBox prompt is up, the Wharfkit modal wears the wallet's own dark theme —
deep-void navy, cyan light lines, restrained glow — scoped so other wallets' prompts keep the
stock look (and skipped entirely on non-web-renderer UIs).

## Installation

```bash
npm install wallet-plugin-tacklebox
```

Or straight from the repository: `npm install github:on-a-t-break/wallet-plugin-tacklebox`.

## Usage

Include the plugin in the `walletPlugins` list when initializing the `SessionKit`:

```ts
import {SessionKit} from '@wharfkit/session'
import {WebRenderer} from '@wharfkit/web-renderer'
import {WalletPluginTackleBox} from 'wallet-plugin-tacklebox'

const sessionKit = new SessionKit({
    appName: 'myapp',
    chains: [
        {
            id: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
            url: 'https://eos.greymass.com',
        },
    ],
    ui: new WebRenderer(),
    walletPlugins: [new WalletPluginTackleBox()],
})

const {session} = await sessionKit.login()
await session.transact({action})
```

### Options

```ts
new WalletPluginTackleBox({
    // Buoy callback-forwarder used for this dapp's callbacks.
    // TackleBox's own listening channel is announced by the wallet at login.
    buoyUrl: 'https://cb.anchor.link',
    // WebSocket constructor override (defaults to isomorphic-ws).
    buoyWs: WebSocket,
    // Keep the tacklebox: deep link from firing automatically on login and
    // manual signing; the prompt's launch link and fallbacks remain.
    disableAutoLaunch: false,
})
```

## Trying it live

[`examples/dapp`](./examples/dapp) is a minimal browser dapp (login, self-transfer, restore,
logout) for exercising the plugin against a real TackleBox build:

```bash
npm install && cd examples/dapp && npm install && npm run dev
```

## Developing

You need [Node.js](https://nodejs.org/) 18 or newer.

```bash
npm install   # install dependencies (also builds lib/)
npm run build # bundle to lib/ (cjs, esm and types)
npm test      # run the mocha test suite
npm run lint  # eslint + prettier checks
```

A `Makefile` with the same targets (`make lib`, `make test`, `make check`) is included for
consistency with the rest of the Wharfkit ecosystem.

Tests replay recorded API responses from `test/data`; delete a file there to re-record it
against a live endpoint.

## Credits

Based on the [Wharfkit wallet plugin template](https://github.com/wharfkit/wallet-plugin-template)
and modeled on the [Anchor wallet plugin](https://github.com/wharfkit/wallet-plugin-anchor) by
[Greymass](https://greymass.com), whose anchor-link protocol TackleBox speaks.

## License

[BSD-3-Clause](./LICENSE)
