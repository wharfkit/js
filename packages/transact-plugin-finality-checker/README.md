# @wharfkit/transact-plugin-finality-checker

A [Transact plugin](https://wharfkit.com/docs/session-kit/plugin-transact) that displays the finality status of a transaction after it has been broadcasted to the blockchain.

## Usage

Install the plugin:

```bash
yarn add @wharfkit/transact-plugin-finality-checker
```

Then use it when instantiating the `SessionKit`:

```js
new SessionKit(sessionArgs, {
    ...
    transactPlugins: [
        new TransactPluginFinalityChecker(),
    ],
})

## Contributing

This package is developed in the [wharfkit/js](https://github.com/wharfkit/js) monorepo. See its README for how to build and test.

---

Made with ☕️ & ❤️ by [Greymass](https://greymass.com), if you find this useful please consider [supporting us](https://greymass.com/support-us).
