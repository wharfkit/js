import {assert} from 'chai'
import sinon from 'sinon'
import zlib from 'pako'
import * as buoy from '@greymass/buoy'
import {
    ChainDefinition,
    LoginContext,
    PermissionLevel,
    PromptElement,
    SigningRequest,
} from '@wharfkit/session'
import {mockChainDefinition, mockChainId, mockFetch, mockPermissionLevel} from '@wharfkit/mock-data'

import {WalletPluginTackleBox} from '$lib'
import {makeMockUI} from '$test/utils/mock-ui'
import {makeLoginCallbackPayload, mockChannelUrl, mockPublicKey} from '$test/utils/mock-esr'

const chain = ChainDefinition.from(mockChainDefinition)

function makeLoginContext(ui: any): LoginContext {
    return {
        chain,
        chains: [chain],
        ui,
        fetch: mockFetch,
        hooks: {},
        appName: 'unittest',
        permissionLevel: PermissionLevel.from(mockPermissionLevel),
        walletPlugins: [],
        arbitrary: {},
        uiRequirements: {},
        addHook: () => undefined,
        getClient: () => undefined,
        esrOptions: {zlib},
    } as unknown as LoginContext
}

function stubBrowserWindow(): {location: {href: string}} {
    const fakeWindow = {location: {href: 'http://localhost/unittest'}}
    ;(global as any).window = fakeWindow
    ;(global as any).navigator = {userAgent: 'mocha-unittest'}
    return fakeWindow
}

function unstubBrowserWindow() {
    delete (global as any).window
    delete (global as any).navigator
}

suite('login', function () {
    teardown(function () {
        unstubBrowserWindow()
        sinon.restore()
    })

    test('completes a login answered over the buoy channel', async function () {
        sinon.stub(buoy, 'receive').resolves(JSON.stringify(makeLoginCallbackPayload()))

        const plugin = new WalletPluginTackleBox()
        const ui = makeMockUI()
        const response = await plugin.login(makeLoginContext(ui))

        assert.equal(String(response.chain), mockChainId)
        assert.equal(String(response.permissionLevel), mockPermissionLevel)
        assert.exists(response.identityProof)
    })

    test('stores the wallet push channel for later signing', async function () {
        sinon.stub(buoy, 'receive').resolves(JSON.stringify(makeLoginCallbackPayload()))

        const plugin = new WalletPluginTackleBox()
        await plugin.login(makeLoginContext(makeMockUI()))

        assert.equal(plugin.data.channelUrl, mockChannelUrl)
        assert.equal(plugin.data.channelName, 'TackleBox')
        assert.equal(String(plugin.data.signerKey), mockPublicKey)
        assert.exists(plugin.data.privateKey)
        assert.exists(plugin.data.requestKey)
    })

    test('session data survives a JSON round trip for restores', async function () {
        sinon.stub(buoy, 'receive').resolves(JSON.stringify(makeLoginCallbackPayload()))

        const plugin = new WalletPluginTackleBox()
        await plugin.login(makeLoginContext(makeMockUI()))

        const restored = JSON.parse(JSON.stringify(plugin.data))
        assert.equal(restored.channelUrl, mockChannelUrl)
        assert.equal(restored.channelName, 'TackleBox')
        assert.equal(String(restored.signerKey), mockPublicKey)
        assert.isString(restored.privateKey)
    })

    test('still logs in when the wallet announces no channel', async function () {
        sinon
            .stub(buoy, 'receive')
            .resolves(JSON.stringify(makeLoginCallbackPayload({channel: false})))

        const plugin = new WalletPluginTackleBox()
        const response = await plugin.login(makeLoginContext(makeMockUI()))

        assert.equal(String(response.chain), mockChainId)
        assert.isUndefined(plugin.data.channelUrl)
    })

    test('prompts with a QR code, a launch link and a copy fallback', async function () {
        sinon.stub(buoy, 'receive').resolves(JSON.stringify(makeLoginCallbackPayload()))

        const plugin = new WalletPluginTackleBox()
        const ui = makeMockUI()
        await plugin.login(makeLoginContext(ui))

        const args = ui.prompts[0]
        assert.exists(args)
        assert.equal(args.title, 'Connect with TackleBox')
        const elements = args.elements as PromptElement[]
        assert.deepEqual(
            elements.map((e) => e.type),
            ['qr', 'link', 'button']
        )

        // The launch link targets the wallet's own scheme.
        const link: any = elements.find((e) => e.type === 'link')
        assert.isTrue(String(link.data.href).startsWith('tacklebox://request/'))

        // The rendered request is a valid ESR identity request.
        const qr: any = elements.find((e) => e.type === 'qr')
        assert.isTrue(String(qr.data).startsWith('esr://'))
        const request = SigningRequest.from(String(qr.data), {zlib})
        assert.isTrue(request.isIdentity())
    })

    test('opens TackleBox directly when a window exists', async function () {
        sinon.stub(buoy, 'receive').resolves(JSON.stringify(makeLoginCallbackPayload()))
        const fakeWindow = stubBrowserWindow()

        const plugin = new WalletPluginTackleBox()
        await plugin.login(makeLoginContext(makeMockUI()))

        assert.isTrue(fakeWindow.location.href.startsWith('tacklebox://request/'))
        // The deep link payload decodes back into the identity request.
        const payload = fakeWindow.location.href.slice('tacklebox://request/'.length)
        const request = SigningRequest.from(`esr://${payload}`, {zlib})
        assert.isTrue(request.isIdentity())
    })

    test('honors the disableAutoLaunch option', async function () {
        sinon.stub(buoy, 'receive').resolves(JSON.stringify(makeLoginCallbackPayload()))
        const fakeWindow = stubBrowserWindow()

        const plugin = new WalletPluginTackleBox({disableAutoLaunch: true})
        const ui = makeMockUI()
        await plugin.login(makeLoginContext(ui))

        assert.equal(fakeWindow.location.href, 'http://localhost/unittest')
        // The launch link stays available in the prompt.
        const elements = ui.prompts[0].elements as PromptElement[]
        assert.isTrue(elements.some((e) => e.type === 'link'))
    })

    test('listens for the callback on the configured buoy service', async function () {
        const receiveStub = sinon
            .stub(buoy, 'receive')
            .resolves(JSON.stringify(makeLoginCallbackPayload()))

        const plugin = new WalletPluginTackleBox({buoyUrl: 'https://buoy.example.com'})
        await plugin.login(makeLoginContext(makeMockUI()))

        const receiveOptions: any = receiveStub.firstCall.args[0]
        assert.equal(receiveOptions.service, 'https://buoy.example.com')
        assert.isString(receiveOptions.channel)
    })

    test('rejects when the wallet declines the request', async function () {
        sinon.stub(buoy, 'receive').resolves(JSON.stringify({}))

        const plugin = new WalletPluginTackleBox()
        let error: Error | undefined
        try {
            await plugin.login(makeLoginContext(makeMockUI()))
        } catch (err) {
            error = err as Error
        }
        assert.exists(error)
        assert.match(String(error!.message), /cancelled|declined/i)
    })

    test('requires a UI', async function () {
        const plugin = new WalletPluginTackleBox()
        const context = {...makeLoginContext(makeMockUI()), ui: undefined} as any
        let error: Error | undefined
        try {
            await plugin.login(context)
        } catch (err) {
            error = err as Error
        }
        assert.exists(error)
        assert.match(String(error!.message), /requires a UI/)
    })
})
