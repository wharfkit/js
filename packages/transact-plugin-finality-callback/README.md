# @wharfkit/transact-plugin-finality-callback

A WharfKit [transact plugin](https://wharfkit.com/docs/session-kit/plugin-transact) plugin that calls a callback function when a transaction has reached finality.

## Usage

Install the plugin:

```bash
npm install @wharfkit/transact-plugin-finality-callback --save
# or
yarn add @wharfkit/transact-plugin-finality-callback
```

Then, when instantiating the SessionKit, add the `TransactPluginFinalityCallback` plugin to the `transactPlugins` array. The plugin will call the `onFinalityCallback` function when transactions reach finality.

```
new SessionKit(sessionArgs, {
    ...
    transactPlugins: [
        new TransactPluginFinalityCallback({
            onFinalityCallback: (getTransactionStatusResponse) => {
                // This will be called when the transaction has reached finality
            },
        }),
    ],
})

## Contributing

This package is developed in the [wharfkit/js](https://github.com/wharfkit/js) monorepo. See its README for how to build and test.

---

Made with ☕️ & ❤️ by [Greymass](https://greymass.com), if you find this useful please consider [supporting us](https://greymass.com/support-us).
