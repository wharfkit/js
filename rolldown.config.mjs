import fs from 'fs'
import path from 'path'
import {fileURLToPath} from 'url'

import {libraryConfig, members, selected} from './rolldown.base.mjs'

const root = path.dirname(fileURLToPath(import.meta.url))
const pkgOf = (name) =>
    JSON.parse(fs.readFileSync(path.join(root, 'packages', name, 'package.json')))

// What each member needs beyond DEFAULTS, declared once. Anything not listed takes the defaults.
const MEMBERS = {
    abicache: {banner: false},
    antelope: {banner: '@wharfkit/antelope'},
    atomicassets: {banner: false},
    cli: {
        banner: false,
        bannerText: "#!/usr/bin/env node\nprocess.removeAllListeners('warning')",
        esModule: false,
        types: false,
        esm: false,
        externalExtra: ['fs'],
    },
    hyperion: {banner: false},
    common: {banner: false},
    contract: {banner: false},
    'mock-data': {
        banner: false,
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
        stripInternal: true,
        replaceVersion: true,
    },
    'protocol-scatter': {
        banner: true,
        browser: true,
        bundleDeps: true,
    },

    roborovski: {banner: false},
    session: {banner: false},
    'signing-request': {banner: 'EOSIO Signing Request'},
    'wallet-plugin-anchor': {
        banner: true,
        stripInternal: true,
        replaceVersion: true,
    },
    'wallet-plugin-scatter': {
        banner: true,
        browser: true,
        bundleDeps: true,
        dir: true,
    },
    'wallet-plugin-tokenpocket': {
        banner: true,
        browser: true,
        bundleDeps: true,
        dir: true,
    },
    webauthn: {
        cjsExternal: Object.keys(pkgOf('webauthn').dependencies).filter((d) => d !== 'cborg'),
        banner: true,
    },
}

// the defaults every member gets; the table above carries only what differs
const DEFAULTS = {banner: true, comments: false}
export default selected(root, members(root)).flatMap((name) =>
    libraryConfig(path.join(root, 'packages', name), {...DEFAULTS, ...MEMBERS[name]})
)
