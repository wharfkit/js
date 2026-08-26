import fs from 'fs'
import path from 'path'
import {fileURLToPath} from 'url'
import alias from '@rollup/plugin-alias'
import dts from 'rollup-plugin-dts'
import typescript from '@rollup/plugin-typescript'
import cleanup from 'rollup-plugin-cleanup'

// eslint-disable-next-line es-x/no-import-meta
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json')))

const external = Object.keys(pkg.dependencies)

/** @type {import('rollup').RollupOptions} */
export default [
    {
        input: 'src/index.ts',
        output: {
            file: pkg.main,
            format: 'cjs',
            esModule: true,
            sourcemap: true,
            exports: 'named',
        },
        plugins: [typescript({target: 'es2020'}), cleanup({extensions: ['js', 'ts']})],
        external,
    },
    {
        input: 'src/index.ts',
        output: {
            file: pkg.module,
            format: 'esm',
            sourcemap: true,
        },
        plugins: [typescript({target: 'es2020'}), cleanup({extensions: ['js', 'ts']})],
        external,
    },
    {
        input: 'src/index.ts',
        output: {
            file: pkg.browser[`./${pkg.module}`],
            format: 'esm',
            sourcemap: true,
        },
        plugins: [
            alias({
                entries: [
                    {find: './mock/fetch', replacement: './mock/browser-fetch.ts'},
                    {find: './fetch', replacement: './browser-fetch.ts'},
                ],
            }),
            typescript({target: 'es2020'}),
            cleanup({extensions: ['js', 'ts']}),
        ],
        external,
    },
    {
        input: 'src/index.ts',
        output: {file: pkg.types, format: 'esm'},
        plugins: [dts(), cleanup({extensions: ['d.ts']})],
    },
]
