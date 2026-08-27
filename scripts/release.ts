import {execFileSync} from 'node:child_process'
import {existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import semver from 'semver'

const ROOT = new URL('..', import.meta.url).pathname

interface Member {
    name: string
    dir: string
    manifestPath: string
    json: any
}

function sh(cmd: string, args: string[], opts: {cwd?: string} = {}): string {
    return execFileSync(cmd, args, {
        cwd: opts.cwd ?? ROOT,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'inherit'],
    }).trim()
}

function trySh(cmd: string, args: string[], opts: {cwd?: string} = {}): string | null {
    try {
        return execFileSync(cmd, args, {
            cwd: opts.cwd ?? ROOT,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'pipe'],
        }).trim()
    } catch {
        return null
    }
}

function fail(message: string): never {
    console.error(`release: ${message}`)
    process.exit(1)
}

function log(message: string) {
    console.log(`release: ${message}`)
}

function rootManifest(): any {
    return JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))
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
        list.push({name: json.name, dir, manifestPath, json})
    }
    return list
}

function publishable(list: Member[]): Member[] {
    return list.filter((m) => m.json.private !== true)
}

// build order follows the runtime graph; devDependencies would make it cyclic
function internalDeps(json: any): string[] {
    const found = new Set<string>()
    for (const type of ['dependencies', 'optionalDependencies', 'peerDependencies']) {
        for (const name of Object.keys(json[type] ?? {})) {
            if (name.startsWith('@wharfkit/')) found.add(name)
        }
    }
    return [...found]
}

function topological(list: Member[]): Member[] {
    const byName = new Map(list.map((m) => [m.name, m]))
    const ordered: Member[] = []
    const visiting = new Set<string>()
    const done = new Set<string>()
    function visit(member: Member, chain: string[]) {
        if (done.has(member.name)) return
        if (visiting.has(member.name)) {
            log(
                `dependency cycle involving ${[...chain, member.name].join(' -> ')}; keeping declaration order inside it`
            )
            return
        }
        visiting.add(member.name)
        for (const dep of internalDeps(member.json)) {
            const target = byName.get(dep)
            if (target) visit(target, [...chain, member.name])
        }
        visiting.delete(member.name)
        done.add(member.name)
        ordered.push(member)
    }
    for (const member of list) visit(member, [])
    return ordered
}

function guardInternalRefs(list: Member[]) {
    for (const member of publishable(list).concat(list.filter((m) => m.json.private === true))) {
        for (const type of ['dependencies', 'devDependencies', 'optionalDependencies']) {
            for (const [name, range] of Object.entries(member.json[type] ?? {})) {
                if (name.startsWith('@wharfkit/') && range !== 'workspace:*') {
                    fail(`${member.name}: ${type} ${name} is "${range}", expected "workspace:*"`)
                }
            }
        }
        for (const name of Object.keys(member.json.peerDependencies ?? {})) {
            if (name.startsWith('@wharfkit/')) {
                fail(
                    `${member.name}: declares @wharfkit/* peer dependency ${name}; policy forbids it`
                )
            }
        }
    }
}

// Every member must reach every gate stage. A member that cannot is named here with its
// reason, so an exemption is a decision on the record rather than a renamed target.
const GATE_EXEMPT: Record<string, string> = {
    '@wharfkit/conformance:build':
        'the contract build needs Docker and the CDT toolchain; run make -C packages/conformance contract',
    '@wharfkit/conformance:test':
        'the suite runs under bun against a debug wasm built by Docker and CDT',
    '@wharfkit/conformance:browser': 'a C++ contract harness has no browser bundle',
}

function runScript(member: Member, script: string) {
    if (GATE_EXEMPT[`${member.name}:${script}`]) {
        log(`${member.name}: ${script} exempt (${GATE_EXEMPT[`${member.name}:${script}`]})`)
    } else if (member.json.scripts?.[script]) {
        log(`${member.name}: bun run ${script}`)
        execFileSync('bun', ['run', script], {cwd: member.dir, stdio: 'inherit'})
    } else if (script === 'build' && existsSync(join(member.dir, 'Makefile'))) {
        log(`${member.name}: make`)
        execFileSync('make', ['-C', member.dir], {stdio: 'inherit'})
    } else if (
        existsSync(join(member.dir, 'Makefile')) &&
        trySh('make', ['-C', member.dir, '-n', '--', script]) !== null
    ) {
        log(`${member.name}: make ${script}`)
        execFileSync('make', ['-C', member.dir, script], {stdio: 'inherit'})
    } else {
        fail(
            `${member.name}: no ${script} entry point; add one or record an exemption in GATE_EXEMPT`
        )
    }
}

