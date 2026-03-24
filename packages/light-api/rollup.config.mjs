import fs from 'fs'
import path from 'path'
import {fileURLToPath} from 'url'

import dts from 'rollup-plugin-dts'
import typescript from '@rollup/plugin-typescript'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json')))

const external = Object.keys(pkg.dependencies)

export default [
    {
        input: 'src/index.ts',
        output: {
            file: pkg.main,
            format: 'cjs',
            sourcemap: true,
        },
        plugins: [typescript({target: 'es6'})],
        external,
        onwarn,
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
        onwarn,
    },
    {
        input: 'src/index.ts',
        output: {file: pkg.types, format: 'esm'},
        onwarn,
        plugins: [dts()],
    },
]

function onwarn(warning, rollupWarn) {
    if (warning.code === 'CIRCULAR_DEPENDENCY') {
        // unnecessary warning
        return
    }
    if (
        warning.code === 'UNUSED_EXTERNAL_IMPORT' &&
        warning.source === 'tslib' &&
        warning.names[0] === '__read'
    ) {
        // when using ts with importHelpers: true rollup complains about this
        // seems safe to ignore since __read is not actually imported or used anywhere in the resulting bundles
        return
    }
    rollupWarn(warning)
}
