import fs from 'fs'
import path from 'path'
import {fileURLToPath} from 'url'

import {browserTestConfig} from './browser-test.rolldown.mjs'
import {members, selected} from './rolldown.base.mjs'

const root = path.dirname(fileURLToPath(import.meta.url))

// Every member's browser test bundle, declared once. Anything not listed builds with the defaults.
const MEMBERS = {
    'account-creation-plugin-anchor': {browserProvider: true},
    'account-creation-plugin-jungle4': {browserProvider: true},
    antelope: {
        testsDir: '.',
        output: 'test/browser.html',
        sourcemap: 'inline',
        browserProvider: true,
    },
    atomicassets: {testsDir: '.'},
    common: {lib: false},
    contract: {dataDir: 'data/requests'},
    hyperion: {testsDir: '.'},
    msigs: {testsDir: '.'},
    'protocol-esr': {browserFetch: true},
    'protocol-scatter': {browserFetch: true},
    roborovski: {testsDir: '.'},
    'sealed-messages': {browserProvider: true},
    'transact-plugin-autocorrect': {browserFetch: true},
    'transact-plugin-cosigner': {browserFetch: true},
    'transact-plugin-explorerlink': {browserFetch: true},
    'transact-plugin-finality-callback': {browserFetch: true},
    'transact-plugin-mock': {browserFetch: true},
    'transact-plugin-resource-provider': {browserFetch: true},
    'wallet-plugin-anchor': {
        libSource: true,
        browserFetch: true,
        resolveOptions: {extensions: ['.mjs', '.js', '.json', '.node', '.ts']},
    },
    'wallet-plugin-cleos': {browserFetch: true},
    'wallet-plugin-cloudwallet': {browserFetch: true},
    'wallet-plugin-metamask': {browserProvider: true},
    'wallet-plugin-mock': {browserFetch: true},
    'wallet-plugin-privatekey': {browserFetch: true},
    'wallet-plugin-scatter': {browserFetch: true},
    'wallet-plugin-tokenpocket': {browserFetch: true},
    webauthn: {testsDir: '.'},
}

export default selected(root, members(root, {browser: true})).flatMap((name) =>
    browserTestConfig(path.join(root, 'packages', name), MEMBERS[name] ?? {})
)