function verify(opts: {install: boolean}) {
    if (opts.install) {
        log('bun install --ignore-scripts')
        execFileSync('bun', ['install', '--ignore-scripts'], {cwd: ROOT, stdio: 'inherit'})
    }
    const ordered = topological(members())
    for (const member of ordered) runScript(member, 'build')
    for (const member of ordered) runScript(member, 'check')
    for (const member of ordered) runScript(member, 'test')
    for (const member of ordered) runScript(member, 'browser')
    log(`verify complete across ${ordered.length} member(s)`)
}

function prereleaseBlocked(version: string): boolean {
    return semver.prerelease(version) === null && existsSync(join(ROOT, '.prerelease-only'))
}

function guardPrereleaseOnly(version: string) {
    if (prereleaseBlocked(version)) {
        fail(
            `.prerelease-only is present; stable version ${version} is blocked until the go/no-go checkpoint removes it`
        )
    }
}

function distTag(version: string): string {
    return semver.prerelease(version) ? 'next' : 'latest'
}

function resolveTarget(current: string, arg: string): string {
    if (semver.valid(arg)) return arg
    if (arg === 'prerelease') {
        const match = /^(\d+\.\d+\.\d+)-rc(\d+)$/.exec(current)
        if (!match)
            fail(`current version ${current} is not an rcN prerelease; pass an explicit version`)
        return `${match[1]}-rc${Number(match[2]) + 1}`
    }
    if (arg === 'major' || arg === 'minor' || arg === 'patch') {
        const next = semver.inc(current, arg)
        if (!next) fail(`cannot increment ${current} by ${arg}`)
        return next
    }
    fail(`unknown version argument "${arg}"`)
}

function writeVersion(manifestPath: string, version: string) {
    const raw = readFileSync(manifestPath, 'utf8')
    const updated = raw.replace(/"version":\s*"[^"]*"/, `"version": "${version}"`)
    if (updated === raw) fail(`${manifestPath}: no version field to rewrite`)
    writeFileSync(manifestPath, updated)
}

function packAndCheckPins(list: Member[]) {
    const out = mkdtempSync(join(tmpdir(), 'wharfkit-release-'))
    try {
        for (const member of publishable(list)) {
            sh('bun', ['pm', 'pack', '--destination', out], {cwd: member.dir})
        }
        for (const tarball of readdirSync(out)) {
            const manifest = sh('tar', ['-xzOf', join(out, tarball), 'package/package.json'])
            if (manifest.includes('workspace:')) {
                fail(`${tarball} still contains workspace:* references after pack`)
            }
        }
        log(`packed ${readdirSync(out).length} tarball(s), all pins exact`)
    } finally {
        rmSync(out, {recursive: true, force: true})
    }
}

function bump(arg: string, dryRun: boolean) {
    const root = rootManifest()
    const list = members()

    if (sh('git', ['status', '--porcelain']) !== '') fail('working tree is not clean')
    const branch = sh('git', ['rev-parse', '--abbrev-ref', 'HEAD'])
    if (branch !== 'master') fail(`on branch ${branch}, releases start from master`)
    const hasOrigin = trySh('git', ['remote', 'get-url', 'origin']) !== null
    if (hasOrigin) {
        sh('git', ['fetch', 'origin', 'master'])
        if (sh('git', ['rev-parse', 'HEAD']) !== sh('git', ['rev-parse', 'origin/master'])) {
            fail('master is not equal to origin/master')
        }
    } else if (dryRun) {
        log('no origin remote; skipping the origin/master guard for this dry run')
    } else {
        fail('no origin remote configured')
    }
    for (const member of list) {
        if (member.json.version === root.version) continue
        if (semver.gt(member.json.version, root.version)) {
            fail(`${member.name} is ${member.json.version}, ahead of root ${root.version}`)
        }
        log(`${member.name} ${member.json.version} joins the lockstep with this bump`)
    }
    guardInternalRefs(list)

    const target = resolveTarget(root.version, arg)
    guardPrereleaseOnly(target)
    const tag = `v${target}`
    if (trySh('git', ['rev-parse', '--verify', `refs/tags/${tag}`]) !== null)
        fail(`tag ${tag} already exists locally`)
    if (
        hasOrigin &&
        trySh('git', ['ls-remote', '--exit-code', '--tags', 'origin', `refs/tags/${tag}`]) !== null
    ) {
        fail(`tag ${tag} already exists on origin`)
    }
    for (const member of publishable(list)) {
        const published = trySh('npm', ['view', member.name, 'version'])
        if (published && !semver.gt(target, published)) {
            fail(`${member.name} latest on npm is ${published}; target ${target} must be greater`)
        }
    }

    verify({install: true})

    log(`bumping to ${target}`)
    writeVersion(join(ROOT, 'package.json'), target)
    for (const member of list) writeVersion(member.manifestPath, target)
    execFileSync('bun', ['install', '--ignore-scripts'], {cwd: ROOT, stdio: 'inherit'})
    packAndCheckPins(members())

    if (dryRun) {
        sh('git', ['checkout', '--', '.'])
        log(`dry run for ${target} complete; changes reverted`)
        return
    }

    const releaseBranch = `release/${tag}`
    sh('git', ['checkout', '-b', releaseBranch])
    sh('git', ['add', '-A'])
    sh('git', ['commit', '-m', `Version ${target}`])
    sh('git', ['push', '-u', 'origin', releaseBranch])
    sh('gh', [
        'pr',
        'create',
        '--base',
        'master',
        '--title',
        `Version ${target}`,
        '--body',
        `Lockstep release ${target}. Publishes on merge via release.yml.`,
    ])
    log(`release PR opened for ${target}`)
}

