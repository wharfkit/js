import path from 'path'
import {fileURLToPath} from 'url'
import fs from 'fs'
import dts from 'rollup-plugin-dts'
import typescript from '@rollup/plugin-typescript'

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
        plugins: [typescript({target: 'es6'})],
        external,
    },
    {
        input: 'src/index.ts',
        output: {
            file: pkg.module,
            format: 'esm',
            sourcemap: true,
        },
        plugins: [typescript({target: 'es2020'})],
        external,
    },
    {
        input: 'src/index.ts',
        output: {file: pkg.types, format: 'esm'},
        plugins: [dts()],
    },
]
