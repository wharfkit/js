import {execFileSync} from 'node:child_process'
import {existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname

function sh(cmd: string, args: string[], opts: {cwd?: string} = {}): string {
    return execFileSync(cmd, args, {
        cwd: opts.cwd ?? ROOT,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'inherit'],
    }).trim()
}

function run(cmd: string, args: string[], opts: {cwd?: string} = {}) {
    execFileSync(cmd, args, {cwd: opts.cwd ?? ROOT, stdio: 'inherit'})
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
    console.error(`import-package: ${message}`)
    process.exit(1)
}

function log(message: string) {
    console.log(`import-package: ${message}`)
}

function parseArgs() {
    const args = process.argv.slice(2)
    const phantoms: string[] = []
    let source: string | undefined
    let branch: string | undefined
    let sha: string | undefined
    for (let i = 0; i < args.length; i++) {
        const arg = args[i]
        if (arg === '--phantom') phantoms.push(args[++i])
        else if (arg === '--branch') branch = args[++i]
        else if (arg === '--sha') sha = args[++i]
        else if (!source) source = arg
        else fail(`unexpected argument ${arg}`)
    }
    if (!source) {
        fail('usage: import-package.ts <source-repo-url-or-path> [--branch <branch>] [--sha <sha>] [--phantom <@wharfkit/pkg>]...')
    }
    return {source, branch, sha, phantoms}
}

function main() {
    const {source, branch, sha, phantoms} = parseArgs()

    if (trySh('git', ['filter-repo', '--version']) === null) {
        fail('git-filter-repo is not installed (brew install git-filter-repo)')
    }
    if (sh('git', ['status', '--porcelain']) !== '') fail('working tree is not clean')

    const tmp = mkdtempSync(join(tmpdir(), 'wharfkit-import-'))
    try {
        log(`cloning ${source}`)
        const cloneArgs = ['clone', '--no-local']
        if (branch) cloneArgs.push('--branch', branch)
        run('git', [...cloneArgs, source, tmp])
        if (sha) run('git', ['checkout', sha], {cwd: tmp})
        const importedSha = sh('git', ['rev-parse', 'HEAD'], {cwd: tmp})
        const importedBranch = branch ?? sh('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {cwd: tmp})

        const manifestPath = join(tmp, 'package.json')
        if (!existsSync(manifestPath)) fail('source repo has no package.json at its root')
        const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
        const name: string = manifest.name
        if (!name?.startsWith('@wharfkit/')) fail(`source package is ${name}, expected an @wharfkit/* package`)
        const unscoped = name.slice('@wharfkit/'.length)
        const targetDir = join(ROOT, 'packages', unscoped)
        if (existsSync(targetDir)) fail(`packages/${unscoped} already exists`)

        log('preflight closure check')
        run('bun', [join(ROOT, 'scripts', 'check-closure.ts'), '--candidate', tmp])

        log(`rewriting history under packages/${unscoped}`)
        run('git', ['filter-repo', '--to-subdirectory-filter', `packages/${unscoped}`, '--force'], {cwd: tmp})

        const importBranch = `import/${unscoped}`
        run('git', ['checkout', '-b', importBranch, 'master'])
        run('git', ['fetch', tmp, importedBranch])
        run('git', ['merge', '--allow-unrelated-histories', '-m', `Import ${name}`, 'FETCH_HEAD'])

        log('applying the on-import edit list')
        const importedManifestPath = join(targetDir, 'package.json')
        const imported = JSON.parse(readFileSync(importedManifestPath, 'utf8'))
        for (const type of ['dependencies', 'devDependencies']) {
            for (const dep of Object.keys(imported[type] ?? {})) {
                if (dep.startsWith('@wharfkit/')) imported[type][dep] = 'workspace:*'
            }
        }
        for (const [dep, range] of Object.entries(imported.peerDependencies ?? {})) {
            if (dep.startsWith('@wharfkit/')) {
                imported.dependencies = imported.dependencies ?? {}
                imported.dependencies[dep] = 'workspace:*'
                delete imported.peerDependencies[dep]
            }
        }
        if (imported.peerDependencies && Object.keys(imported.peerDependencies).length === 0) {
            delete imported.peerDependencies
        }
        for (const phantom of phantoms) {
            imported.devDependencies = imported.devDependencies ?? {}
            imported.devDependencies[phantom] = phantom.startsWith('@wharfkit/') ? 'workspace:*' : fail(`phantom ${phantom} is not @wharfkit/*; declare it by hand`)
        }
        delete imported.resolutions
        if (imported.scripts?.prepare) delete imported.scripts.prepare
        writeFileSync(importedManifestPath, JSON.stringify(imported, null, 4) + '\n')
        for (const path of ['yarn.lock', '.github']) {
            rmSync(join(targetDir, path), {recursive: true, force: true})
        }

        log('bun install --ignore-scripts')
        run('bun', ['install', '--ignore-scripts'])
        run('git', ['add', '-A'])
        run('git', ['commit', '-m', `Apply on-import edits for ${name}`])

        log('verification gate')
        run('bun', [join(ROOT, 'scripts', 'check-closure.ts')])
        run('bun', [join(ROOT, 'scripts', 'release.ts'), 'verify', '--no-install'])
        const instances = sh('bun', ['pm', 'ls', '--all']).split('\n').filter((line) => line.includes('@wharfkit/antelope@'))
        const versions = new Set(instances.map((line) => line.trim()))
        if (versions.size > 1) fail(`multiple @wharfkit/antelope instances resolved:\n${[...versions].join('\n')}`)
        const packDir = mkdtempSync(join(tmpdir(), 'wharfkit-import-pack-'))
        try {
            sh('bun', ['pm', 'pack', '--destination', packDir], {cwd: targetDir})
            for (const tarball of readdirSync(packDir)) {
                const packed = sh('tar', ['-xzOf', join(packDir, tarball), 'package/package.json'])
                if (packed.includes('workspace:')) fail(`${tarball} still contains workspace:* after pack`)
            }
        } finally {
            rmSync(packDir, {recursive: true, force: true})
        }

        log(`branch ${importBranch} is ready; open the PR with this body:`)
        console.log(`
## Import ${name}

- Source: ${source}
- Branch: ${importedBranch}
- SHA: ${importedSha}

### On-import edits
- [x] Internal @wharfkit/* ranges set to workspace:*
- [x] @wharfkit/* peer dependencies converted to normal dependencies
- [x] yarn.lock, .github/, resolutions, prepare script removed
- [x] Phantom dependencies declared: ${phantoms.length > 0 ? phantoms.join(', ') : 'none'}

### Verification
- [x] bun install --ignore-scripts (isolated linker), lockfile committed
- [x] check-closure passes
- [x] every member builds in dependency order
- [x] every member's tests pass under node
- [x] exactly one @wharfkit/antelope resolved
- [x] packed tarball carries no workspace:* references

Merge with a merge commit, never squash or rebase.
`)
    } finally {
        rmSync(tmp, {recursive: true, force: true})
    }
}

main()
