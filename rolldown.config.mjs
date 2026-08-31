import fs from 'fs'
import path from 'path'
import {fileURLToPath} from 'url'

import {libraryConfig, members, selected} from './rolldown.base.mjs'

const root = path.dirname(fileURLToPath(import.meta.url))
const pkgOf = (name) =>
    JSON.parse(fs.readFileSync(path.join(root, 'packages', name, 'package.json')))

// Every member's build, declared once. Anything not listed builds with the defaults.
const MEMBERS = {
    abicache: {},
    antelope: {banner: '@wharfkit/antelope', comments: true},
    atomicassets: {comments: true},
    cli: {
        bannerText: "#!/usr/bin/env node\nprocess.removeAllListeners('warning')",
        esModule: false,
        types: false,
        esm: false,
        externalExtra: ['fs'],
    },
    hyperion: {comments: true},
    common: {},
    contract: {},
    'mock-data': {
        extraOutputs: [
            {
                file: pkgOf('mock-data').browser['./lib/mock-data.m.js'],
                format: 'esm',
                alias: {
                    // both rollup aliases resolved to the same file, relative to their importers
                    './mock/fetch': path.join(root, 'packages/mock-data/src/mock/browser-fetch.ts'),
                    './fetch': path.join(root, 'packages/mock-data/src/mock/browser-fetch.ts'),
                },
            },
        ],
    },
    'protocol-esr': {
        banner: true,
        comments: true,
        stripInternal: true,
        replaceVersion: true,
    },
    'protocol-scatter': {
        banner: true,
        comments: true,
        browser: true,
        bundleDeps: true,
    },
    resources: {banner: true, comments: true},
    roborovski: {comments: true},
    session: {},
    'signing-request': {banner: 'EOSIO Signing Request', comments: true},
    'wallet-plugin-anchor': {
        banner: true,
        comments: true,
        stripInternal: true,
        replaceVersion: true,
    },
    'wallet-plugin-scatter': {
        banner: true,
        comments: true,
        browser: true,
        bundleDeps: true,
        dir: true,
    },
    'wallet-plugin-tokenpocket': {
        banner: true,
        comments: true,
        browser: true,
        bundleDeps: true,
        dir: true,
    },
    webauthn: {
        cjsExternal: Object.keys(pkgOf('webauthn').dependencies).filter((d) => d !== 'cborg'),
        banner: true,
        comments: true,
    },
}

const DEFAULTS = {banner: true, comments: true}
export default selected(root, members(root)).flatMap((name) =>
    libraryConfig(path.join(root, 'packages', name), MEMBERS[name] ?? DEFAULTS)
)
