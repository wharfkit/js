# @wharfkit/transact-plugin-explorerlink

A plugin to display a link to a block explorer after a transaction has been completed.

## Usage

When instantiating your Session Kit, ensure you have the `explorer` parameter defined on the `ChainDefintion` for each blockchain, and then add the `TransactPluginExplorerLink` as a `transactPlugin`.

```ts
import {TransactPluginExplorerLink} from '@wharfkit/transact-plugin-explorerlink'

const kit = new SessionKit(
    {
        // ... your other SessionKit args (appName, ui, walletPlugins)
        chains: [
            {
                id: '73e4385a2708e6d7048834fbc1079f2fabb17b3c125b146af438971e90716c4d',
                url: 'https://jungle4.greymass.com',
                explorer: {
                    prefix: 'https://jungle4.eosq.eosnation.io/tx/',
                    suffix: '',
                },
            },
        ],
    },
    {
        transactPlugins: [new TransactPluginExplorerLink()],
    }
)
```

## Contributing

This package is developed in the [wharfkit/js](https://github.com/wharfkit/js) monorepo. See its README for how to build and test.

---

Made with ☕️ & ❤️ by [Greymass](https://greymass.com), if you find this useful please consider [supporting us](https://greymass.com/support-us).
