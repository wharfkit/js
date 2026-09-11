# @wharfkit/wallet-plugin-scatter

A Session Kit wallet plugin for the [Scatter](https://github.com/GetScatter/ScatterDesktop) wallet.

## Usage

Include this wallet plugin while initializing the SessionKit.

**NOTE**: This wallet plugin will only work with the SessionKit and requires a browser-based environment.

```ts
import {WalletPluginScatter} from '@wharfkit/wallet-plugin-scatter'

const kit = new SessionKit({
    // ... your other options
    walletPlugins: [new WalletPluginScatter()],
})
```

## Contributing

This package is developed in the [wharfkit/js](https://github.com/wharfkit/js) monorepo. See its README for how to build and test.

---

Made with ☕️ & ❤️ by [Greymass](https://greymass.com), if you find this useful please consider [supporting us](https://greymass.com/support-us).
