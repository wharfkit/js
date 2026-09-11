# WharfKit JS

Monorepo for the `@wharfkit/*` TypeScript packages. Every member package lives under `packages/<name>/`, keeps its published npm name, and releases in lockstep: one version number across the whole workspace, with internal references declared as `workspace:*` in source and rewritten to exact pins at pack time. The design goal is that every release resolves to exactly one `@wharfkit/antelope` instance.

## Layout

- `packages/<name>/` holds one npm package per directory, imported with full history from its standalone repository.
- `scripts/` holds the workspace tooling: `release.ts` (version bump, verify, and publish), `import-package.ts` (standalone repo import), and the `check-*.ts` scripts behind `make check`.
- `scripts/vendor/git-filter-repo` is a vendored, version-pinned copy of [git-filter-repo](https://github.com/newren/git-filter-repo) (v2.47.0, byte-identical to the upstream release, MIT licensed with the notice at `scripts/vendor/COPYING.mit`), invoked by `import-package.ts` via `python3`. No system install is required.
- `common.mk` is the Makefile every library member includes. It defines the build, test, lint, format, docs, coverage, and browser-bundle targets once, so a member's own Makefile is a few variable settings. `web-renderer`, `web-ui`, `svelte-components`, and `bundle` carry their own Svelte or Vite toolchains behind the same target names.

## Toolchain

- Package manager: bun workspaces with the isolated linker (`bunfig.toml`). Install with `bun install --ignore-scripts`.
- Third-party development dependencies are declared once at the root. Members declare only their runtime dependencies and their `workspace:*` references.
- Build: rolldown, with declarations from `tsc`. Lint and format: oxlint and oxfmt, configured at the root.
- Tests run under node with mocha, not bun's test runner. Node 20.19 is the supported floor.
- Stable releases are blocked while `.prerelease-only` exists at the repo root: every publish carries an rc suffix and lands on the npm dist-tag `next`.

## Branches

`dev` is the default branch and the integration branch: pull requests target it. `master` holds exactly what is published on npm. A release is one reviewed promotion pull request from `dev` to `master`, and the push to `master` publishes every member.

## Commands

```
make check            # membership closure, dependency, single-instance, license, and formatting checks
make verify           # install, ordered build, per-member checks and tests across the workspace
make pages            # API documentation, coverage, and browser tests for every member under build/pages/
make release v=<v>    # bump to <v> and open a release PR
make release-dry v=<v>
```

Inside a member directory, `make` builds it, `make test` runs its tests, and `make check` lints it.

## Documentation

Consumer documentation is on [wharfkit.com](https://wharfkit.com). API documentation, coverage reports, and browser test suites for every member are published from `master` to [wharfkit.github.io/js](https://wharfkit.github.io/js/), one directory per package.
