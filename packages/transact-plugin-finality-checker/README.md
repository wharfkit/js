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

## Developing

You need [Make](https://www.gnu.org/software/make/), [node.js](https://nodejs.org/en/) and [yarn](https://classic.yarnpkg.com/en/docs/install) installed.

Clone the repository and run `make` to checkout all dependencies and build the project. See the [Makefile](./Makefile) for other useful targets. Before submitting a pull request make sure to run `make lint`.

---

Made with ☕️ & ❤️ by [Greymass](https://greymass.com), if you find this useful please consider [supporting us](https://greymass.com/support-us).
