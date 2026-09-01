import {assert} from 'chai'
import zlib from 'pako'
import {AbstractWalletPlugin, SigningRequest} from '@wharfkit/session'
import {mockChainId} from '@wharfkit/mock-data'

import {copyToClipboard, DEFAULT_BUOY_URL, tackleboxDeepLink, WalletPluginTackleBox} from '$lib'

suite('plugin surface', function () {
    test('is a wallet plugin with the expected id', function () {
        const plugin = new WalletPluginTackleBox()
        assert.instanceOf(plugin, AbstractWalletPlugin as any)
        assert.equal(plugin.id, 'tacklebox')
    })

    test('lets the wallet pick the chain and permission', function () {
        const plugin = new WalletPluginTackleBox()
        assert.isFalse(plugin.config.requiresChainSelect)
        assert.isFalse(plugin.config.requiresPermissionSelect)
        assert.isUndefined(plugin.config.supportedChains)
    })

    test('carries TackleBox metadata', function () {
        const {metadata} = new WalletPluginTackleBox()
        assert.equal(metadata.name, 'TackleBox')
        assert.equal(metadata.homepage, 'https://github.com/on-a-t-break/tacklebox')
        assert.equal(metadata.download, 'https://github.com/on-a-t-break/tacklebox/releases')
        assert.exists(metadata.logo)
        assert.isTrue(String(metadata.logo!.getVariant('light')).startsWith('data:image/svg+xml'))
        assert.isTrue(String(metadata.logo!.getVariant('dark')).startsWith('data:image/svg+xml'))
    })

    test('defaults to the shared buoy service', function () {
        const plugin = new WalletPluginTackleBox()
        assert.equal(plugin.buoyUrl, DEFAULT_BUOY_URL)
        assert.equal(DEFAULT_BUOY_URL, 'https://cb.anchor.link')
    })

    test('accepts a custom buoy service', function () {
        const plugin = new WalletPluginTackleBox({buoyUrl: 'https://buoy.example.com'})
        assert.equal(plugin.buoyUrl, 'https://buoy.example.com')
    })

    test('ships english translations', function () {
        const plugin = new WalletPluginTackleBox()
        assert.exists(plugin.translations)
        assert.equal(plugin.translations!.en.login.title, 'Connect with TackleBox')
        assert.exists(plugin.translations!.en.error.cancelled)
    })

    test('clipboard helper degrades gracefully outside a browser', async function () {
        assert.isFalse(await copyToClipboard('esr://test'))
    })

    test('deep links carry the request payload on the tacklebox scheme', function () {
        const request = SigningRequest.identity(
            {
                callback: {url: 'https://cb.anchor.link/unittest', background: true},
                scope: 'unittest',
                chainId: mockChainId,
            },
            {zlib}
        )
        const link = tackleboxDeepLink(request)
        assert.isTrue(link.startsWith('tacklebox://request/'))

        const payload = link.slice('tacklebox://request/'.length)
        const roundTrip = SigningRequest.from(`esr://${payload}`, {zlib})
        assert.isTrue(roundTrip.isIdentity())
        assert.equal(String(roundTrip.getIdentityScope()), 'unittest')
    })

    test('auto-launch can be disabled by option', function () {
        assert.isTrue(new WalletPluginTackleBox().autoLaunch)
        assert.isFalse(new WalletPluginTackleBox({disableAutoLaunch: true}).autoLaunch)
    })
})
