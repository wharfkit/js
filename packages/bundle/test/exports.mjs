// The bundle ships no types, so its contract is the runtime export shape of the ESM build.
import assert from 'node:assert/strict'

const wharf = await import('../dist/wharf.esm.js')

const flat = [
    ['@wharfkit/session', ['SessionKit', 'Session', 'TransactContext']],
    ['@wharfkit/account', ['Account', 'AccountKit']],
    ['@wharfkit/antelope', ['Asset', 'Name', 'Serializer', 'APIClient']],
    ['@wharfkit/common', ['ChainDefinition', 'Chains']],
    ['@wharfkit/contract', ['Contract', 'ContractKit', 'Table']],
    ['@wharfkit/resources', ['Resources']],
    ['@wharfkit/token', ['Token', 'TokenBalance']],
    ['@wharfkit/transact-plugin-autocorrect', ['TransactPluginAutoCorrect']],
    ['@wharfkit/transact-plugin-resource-provider', ['TransactPluginResourceProvider']],
    ['@wharfkit/wallet-plugin-anchor', ['WalletPluginAnchor']],
    ['@wharfkit/wallet-plugin-cloudwallet', ['WalletPluginCloudWallet']],
    ['@wharfkit/wallet-plugin-imtoken', ['WalletPluginIMToken']],
    ['@wharfkit/wallet-plugin-metamask', ['WalletPluginMetaMask']],
    ['@wharfkit/wallet-plugin-tokenpocket', ['WalletPluginTokenPocket']],
    ['@wharfkit/web-ui', ['WebUI', 'supportedLocales']],
]

const namespaced = [
    ['@wharfkit/atomicassets', 'AtomicAssets', 'AtomicAssetsKit'],
    ['@wharfkit/hyperion', 'Hyperion', 'HyperionAPIClient'],
    ['@wharfkit/roborovski', 'Roborovski', 'RoborovskiClient'],
]

for (const [pkg, names] of flat) {
    for (const name of names) {
        assert.ok(name in wharf, `${pkg}: missing flat export ${name}`)
    }
}

for (const [pkg, ns, member] of namespaced) {
    assert.ok(ns in wharf, `${pkg}: missing namespace ${ns}`)
    assert.ok(member in wharf[ns], `${pkg}: ${ns} is missing ${member}`)
}

console.log(`bundle: ${flat.length + namespaced.length} packages exported, shape ok`)
