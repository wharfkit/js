import {existsSync, readFileSync, readdirSync} from 'node:fs'
import {join} from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const DEP_TYPES = ['dependencies', 'devDependencies', 'optionalDependencies']

interface Manifest {
    name: string
    [key: string]: any
}

function readManifest(dir: string): Manifest | null {
    const path = join(dir, 'package.json')
    if (!existsSync(path)) return null
    return JSON.parse(readFileSync(path, 'utf8'))
}

function memberManifests(): Manifest[] {
    const packagesDir = join(ROOT, 'packages')
    if (!existsSync(packagesDir)) return []
    return readdirSync(packagesDir)
        .sort()
        .map((dir) => readManifest(join(packagesDir, dir)))
        .filter((json): json is Manifest => json !== null)
}

function wharfRefs(json: Manifest, type: string): Array<[string, string]> {
    return Object.entries(json[type] ?? {}).filter(([name]) =>
        name.startsWith('@wharfkit/')
    ) as Array<[string, string]>
}

function main() {
    const args = process.argv.slice(2)
    const candidateIndex = args.indexOf('--candidate')
    const members = memberManifests()
    const names = new Set(members.map((m) => m.name))
    const errors: string[] = []

    for (const member of members) {
        for (const type of DEP_TYPES) {
            for (const [name, range] of wharfRefs(member, type)) {
                if (range !== 'workspace:*') {
                    errors.push(
                        `${member.name}: ${type} ${name} is "${range}", expected "workspace:*"`
                    )
                }
            }
        }
        for (const [name] of wharfRefs(member, 'peerDependencies')) {
            errors.push(
                `${member.name}: peer dependency on ${name}; the workspace policy has no @wharfkit/* peers`
            )
        }
    }

    if (candidateIndex !== -1) {
        const candidateDir = args[candidateIndex + 1]
        if (!candidateDir) {
            console.error('usage: check-closure.ts [--candidate <dir>]')
            process.exit(2)
        }
        const candidate = readManifest(candidateDir)
        if (!candidate) {
            console.error(`check-closure: no package.json in ${candidateDir}`)
            process.exit(2)
        }
        const missing = new Set<string>()
        for (const type of [...DEP_TYPES, 'peerDependencies']) {
            for (const [name] of wharfRefs(candidate, type)) {
                if (!names.has(name) && name !== candidate.name) {
                    missing.add(name)
                }
            }
        }
        if (missing.size > 0) {
            console.error(
                `check-closure: importing ${candidate.name} requires these packages in the same batch or already imported:`
            )
            for (const name of [...missing].sort()) console.error(`  ${name}`)
            process.exit(1)
        }
        console.log(`check-closure: ${candidate.name} closes over the current membership`)
    }

    if (errors.length > 0) {
        console.error('check-closure: membership closure violated')
        for (const error of errors) console.error(`  ${error}`)
        process.exit(1)
    }
    console.log(`check-closure: ${members.length} member(s), closure holds`)
}

main()
