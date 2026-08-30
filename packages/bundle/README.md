# @wharfkit/bundle

A prepackaged bundle of common Wharf libraries, built as a self-contained IIFE (`window.Wharf`) and ESM file for pages that load a script tag instead of running a build step.

## Usage

```html
<script src="https://cdn.jsdelivr.net/npm/@wharfkit/bundle"></script>
<script>
    const kit = new Wharf.SessionKit({
        appName: 'my-app',
        chains: [Wharf.Chains.Jungle4],
        ui: new Wharf.WebUI(),
        walletPlugins: [new Wharf.WalletPluginAnchor()],
    })
</script>
```

`public/bundle.html` and `public/esm.html` are runnable examples of both forms. `make` copies them next to the built files, so open them from `dist/` after a build.

## Types

The bundle ships no TypeScript declarations. A typed project installs the packages it uses directly, for example `@wharfkit/session` and `@wharfkit/wallet-plugin-anchor`, which carry their own types and let a bundler drop what the application never imports.

## Exported packages

`src/main.ts` is the curated list. Most packages are re-exported flat; `atomicassets`, `hyperion`, and `roborovski` are namespaced as `AtomicAssets`, `Hyperion`, and `Roborovski` because their type names collide with the core SDK.

| Flat | Namespaced |
| --- | --- |
| `@wharfkit/session`, `@wharfkit/account`, `@wharfkit/antelope`, `@wharfkit/common`, `@wharfkit/contract`, `@wharfkit/resources`, `@wharfkit/token`, `@wharfkit/transact-plugin-autocorrect`, `@wharfkit/transact-plugin-resource-provider`, `@wharfkit/wallet-plugin-anchor`, `@wharfkit/wallet-plugin-cloudwallet`, `@wharfkit/wallet-plugin-imtoken`, `@wharfkit/wallet-plugin-metamask`, `@wharfkit/wallet-plugin-tokenpocket`, `@wharfkit/web-ui` | `@wharfkit/atomicassets`, `@wharfkit/hyperion`, `@wharfkit/roborovski` |

## Development

```
make        # build dist/
make check  # type-check src/
make test   # import the built ESM file and assert the export shape
```
