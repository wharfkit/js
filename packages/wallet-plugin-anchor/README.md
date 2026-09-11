# @wharfkit/wallet-plugin-anchor

A Session Kit wallet plugin for the [Anchor](https://anchorwallet.io) wallet.

## Usage

Include this wallet plugin while initializing the SessionKit.

**NOTE**: This wallet plugin will only work with the SessionKit and requires a browser-based environment.

```ts
import {WalletPluginAnchor} from '@wharfkit/wallet-plugin-anchor'

const kit = new SessionKit({
    // ... your other options
    walletPlugins: [new WalletPluginAnchor()],
})
```

Custom buoy url and websocket class are supported.

```ts
import WebSocket from 'isomorphic-ws'
import {WalletPluginAnchor} from '@wharfkit/wallet-plugin-anchor'

const kit = new SessionKit({
    // ... your other options
    walletPlugins: [
        new WalletPluginAnchor({
            buoyUrl: 'https://cb.anchor.link',
            buoyWs: Websocket,
        }),
    ],
})
```

## Contributing

This package is developed in the [wharfkit/js](https://github.com/wharfkit/js) monorepo. See its README for how to build and test.

---

Made with ☕️ & ❤️ by [Greymass](https://greymass.com), if you find this useful please consider [supporting us](https://greymass.com/support-us).
