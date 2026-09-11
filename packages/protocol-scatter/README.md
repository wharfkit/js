# @wharfkit/protocol-scatter

Abstract functions for use by various Scatter-based wallet plugins.

## Browser only

The Scatter protocol runs in a browser. Importing this package is safe in any environment, including Node.js, and the browser dependencies load only when `getScatter` runs. Calling `getScatter`, `handleLogin`, `handleLogout` or `handleSignatureRequest` outside a browser throws.

A wallet plugin built on this package can therefore import it directly and let the error surface, rather than guarding the import itself.

## Contributing

This package is developed in the [wharfkit/js](https://github.com/wharfkit/js) monorepo. See its README for how to build and test.

---

Made with ☕️ & ❤️ by [Greymass](https://greymass.com), if you find this useful please consider [supporting us](https://greymass.com/support-us).
