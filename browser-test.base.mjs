import fs from 'fs'
import path from 'path'
import {fileURLToPath} from 'url'

import terser from '@rollup/plugin-terser'
import alias from '@rollup/plugin-alias'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import replace from '@rollup/plugin-replace'
import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import virtual from '@rollup/plugin-virtual'

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

function inline() {
    return {
        name: 'Inliner',
        generateBundle(opts, bundle) {
            const file = path.basename(opts.file)
            const output = bundle[file]
            delete bundle[file]
            this.emitFile({
                type: 'asset',
                fileName: file,
                source: template.replace('%%tests%%', `${output.code}`),
            })
        },
    }
}

/**
 * Browser test bundle for one member package. Call from packages/<name>/test/rollup.config.mjs
 * with `import.meta.url`.
 *
 * @param {string} metaUrl        the calling config's import.meta.url
 * @param {object} [options]
 * @param {string} [options.output]         bundle path, relative to the package (default build/browser.html)
 * @param {string} [options.testsDir]       test sources, relative to test/ (default tests)
 * @param {string} [options.dataDir]        fixtures, relative to test/ (default data)
 * @param {boolean} [options.libSource]     alias $lib to the package's src/ instead of its built module
 * @param {string|false} [options.lib]      $lib alias target, relative to the package (default pkg.module;
 *                                          false leaves $lib to the test tsconfig's paths)
 * @param {boolean} [options.browserFetch]  alias mock-fetch to test/utils/browser-fetch.ts
 * @param {boolean} [options.browserProvider] alias ./utils/mock-provider to ./utils/browser-provider.ts
 * @param {boolean|string} [options.sourcemap] rollup sourcemap mode (default true)
 * @param {Array} [options.aliases]         extra @rollup/plugin-alias entries
 * @param {object} [options.resolveOptions] overrides for @rollup/plugin-node-resolve
 * @returns {import('rollup').RollupOptions[]}
 */
export function browserTestConfig(metaUrl, options = {}) {
    const testDir = path.dirname(fileURLToPath(metaUrl))
    const pkgDir = path.join(testDir, '..')
    const pkg = JSON.parse(fs.readFileSync(path.join(pkgDir, 'package.json')))

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
    const entries = [
        ...(options.libSource
            ? [
                  {find: /^\$lib$/, replacement: path.join(pkgDir, 'src', 'index.ts')},
                  {find: /^\$lib\//, replacement: path.join(pkgDir, 'src') + '/'},
              ]
            : options.lib === false
              ? []
              : [{find: '$lib', replacement: path.join(pkgDir, options.lib ?? pkg.module)}]),
        ...(options.browserFetch
            ? [
                  {find: '$test/utils/mock-fetch', replacement: browserFetch},
                  {find: '../utils/mock-fetch', replacement: browserFetch},
              ]
            : []),
        ...(options.browserProvider
            ? [
                  {
                      find: './utils/mock-provider',
                      replacement: './utils/browser-provider.ts',
                  },
              ]
            : []),
        ...(options.aliases ?? []),
    ]

    return [
        {
            input: 'tests.ts',
            output: {
                file: options.output ?? 'build/browser.html',
                format: 'iife',
                inlineDynamicImports: true,
                sourcemap: options.sourcemap ?? true,
                globals: {
                    mocha: 'mocha',
                    util: 'undefined',
                    crypto: 'undefined',
                },
            },
            external: ['mocha', 'crypto', 'util'],
            plugins: [
                virtual({
                    'tests.ts': testFiles.map((f) => `import '${f.slice(0, -3)}'`).join('\n'),
                }),
                alias({entries}),
                typescript({
                    target: 'es6',
                    module: 'esnext',
                    moduleResolution: 'bundler',
                    tsconfig: './test/tsconfig.json',
                }),
                replace({
                    'global.MOCK_DATA': JSON.stringify(mockData),
                    preventAssignment: true,
                }),
                resolve({browser: true, ...options.resolveOptions}),
                commonjs(),
                json(),
                terser({
                    mangle: false,
                    format: {beautify: true},
                    compress: false,
                }),
                inline(),
            ],
        },
    ]
}
