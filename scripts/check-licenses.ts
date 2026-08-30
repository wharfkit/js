#!/usr/bin/env bun
import {existsSync, readFileSync, readdirSync} from 'node:fs'
import {join} from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname

export const LICENSE_ID = 'BSD-3-Clause'

// Permissive only; copyleft would reach through to consumers embedding the SDK.
const ALLOWED_DEP_LICENSES = new Set([
    '0BSD',
    'Apache-2.0',
    'BSD-2-Clause',
    'BSD-3-Clause',
    'ISC',
    'MIT',
    '(MIT AND Zlib)',
    'Zlib',
])

// Dependency -> why its license is recorded here rather than read from its manifest.
const DEP_EXEMPT: Record<string, string> = {}

interface Member {
    name: string
    dir: string
    json: any
}

function fail(message: string): never {
    console.error(`licenses: ${message}`)
    process.exit(1)
}

function members(): Member[] {
    const packagesDir = join(ROOT, 'packages')
    if (!existsSync(packagesDir)) return []
    const list: Member[] = []
    for (const entry of readdirSync(packagesDir).sort()) {
        const dir = join(packagesDir, entry)
        const manifestPath = join(dir, 'package.json')
        if (!existsSync(manifestPath)) continue
        const json = JSON.parse(readFileSync(manifestPath, 'utf8'))
        list.push({name: json.name, dir, json})
    }
    return list
}

export function checkMemberLicenses(list: Member[] = members()): number {
    const canonical = readFileSync(join(ROOT, 'LICENSE'), 'utf8').split('\n').slice(1).join('\n')
    for (const member of list) {
        if (member.json.license !== LICENSE_ID) {
            fail(
                `${member.name}: license is ${member.json.license ?? 'unset'}, expected ${LICENSE_ID}`
            )
        }
        const path = join(member.dir, 'LICENSE')
        if (!existsSync(path)) fail(`${member.name}: no LICENSE file`)
        const [copyright, ...rest] = readFileSync(path, 'utf8').split('\n')
        if (rest.join('\n') !== canonical) {
            fail(`${member.name}: LICENSE body differs from the root LICENSE`)
        }
        if (!/^Copyright \(c\) \d{4} .+\.$/.test(copyright)) {
            fail(`${member.name}: LICENSE copyright line is malformed: ${copyright}`)
        }
    }
    return list.length
}

// Read through the linker's symlink; packages with restrictive `exports` refuse to resolve their own package.json.
function depManifest(member: Member, dep: string): any | null {
    for (const base of [join(member.dir, 'node_modules'), join(ROOT, 'node_modules')]) {
        const path = join(base, dep, 'package.json')
        if (existsSync(path)) return JSON.parse(readFileSync(path, 'utf8'))
    }
    return null
}

export function checkDependencyLicenses(list: Member[] = members()): number {
    const seen = new Set<string>()
    for (const member of list) {
        for (const dep of Object.keys(member.json.dependencies ?? {})) {
            if (dep.startsWith('@wharfkit/')) continue
            if (DEP_EXEMPT[dep]) continue
            const manifest = depManifest(member, dep)
            if (!manifest) {
                fail(`${member.name}: cannot resolve ${dep}; run bun install and retry`)
            }
            const raw = manifest.license ?? manifest.licenses
            const id = typeof raw === 'string' ? raw : (raw?.[0]?.type ?? raw?.type)
            if (!id) {
                fail(`${dep}: declares no license (required by ${member.name})`)
            }
            if (!ALLOWED_DEP_LICENSES.has(id)) {
                fail(
                    `${dep}: license ${id} is not on the allowlist (required by ${member.name}); ` +
                        `add it to ALLOWED_DEP_LICENSES or record an exemption`
                )
            }
            seen.add(dep)
        }
    }
    return seen.size
}

if (import.meta.main) {
    const list = members()
    console.log(`licenses: ${checkMemberLicenses(list)} member(s) at ${LICENSE_ID}`)
    console.log(`licenses: ${checkDependencyLicenses(list)} runtime dependencies on the allowlist`)
}
