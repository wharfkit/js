// Browser test bundle for one member package, built with rolldown. Mirrors the option surface of
// browser-test.base.mjs; call from packages/<name>/test/rolldown.config.mjs with import.meta.url.

import fs from 'fs'
import path from 'path'
import {fileURLToPath} from 'url'

// resolve.alias loses to the tsconfig paths these test configs rely on, so $lib would silently
// resolve to src and the bundle would never contain the built output it is meant to exercise.
// A resolveId hook runs ahead of both, matching @rollup/plugin-alias's semantics.
function aliasPlugin(entries) {
    const sorted = Object.entries(entries).sort((a, b) => b[0].length - a[0].length)
    return {
        name: 'alias',
        async resolveId(id, importer) {
            for (const [find, replacement] of sorted) {
                let mapped = null
                if (find.endsWith('/')) {
                    if (id.startsWith(find)) mapped = replacement + id.slice(find.length)
                } else if (id === find) mapped = replacement
                else if (id.startsWith(`${find}/`)) mapped = replacement + id.slice(find.length)
                if (mapped === null) continue
                // the mapped path may still need an extension, as @rollup/plugin-alias's
                // re-resolution provided
                const resolved = await this.resolve(mapped, importer, {skipSelf: true})
                return resolved ?? mapped
            }
            return null
        },
    }
}

const template = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Tests</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="https://unpkg.com/mocha@11/mocha.css" />
  </head>
  <body>
    <div id="mocha"></div>
    <script src="https://unpkg.com/mocha@11/mocha.js"></script>
    <script class="mocha-init">
      mocha.setup('tdd');
      mocha.checkLeaks();
    </script>
    <script>%%tests%%</script>
    <script class="mocha-exec">
      mocha.run();
    </script>
  </body>
</html>
`

// the entry is a generated list of imports rather than a file on disk
function virtualEntry(id, code) {
    return {
        name: 'virtual-entry',
        resolveId: (source) => (source === id ? `\0${id}` : null),
        load: (resolved) => (resolved === `\0${id}` ? code : null),
    }
}

// rolldown honours the "sideEffects": false every member declares, so an entry of side-effect-only
// imports tree-shakes to nothing and the build stays green. A size floor cannot be the alarm,
// because eight members have placeholder suites whose bundles are legitimately a few hundred
// bytes; what has to hold is that every test file reached the output.
function inline(pkgDir, testFiles) {
    return {
        name: 'Inliner',
        generateBundle(opts, bundle) {
            const file = path.basename(opts.file)
            const output = bundle[file]
            const present = new Set(Object.keys(output.modules ?? {}))
            const missing = testFiles.filter((f) => !present.has(f))
            if (missing.length) {
                this.error(
                    `${file}: ${missing.length} of ${testFiles.length} test file(s) are absent from the bundle, starting with ${path.relative(pkgDir, missing[0])}; they have been tree-shaken away`
                )
            }
            delete bundle[file]
            this.emitFile({
                type: 'asset',
                fileName: file,
                source: template.replace('%%tests%%', `${output.code}`),
            })
        },
    }
}

/** @see browserTestConfig in browser-test.base.mjs for the options */
export function browserTestConfig(pkgDir, options = {}) {
    const testDir = path.join(pkgDir, 'test')
    const pkg = JSON.parse(fs.readFileSync(path.join(pkgDir, 'package.json')))
    const libDir = process.env.ROLLDOWN_OUT ?? 'lib'

    const dataDir = path.join(testDir, options.dataDir ?? 'data')
    const mockData = Object.fromEntries(
        (fs.existsSync(dataDir) ? fs.readdirSync(dataDir) : [])
            .map((f) => path.join(dataDir, f))
            .filter((f) => fs.statSync(f).isFile())
            .map((f) => [path.basename(f), JSON.parse(fs.readFileSync(f))])
    )

    const testsDir = path.join(testDir, options.testsDir ?? 'tests')
    const testFiles = (fs.existsSync(testsDir) ? fs.readdirSync(testsDir) : [])
        .filter((f) => f.match(/\.ts$/))
        .map((f) => path.join(testsDir, f))
        .sort()

    const browserFetch = path.join(testDir, 'utils/browser-fetch.ts')
    const alias = {}
    if (options.libSource) {
        alias.$lib = path.join(pkgDir, 'src', 'index.ts')
        alias['$lib/'] = path.join(pkgDir, 'src') + '/'
    } else if (options.lib !== false) {
        alias.$lib = path.join(pkgDir, (options.lib ?? pkg.module).replace(/^[^/]+/, libDir))
    }
    if (options.browserFetch) {
        alias['$test/utils/mock-fetch'] = browserFetch
        alias['../utils/mock-fetch'] = browserFetch
    }
    if (options.browserProvider) {
        alias['./utils/mock-provider'] = path.join(testDir, 'utils/browser-provider.ts')
    }
    for (const {find, replacement} of options.aliases ?? []) {
        alias[find] = path.isAbsolute(replacement) ? replacement : path.join(testDir, replacement)
    }

    return [
        {
            input: 'tests.ts',
            // the entry is a list of side-effect-only imports; rolldown's default tree-shaking
            // discards every one of them and emits a 0-byte bundle without warning
            treeshake: false,
            platform: 'browser',
            external: ['mocha', 'crypto', 'util'],
            tsconfig: path.join(testDir, 'tsconfig.json'),
            transform: {
                target: 'es2020',
                define: {'global.MOCK_DATA': JSON.stringify(mockData)},
            },
            plugins: [
                aliasPlugin(alias),
                virtualEntry(
                    'tests.ts',
                    testFiles.map((f) => `import '${f.slice(0, -3)}'`).join('\n')
                ),
                inline(pkgDir, testFiles),
            ],
            output: {
                file: path.join(pkgDir, options.output ?? 'build/browser.html'),
                format: 'iife',
                codeSplitting: false,
                sourcemap: options.sourcemap ?? true,
                globals: {mocha: 'mocha', util: 'undefined', crypto: 'undefined'},
            },
        },
    ]
}
