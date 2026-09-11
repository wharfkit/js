#!/usr/bin/env bun
// Assembles every member's API docs, coverage report, and browser test page
// into build/pages/<name>/ for GitHub Pages.
import {execFileSync} from 'node:child_process'
import {
    cpSync,
    existsSync,
    mkdirSync,
    readdirSync,
    readFileSync,
    rmSync,
    writeFileSync,
} from 'node:fs'
import {join} from 'node:path'

const ROOT = join(import.meta.dir, '..')
const OUT = join(ROOT, 'build', 'pages')
const BASE = '/js'

function run(cmd: string, args: string[], opts: {cwd?: string; env?: Record<string, string>} = {}) {
    execFileSync(cmd, args, {
        cwd: opts.cwd ?? ROOT,
        stdio: 'inherit',
        env: {...process.env, ...opts.env},
    })
}

run('bun', ['scripts/release.ts', 'build'])
rmSync(OUT, {recursive: true, force: true})
mkdirSync(OUT, {recursive: true})

const published: {name: string; description: string; coverage: boolean; tests: boolean}[] = []
for (const name of readdirSync(join(ROOT, 'packages')).sort()) {
    const dir = join(ROOT, 'packages', name)
    const manifest = join(dir, 'package.json')
    if (!existsSync(manifest)) continue
    const json = JSON.parse(readFileSync(manifest, 'utf8'))
    const makefile = existsSync(join(dir, 'Makefile'))
        ? readFileSync(join(dir, 'Makefile'), 'utf8')
        : ''
    let source: string
    if (makefile.includes('common.mk')) {
        run('make', ['-C', dir, 'build/pages'])
        source = join(dir, 'build', 'pages')
    } else if (name === 'svelte-components') {
        run('bun', ['run', 'build'], {cwd: dir, env: {BASE_PATH: `${BASE}/${name}`}})
        source = join(dir, 'build')
    } else {
        continue
    }
    cpSync(source, join(OUT, name), {recursive: true})
    published.push({
        name,
        description: json.description ?? '',
        coverage: existsSync(join(OUT, name, 'coverage')),
        tests: existsSync(join(OUT, name, 'tests.html')),
    })
}

const rows = published
    .map(
        ({name, description, coverage, tests}) =>
            `<tr><td><a href="${BASE}/${name}/">${name}</a></td><td>${description}</td><td>` +
            [
                coverage ? `<a href="${BASE}/${name}/coverage/">coverage</a>` : '',
                tests ? `<a href="${BASE}/${name}/tests.html">browser tests</a>` : '',
            ]
                .filter(Boolean)
                .join(' · ') +
            `</td></tr>`
    )
    .join('\n')
writeFileSync(
    join(OUT, 'index.html'),
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>WharfKit JS</title>` +
        `<style>body{font-family:system-ui;max-width:60rem;margin:2rem auto;padding:0 1rem}` +
        `table{border-collapse:collapse;width:100%}td{padding:.4rem .6rem;border-bottom:1px solid #ddd;vertical-align:top}</style>` +
        `</head><body><h1>WharfKit JS</h1><p>API documentation, coverage reports, and browser test suites for every package in ` +
        `<a href="https://github.com/wharfkit/js">wharfkit/js</a>. Consumer documentation is on <a href="https://wharfkit.com">wharfkit.com</a>.</p>` +
        `<table>${rows}</table></body></html>\n`
)
console.log(`pages assembled for ${published.length} member(s) in ${OUT}`)