function publish() {
    const root = rootManifest()
    const version = root.version
    const tag = `v${version}`
    if (prereleaseBlocked(version)) {
        log(`.prerelease-only is present and ${version} is stable; nothing to publish`)
        return
    }

    if (
        trySh('git', ['rev-parse', '--verify', `refs/tags/${tag}`]) !== null ||
        trySh('git', ['ls-remote', '--exit-code', '--tags', 'origin', `refs/tags/${tag}`]) !== null
    ) {
        log(`tag ${tag} already exists; nothing to publish`)
    } else {
        sh('git', ['tag', '-a', tag, '-m', `Version ${version}`])
        sh('git', ['push', 'origin', tag])
        log(`tagged ${tag}`)
    }

    const list = members()
    const ordered = topological(list)
    for (const member of ordered) runScript(member, 'build')

    const npmTag = distTag(version)
    const out = mkdtempSync(join(tmpdir(), 'wharfkit-publish-'))
    try {
        for (const member of topological(publishable(list))) {
            if (trySh('npm', ['view', `${member.name}@${version}`, 'version']) !== null) {
                log(`${member.name}@${version} already on npm; skipping`)
                continue
            }
            sh('bun', ['pm', 'pack', '--destination', out], {cwd: member.dir})
            const tarball = readdirSync(out).find(
                (f) =>
                    f.endsWith(`-${version}.tgz`) &&
                    f.startsWith(member.name.replace('@', '').replace('/', '-'))
            )
            if (!tarball) fail(`no tarball produced for ${member.name}`)
            log(`publishing ${member.name}@${version} (${npmTag})`)
            execFileSync('npm', ['publish', join(out, tarball), '--provenance', '--tag', npmTag], {
                cwd: ROOT,
                stdio: 'inherit',
            })
        }
    } finally {
        rmSync(out, {recursive: true, force: true})
    }

    const releaseArgs = [
        'release',
        'create',
        tag,
        '--verify-tag',
        '--generate-notes',
        '--title',
        `Version ${version}`,
    ]
    if (semver.prerelease(version)) releaseArgs.push('--prerelease')
    if (trySh('gh', ['release', 'view', tag]) !== null) {
        log(`GitHub release for ${tag} already exists`)
    } else {
        sh('gh', releaseArgs)
        log(`GitHub release created for ${tag}`)
    }
}

function main() {
    const [command, ...rest] = process.argv.slice(2)
    const flags = new Set(rest.filter((a) => a.startsWith('--')))
    const positional = rest.filter((a) => !a.startsWith('--'))
    switch (command) {
        case 'bump': {
            if (!positional[0])
                fail('usage: release.ts bump <version|major|minor|patch|prerelease> [--dry-run]')
            bump(positional[0], flags.has('--dry-run'))
            break
        }
        case 'publish':
            publish()
            break
        case 'verify':
            verify({install: !flags.has('--no-install')})
            break
        default:
            fail('usage: release.ts <bump|publish|verify> [...]')
    }
}

main()
