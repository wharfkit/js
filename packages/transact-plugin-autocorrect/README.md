# @wharfkit/transact-plugin-autocorrect

A plugin to correct common issues users experience while performing transactions.

## Usage

Install plugin.

```
yarn add @wharfkit/transact-plugin-autocorrect
```

Include when configuring the Session Kit:

```ts
import {TransactPluginAutoCorrect} from '@wharfkit/transact-plugin-autocorrect'

const kit = new SessionKit(
    {
        // ... your other SessionKit args (appName, chains, ui, walletPlugins)
    },
    {
        transactPlugins: [new TransactPluginAutoCorrect()],
    }
)
```

Or when you are manually configuring a Session:

```ts
import {TransactPluginAutoCorrect} from '@wharfkit/transact-plugin-autocorrect'

const session = new Session(
    {
        // ... your other Session args (chain, walletPlugin, permissionLevel)
    },
    {
        transactPlugins: [new TransactPluginAutoCorrect()],
    }
)
```

## Contributing

This package is developed in the [wharfkit/js](https://github.com/wharfkit/js) monorepo. See its README for how to build and test.

---

Made with ☕️ & ❤️ by [Greymass](https://greymass.com), if you find this useful please consider [supporting us](https://greymass.com/support-us).
