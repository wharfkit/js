# @wharfkit/bundle

A prepackaged bundle of common Wharf libraries, built as a self-contained IIFE (`window.Wharf`) and ESM file for pages that load a script tag instead of running a build step.

## Usage

```html
<script src="https://cdn.jsdelivr.net/npm/@wharfkit/bundle@4.0.0/dist/wharf.bundle.js"></script>
<script>
    const kit = new Wharf.SessionKit({
        appName: 'my-app',
        chains: [Wharf.Chains.Jungle4],
        ui: new Wharf.WebUI(),
        walletPlugins: [new Wharf.WalletPluginAnchor()],
    })
</script>
```

The ESM file is the same artifact in module form, and it is one file with no sibling chunks, so copying it next to your HTML works:

```html
<script type="module">
    import {SessionKit, Chains, WebUI, WalletPluginAnchor} from 'https://cdn.jsdelivr.net/npm/@wharfkit/bundle@4.0.0/dist/wharf.esm.js'
</script>
```

### URL forms

Both URLs above name an exact version and the full file path. jsDelivr serves that form as the bytes npm holds, byte for byte, with `cache-control: immutable` for a year. The shorter forms (`@wharfkit/bundle`, `@wharfkit/bundle@latest`, `@wharfkit/bundle@4`) are minified by jsDelivr itself and cached for twelve hours at the edge, so they carry different bytes than the package and pick up patch releases without an edit.

Use `https://cdn.jsdelivr.net/npm/@wharfkit/bundle@4/dist/wharf.bundle.js` if you want patch releases without editing the page. The trade is that the bytes are no longer the package's own and no longer eligible for Subresource Integrity.

To add an `integrity` attribute, take the hash for the exact version from `https://data.jsdelivr.com/v1/packages/npm/@wharfkit/bundle@4.0.0?structure=flat`, and pair it with `crossorigin="anonymous"`, which SRI requires. An `integrity` attribute on a `<script type="module">` covers that file's own fetch, which for the ESM artifact is the whole artifact.

Sourcemaps ship alongside both files. A browser fetches them only when devtools are open, so a page downloads nothing extra for them.

### Per-package imports as an alternative

Importing each package separately, rather than the bundle, gives the browser one resolver decision per package, and the resolver can hand you more than one copy of `@wharfkit/antelope`. Two copies means two sets of classes, so `instanceof` fails across the boundary and antelope's ABI and struct registries exist twice. antelope prints an "alien instance" warning once per process when it detects this.

Every `@wharfkit/*` package in a lockstep release pins its siblings to the exact release version, so requesting one version for every top-level import resolves to one antelope on both CDNs:

```html
<script type="module">
    import {SessionKit, Chains} from 'https://esm.sh/@wharfkit/session@4.0.0'
    import {WalletPluginAnchor} from 'https://esm.sh/@wharfkit/wallet-plugin-anchor@4.0.0'
</script>
```

Mixing versions across imports, or adding a package still on the `1.x` line, splits it again. esm.sh takes an explicit pin against that: `?deps=@wharfkit/antelope@4.0.0` on each top-level URL rewrites the antelope import to one concrete build and propagates into every transitive `@wharfkit/*` request, so it costs one query parameter per import rather than one entry per transitive package. jsDelivr's `+esm` route has no query-parameter equivalent, and its output carries jsDelivr's own warning against pairing it with Subresource Integrity.

The bundle stays the recommended browser artifact. It is the only one that guarantees a single antelope without a resolver.

## Examples

`public/bundle.html` and `public/esm.html` are runnable examples of both forms, loading the built files next to them. `make` copies them into `dist/`, so open them from there after a build. The same pages ship in the package, at `https://cdn.jsdelivr.net/npm/@wharfkit/bundle@4.0.0/dist/bundle.html` and `.../dist/esm.html`.

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
