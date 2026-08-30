#!/usr/bin/env bun
import {existsSync, readFileSync, readdirSync} from 'node:fs'
import {join} from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname

function fail(message: string): never {
    console.error(`check-instances: ${message}`)
    process.exit(1)
}

function memberNames(): Set<string> {
    const packagesDir = join(ROOT, 'packages')
    if (!existsSync(packagesDir)) return new Set()
    const names = new Set<string>()
    for (const entry of readdirSync(packagesDir).sort()) {
        const path = join(packagesDir, entry, 'package.json')
        if (!existsSync(path)) continue
        names.add(JSON.parse(readFileSync(path, 'utf8')).name)
    }
    return names
}

interface Resolution {
    key: string
    name: string
    version: string
}

// bun.lock is JSONC; every resolution is one `"<path>": ["<name>@<version>", ...]` line.
function resolutions(lock: string): Resolution[] {
    const found: Resolution[] = []
    const pattern = /^\s*"([^"]+)": \["(@wharfkit\/[^"@]+)@([^"]+)"/gm
    for (const match of lock.matchAll(pattern)) {
        found.push({key: match[1], name: match[2], version: match[3]})
    }
    return found
}

export function checkInstances(): number {
    const lockPath = join(ROOT, 'bun.lock')
    if (!existsSync(lockPath)) fail('no bun.lock; run bun install and retry')
    const names = memberNames()
    const all = resolutions(readFileSync(lockPath, 'utf8'))
    const aliens = all.filter((r) => names.has(r.name) && !r.version.startsWith('workspace:'))
    if (aliens.length > 0) {
        for (const alien of aliens) {
            console.error(
                `check-instances: ${alien.key} resolves ${alien.name} to ${alien.version}, ` +
                    `not the workspace copy`
            )
        }
        fail(
            `${aliens.length} published copy/copies of member package(s) in the tree; ` +
                `every member must resolve to one instance (see the root overrides)`
        )
    }
    return all.filter((r) => names.has(r.name)).length
}

if (import.meta.main) {
    console.log(`check-instances: ${checkInstances()} member resolution(s), one instance each`)
}
