# WharfKit JS

Monorepo for the `@wharfkit/*` TypeScript packages. Every member package lives under `packages/<name>/`, keeps its published npm name, and releases in lockstep: one version number across the whole workspace, with internal references declared as `workspace:*` in source and rewritten to exact pins at pack time. The design goal is that every release resolves to exactly one `@wharfkit/antelope` instance.

## Layout

- `packages/<name>/` holds one npm package per directory, imported with full history from its standalone repository.
- `scripts/` holds the workspace tooling: `release.ts` (version bump and publish), `import-package.ts` (standalone repo import), `check-closure.ts` (membership closure check).

## Toolchain

- Package manager: bun workspaces with the isolated linker (`bunfig.toml`). Install with `bun install --ignore-scripts`.
- Tests run under node, not bun's test runner.
- Each package keeps its own build setup (Makefile, rollup, mocha, eslint) as imported. Shared root tooling is a later normalization pass.
- Stable releases are blocked while `.prerelease-only` exists at the repo root: every publish carries an rc suffix and lands on the npm dist-tag `next`. The go/no-go checkpoint removes the file.

## Commands

```
make check            # membership closure check
make verify           # install, ordered build, checks, tests across the workspace
make release v=<v>    # bump to <v> and open a release PR
make release-dry v=<v>
```
