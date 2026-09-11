# @wharfkit/transact-plugin-cosigner

Automatically cosign transactions to assume resource costs using a noop action.

## Installation

```bash
yarn install @wharfkit/transact-plugin-cosigner
```

## Usage

Include this `transactPlugin` in your Wharf Session Kit instance and specify the relevant information.

```js
const session = new Session(
    {
        chain: {
            id: '73e4385a2708e6d7048834fbc1079f2fabb17b3c125b146af438971e90716c4d',
            url: 'https://jungle4.greymass.com',
        },
        permissionLevel: 'wharfkit1111@test',
        walletPlugin: wallet,
    },
    {
        transactPlugins: [
            new TransactPluginCosigner({
                actor: 'wharfkitnoop',
                permission: 'cosign',
                privateKey: '5JfFWg1CWsNTeXTWMyfChXXbyD31TCTknSVGwXDSpT6bPxKYLMM',
            }),
        ],
    }
)
```

Any transaction initiated with this session will automatically prepend a `greymassnoop:noop` action and sign it using the permissions specified for the `TransactPluginCosigner`.

## Contributing

This package is developed in the [wharfkit/js](https://github.com/wharfkit/js) monorepo. See its README for how to build and test.

---

Made with ☕️ & ❤️ by [Greymass](https://greymass.com), if you find this useful please consider [supporting us](https://greymass.com/support-us).
