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

## Developing

You need [Make](https://www.gnu.org/software/make/), [node.js](https://nodejs.org/en/) and [yarn](https://classic.yarnpkg.com/en/docs/install) installed.

Clone the repository and run `make` to checkout all dependencies and build the project. See the [Makefile](./Makefile) for other useful targets. Before submitting a pull request make sure to run `make lint`.

---

Made with ☕️ & ❤️ by [Greymass](https://greymass.com), if you find this useful please consider [supporting us](https://greymass.com/support-us).
