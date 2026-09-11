# @wharfkit/wallet-plugin-cloudwallet

A Session Kit wallet plugin for [My Cloud Wallet](https://www.mycloudwallet.com).

## Usage

Include this wallet plugin while initializing the SessionKit.

**NOTE**: This wallet plugin will only work with the SessionKit and requires a browser-based environment.

```ts
import {WalletPluginCloudWallet} from '@wharfkit/wallet-plugin-cloudwallet'

const kit = new SessionKit({
    // ... your other options
    walletPlugins: [new WalletPluginCloudWallet()],
})
```

### Local Development

If you need to modify the URL being used, which chains are supported, or alter the timeout, you can specify one or more of these paramaters during plugin initialization.  
These overrides are intended for local development and are not required for regular use.

```ts
import {WalletPluginCloudWallet} from '@wharfkit/wallet-plugin-cloudwallet'

const kit = new SessionKit({
    // ... your other options
    walletPlugins: [
        new WalletPluginCloudWallet({
            supportedChains: [
                '1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4', // WAX (Mainnet)
            ],
            url: 'https://www.mycloudwallet.com',
            loginTimeout: 300000, // 5 minutes
        }),
    ],
})
```

## Contributing

This package is developed in the [wharfkit/js](https://github.com/wharfkit/js) monorepo. See its README for how to build and test.

---

Made with ☕️ & ❤️ by [Greymass](https://greymass.com), if you find this useful please consider [supporting us](https://greymass.com/support-us).
