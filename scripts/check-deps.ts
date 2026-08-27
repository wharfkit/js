#!/usr/bin/env bun
// Every third-party import must be declared, and every runtime dependency must be imported.
// The isolated linker used to catch the first direction by accident; root-declared toolchain
// removed that, so both directions are checked deliberately here.
import {readdirSync, readFileSync, existsSync, statSync} from 'node:fs'
import {join, dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import {builtinModules} from 'node:module'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const BUILTIN = new Set([...builtinModules, ...builtinModules.map((m) => `node:${m}`)])

// Imports a member may use without declaring them itself: tsconfig path aliases, and
// bare specifiers that baseUrl resolves inside the package.
const AMBIENT = new Set(['$lib', '$test'])
const BASE_URL_ROOTS = new Set(['src', 'test'])

// Declared on purpose without a source import. Each entry states why.
const ALLOW_UNUSED: Record<string, string> = {
    '@wharfkit/protocol-esr:ws': 'peer dependency of isomorphic-ws under node',
    '@wharfkit/wallet-plugin-anchor:ws': 'peer dependency of isomorphic-ws under node',
}
const ALLOW_UNDECLARED: Record<string, string> = {
    '@wharfkit/web-renderer:svelte': 'framework supplied by the consuming application',
}

function walk(dir: string, out: string[] = []): string[] {
    if (!existsSync(dir)) return out
    for (const entry of readdirSync(dir)) {
        if (entry === 'node_modules' || entry === 'lib' || entry === 'build') continue
        const path = join(dir, entry)
        if (statSync(path).isDirectory()) walk(path, out)
        else if (/\.(ts|mjs|js)$/.test(entry)) out.push(path)
    }
    return out
}

function imports(file: string): string[] {
    const source = readFileSync(file, 'utf8')
    const found = new Set<string>()
    const patterns = [
        /(?:^|\n)\s*import\s[^'"]*from\s*['"]([^'"]+)['"]/g,
        /(?:^|\n)\s*import\s*['"]([^'"]+)['"]/g,
        /\brequire\(\s*['"]([^'"]+)['"]\s*\)/g,
        /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g,
    ]
    for (const pattern of patterns) {
        for (const match of source.matchAll(pattern)) found.add(match[1])
    }
    return [...found]
}

function packageName(specifier: string): string | null {
    if (specifier.startsWith('.') || specifier.startsWith('/')) return null
    if (BUILTIN.has(specifier)) return null
    for (const ambient of AMBIENT) {
        if (specifier === ambient || specifier.startsWith(`${ambient}/`)) return null
    }
    if (BASE_URL_ROOTS.has(specifier.split('/')[0])) return null
    const parts = specifier.split('/')
    return specifier.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0]
}

const rootJson = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))
const rootDev = new Set(Object.keys(rootJson.devDependencies ?? {}))

const problems: string[] = []
let checked = 0

for (const name of readdirSync(join(ROOT, 'packages'))) {
    const dir = join(ROOT, 'packages', name)
    const manifest = join(dir, 'package.json')
    if (!existsSync(manifest)) continue
    checked++
    const json = JSON.parse(readFileSync(manifest, 'utf8'))
    const runtime = new Set(Object.keys(json.dependencies ?? {}))
    const dev = new Set(Object.keys(json.devDependencies ?? {}))
    const self = json.name

    const runtimeUsed = new Set<string>()
    for (const file of walk(join(dir, 'src'))) {
        for (const specifier of imports(file)) {
            const pkg = packageName(specifier)
            if (!pkg || pkg === self) continue
            runtimeUsed.add(pkg)
            if (!runtime.has(pkg) && !ALLOW_UNDECLARED[`${json.name}:${pkg}`]) {
                problems.push(
                    `${json.name}: src imports ${pkg} but does not declare it as a dependency`
                )
            }
        }
    }
    for (const declared of runtime) {
        // tslib is emitted by importHelpers rather than imported in source
        if (declared === 'tslib') continue
        if (ALLOW_UNUSED[`${json.name}:${declared}`]) continue
        if (!runtimeUsed.has(declared)) {
            problems.push(
                `${json.name}: declares dependency ${declared} but never imports it from src`
            )
        }
    }

    const outside = [...walk(join(dir, 'test')), ...walk(dir).filter((f) => f.endsWith('.mjs'))]
    for (const file of outside) {
        for (const specifier of imports(file)) {
            const pkg = packageName(specifier)
            if (!pkg || pkg === self) continue
            if (!runtime.has(pkg) && !dev.has(pkg) && !rootDev.has(pkg)) {
                problems.push(
                    `${json.name}: ${file.slice(dir.length + 1)} imports undeclared ${pkg}`
                )
            }
        }
    }
}

for (const problem of [...new Set(problems)].sort()) console.log(problem)
console.log(`check-deps: ${checked} member(s), ${new Set(problems).size} problem(s)`)
if (problems.length) process.exit(1)
