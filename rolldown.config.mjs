import fs from 'fs'
import path from 'path'
import {fileURLToPath} from 'url'

import {libraryConfig, members, selected} from './rolldown.base.mjs'

const root = path.dirname(fileURLToPath(import.meta.url))
const pkgOf = (name) =>
    JSON.parse(fs.readFileSync(path.join(root, 'packages', name, 'package.json')))

// What each member needs beyond DEFAULTS, declared once. Anything not listed takes the defaults.
const MEMBERS = {
    cli: {
        bannerText: "#!/usr/bin/env node\nprocess.removeAllListeners('warning')",
        esModule: false,
        types: false,
        esm: false,
        externalExtra: ['fs'],
    },
    'mock-data': {
        extraOutputs: [
            {
                file: pkgOf('mock-data').browser['./lib/mock-data.m.js'],
                format: 'esm',
                alias: {
                    './mock/fetch': path.join(root, 'packages/mock-data/src/mock/browser-fetch.ts'),
                    './fetch': path.join(root, 'packages/mock-data/src/mock/browser-fetch.ts'),
                },
            },
        ],
    },
    'protocol-esr': {stripInternal: true, replaceVersion: true},
    'protocol-scatter': {browser: true, bundleDeps: true},
    'wallet-plugin-anchor': {stripInternal: true, replaceVersion: true},
    'wallet-plugin-scatter': {browser: true, bundleDeps: true, dir: true},
    'wallet-plugin-tokenpocket': {browser: true, bundleDeps: true, dir: true},
    webauthn: {
        cjsExternal: Object.keys(pkgOf('webauthn').dependencies).filter((d) => d !== 'cborg'),
    },
}

// the defaults every member gets; the table above carries only what differs
const DEFAULTS = {comments: false}
export default selected(root, members(root)).flatMap((name) =>
    libraryConfig(path.join(root, 'packages', name), {...DEFAULTS, ...MEMBERS[name]})
)
