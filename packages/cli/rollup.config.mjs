import path from 'path'
import {fileURLToPath} from 'url'
import fs from 'fs'
import typescript from '@rollup/plugin-typescript'
import cleanup from 'rollup-plugin-cleanup'
import json from '@rollup/plugin-json'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json')))

const external = ['fs', ...Object.keys(pkg.dependencies)]

const banner = `
#!/usr/bin/env node
process.removeAllListeners('warning')
`.trim()

/** @type {import('rollup').RollupOptions} */
export default {
    input: 'src/index.ts',
    output: {
        banner,
        file: pkg.main,
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
    },
    plugins: [typescript({target: 'es6'}), json(), cleanup({extensions: ['js', 'ts']})],
    external,
}
