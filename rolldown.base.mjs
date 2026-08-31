// Shared rolldown build for every member package. Call from packages/<name>/rolldown.config.mjs
// with `import.meta.url`. Mirrors the rollup configs this replaces; see the option docs below.

import fs from 'fs'
import path from 'path'
import {fileURLToPath} from 'url'

import {dts} from 'rolldown-plugin-dts'

const OUT_DIR = process.env.ROLLDOWN_OUT ?? 'lib'

/**
 * The members built by the shared toolchain, which are exactly the packages whose Makefile
 * includes common.mk. Of those, the ones that emit a browser test bundle are the ones that do
 * not blank BROWSER_OUT.
 *
 * @param {string} root                  the workspace root
 * @param {object} [o]
 * @param {boolean} [o.browser]          restrict to members with a browser test bundle
 * @returns {string[]}
 */
export function members(root, o = {}) {
    return fs
        .readdirSync(path.join(root, 'packages'))
        .filter((name) => {
            const makefile = path.join(root, 'packages', name, 'Makefile')
            if (!fs.existsSync(makefile)) return false
            const text = fs.readFileSync(makefile, 'utf8')
            if (!/^include \.\.\/\.\.\/common\.mk$/m.test(text)) return false
            return !o.browser || !/^BROWSER_OUT :=\s*$/m.test(text)
        })
        .sort()
}

/**
 * The member to build: the one whose directory rolldown was invoked from, or every member when
 * it was invoked from the workspace root. Keeps `make -C packages/<name>` building one member.
 *
 * @param {string} root                  the workspace root
 * @param {string[]} all                 candidate member names
 * @returns {string[]}
 */
export function selected(root, all) {
    const cwd = process.cwd()
    const here = path.basename(cwd)
    return path.dirname(cwd) === path.join(root, 'packages') && all.includes(here) ? [here] : all
}

// In a .d.ts with no export declaration TypeScript exports every top-level declaration.
// rolldown-plugin-dts emits inline export modifiers only, so without a trailing export list the
// published type surface widens to include local helper interfaces that rollup kept private.
function closeDtsExports() {
    return {
        name: 'close-dts-exports',
        renderChunk(code, chunk) {
            if (!chunk.fileName.endsWith('.d.ts')) return null
            return `${code}\nexport {};\n`
        },
    }
}

/**
 * @param {string} dir                    the member's package directory
 * @param {object} [o]
 * @param {boolean|string} [o.banner]     license banner; a string overrides the product name
 * @param {string} [o.bannerText]        literal banner, in place of the license block
 * @param {boolean} [o.comments]         keep comments (default false only where cleanup ran)
 * @param {boolean} [o.esModule]          output.esModule on the CJS build (default true)
 * @param {boolean} [o.stripInternal]     drop @internal from the declaration build
 * @param {boolean} [o.replaceVersion]    substitute __ver with pkg.version
 * @param {boolean} [o.browser]           platform browser
 * @param {boolean} [o.bundleDeps]        resolve node_modules; external is the declared list only
 * @param {string[]} [o.cjsExternal]      override the CJS external list
 * @param {boolean} [o.dir]               emit to output.dir rather than output.file
 * @param {boolean} [o.types]             emit declarations (default true)
 * @param {boolean} [o.esm]               emit the ESM build (default true)
 * @param {string[]} [o.externalExtra]    extra ids treated as external
 * @param {object[]} [o.extraOutputs]     additional {file, format, alias} builds
 * @returns {import('rolldown').RolldownOptions[]}
 */
export function libraryConfig(dir, o = {}) {
    const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json')))
    // OUT_DIR replaces the manifest's own top-level output directory, so a member that emits
    // into lib/cjs, lib/esm and lib/types keeps those subdirectories
    const relocate = (f) => path.join(dir, f.replace(/^\.\//, '').replace(/^[^/]+/, OUT_DIR))
    const out = (f) => relocate(f)
    const outDir = (f) => path.dirname(relocate(f))

    let banner = o.bannerText
    if (o.banner) {
        const name = typeof o.banner === 'string' ? o.banner : pkg.name
        const license = fs.readFileSync(path.join(dir, 'LICENSE')).toString('utf-8').trim()
        banner = `
/**
 * ${name} v${pkg.version}
 * ${pkg.homepage}
 *
 * @license
 * ${license.replace(/\n/g, '\n * ')}
 */
`.trim()
    }

    const declared = [...Object.keys(pkg.dependencies ?? {}), ...(o.externalExtra ?? [])]
    // rolldown resolves node_modules where these rollup configs did not, so anything not
    // relative or absolute has to be named external or it is silently vendored into the bundle.
    const externalAll = (id) =>
        !id.startsWith('.') && !path.isAbsolute(id) && !id.startsWith('@oxc-project/')
    const external = o.bundleDeps ? declared : externalAll

    const comments = o.comments === true ? undefined : false
    const target = {target: 'es2020'}
    const define = o.replaceVersion ? {__ver: JSON.stringify(pkg.version)} : undefined

    const shared = {
        input: path.join(dir, 'src/index.ts'),
        external,
        tsconfig: path.join(dir, 'tsconfig.json'),
        transform: define ? {...target, define} : target,
        ...(o.browser ? {platform: 'browser'} : {}),
    }
    const place = o.dir ? (f) => ({dir: outDir(f)}) : (f) => ({file: out(f)})

    const configs = [
        {
            ...shared,
            ...(o.cjsExternal ? {external: o.cjsExternal} : {}),
            output: {
                banner,
                ...place(pkg.main),
                format: 'cjs',
                esModule: o.esModule !== false,
                sourcemap: true,
                exports: 'named',
                ...(comments === false ? {comments: false} : {}),
            },
        },
    ]

    if (o.esm !== false) {
        configs.push({
            ...shared,
            output: {
                banner,
                ...place(pkg.module),
                format: 'esm',
                sourcemap: true,
                ...(comments === false ? {comments: false} : {}),
            },
        })
    }

    for (const extra of o.extraOutputs ?? []) {
        configs.push({
            ...shared,
            ...(extra.alias ? {resolve: {alias: extra.alias}} : {}),
            output: {
                banner,
                file: out(extra.file),
                format: extra.format ?? 'esm',
                sourcemap: true,
                ...(comments === false ? {comments: false} : {}),
            },
        })
    }

    if (o.types !== false) {
        configs.push({
            ...shared,
            plugins: [
                dts({
                    cwd: dir,
                    tsconfig: path.join(dir, 'tsconfig.json'),
                    generator: 'tsc',
                    emitDtsOnly: true,
                    ...(o.stripInternal ? {compilerOptions: {stripInternal: true}} : {}),
                }),
                closeDtsExports(),
            ],
            output: {
                banner,
                dir: outDir(pkg.types),
                // rolldown-plugin-dts names the declaration entry '<entry>.d'; the manifests
                // expect <name>.d.ts, and a plain string would collide with the JS entry
                entryFileNames: (chunk) =>
                    chunk.name.endsWith('.d') ? path.basename(pkg.types) : '[name].js',
                format: 'esm',
            },
        })
    }

    return configs
}
