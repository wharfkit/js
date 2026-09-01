import fs from 'fs'
import path from 'path'
import {assert} from 'chai'
import sinon from 'sinon'
import * as buoy from '@greymass/buoy'
import {PermissionLevel, SessionKit} from '@wharfkit/session'
import {
    mockChainId,
    mockPermissionLevel,
    mockSessionKitArgs,
    mockSessionKitOptions,
    MockStorage,
} from '@wharfkit/mock-data'

import {WalletPluginTackleBox} from '$lib'
import {makeMockUI, RecordingUserInterface} from '$test/utils/mock-ui'
import {
    makeLoginCallbackPayload,
    makeTransactCallbackPayload,
    mockChannelId,
} from '$test/utils/mock-esr'

const transferAction = {
    authorization: [PermissionLevel.from(mockPermissionLevel)],
    account: 'eosio.token',
    name: 'transfer',
    data: {
        from: 'wharfkit1111',
        to: 'wharfkittest',
        quantity: '0.0001 EOS',
        memo: 'wallet-plugin-tacklebox test',
    },
}

/** The chain head time captured in the recorded get_info fixture. */
function fixtureHeadTime(): number {
    const dir = path.join(__dirname, '..', 'data')
    for (const file of fs.readdirSync(dir)) {
        const recorded = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'))
        const head = recorded.json && recorded.json.head_block_time
        if (head) {
            return new Date(head + 'Z').getTime()
        }
    }
    throw new Error('No recorded get_info fixture found in test/data')
}

function makeKit(plugin: WalletPluginTackleBox, ui: RecordingUserInterface) {
    return new SessionKit(
        {
            ...mockSessionKitArgs,
            ui,
            walletPlugins: [plugin],
        },
        {
            ...mockSessionKitOptions,
            storage: new MockStorage(),
        }
    )
}

suite('sign', function () {
    this.timeout(120 * 1000)
    this.slow(5 * 1000)

    let clock: sinon.SinonFakeTimers | undefined

    setup(function () {
        // TAPOS in these tests comes from the recorded chain head; pin "now"
        // right after it so request expirations stay in the future no matter
        // when the suite actually runs. Timers stay real.
        clock = sinon.useFakeTimers({now: fixtureHeadTime() + 1000, toFake: ['Date']})
    })

    teardown(function () {
        clock?.restore()
        sinon.restore()
    })

    test('pushes the sealed request over the wallet channel and returns its signature', async function () {
        const receiveStub = sinon.stub(buoy, 'receive')
        const sendStub = sinon.stub(buoy, 'send')
        receiveStub.onFirstCall().resolves(JSON.stringify(makeLoginCallbackPayload()))
        receiveStub
            .onSecondCall()
            .callsFake(async () =>
                JSON.stringify(await makeTransactCallbackPayload(transferAction))
            )

        const plugin = new WalletPluginTackleBox()
        const ui = makeMockUI()
        const kit = makeKit(plugin, ui)

        const {session} = await kit.login({
            chain: mockChainId,
            permissionLevel: mockPermissionLevel,
        })
        assert.equal(String(session.actor), 'wharfkit1111')
        assert.equal(String(session.permission), 'test')

        const result = await session.transact({action: transferAction}, {broadcast: false})

        assert.equal(result.signatures.length, 1)
        assert.exists(result.resolved)
        assert.equal(String(result.signer), mockPermissionLevel)

        // The request went out sealed, addressed to the wallet's channel.
        assert.isTrue(sendStub.calledOnce)
        const [message, destination] = sendStub.firstCall.args as any[]
        assert.instanceOf(message, Uint8Array)
        assert.isAbove(message.length, 0)
        assert.equal(destination.service, 'https://cb.anchor.link')
        assert.equal(destination.channel, mockChannelId)
    })

    test('shows the channel prompt with a countdown and a manual fallback', async function () {
        const receiveStub = sinon.stub(buoy, 'receive')
        sinon.stub(buoy, 'send')
        receiveStub.onFirstCall().resolves(JSON.stringify(makeLoginCallbackPayload()))
        receiveStub
            .onSecondCall()
            .callsFake(async () =>
                JSON.stringify(await makeTransactCallbackPayload(transferAction))
            )

        const plugin = new WalletPluginTackleBox()
        const ui = makeMockUI()
        const kit = makeKit(plugin, ui)
        const {session} = await kit.login({
            chain: mockChainId,
            permissionLevel: mockPermissionLevel,
        })
        await session.transact({action: transferAction}, {broadcast: false})

        const prompt = ui.prompts[ui.prompts.length - 1]
        assert.equal(prompt.title, 'Sign with TackleBox')
        assert.match(String(prompt.body), /TackleBox/)
        assert.deepEqual(
            (prompt.elements as any[]).map((e) => e.type),
            ['countdown', 'button']
        )
    })

    test('falls back to the paste flow when no channel was announced', async function () {
        const receiveStub = sinon.stub(buoy, 'receive')
        const sendStub = sinon.stub(buoy, 'send')
        receiveStub
            .onFirstCall()
            .resolves(JSON.stringify(makeLoginCallbackPayload({channel: false})))
        receiveStub
            .onSecondCall()
            .callsFake(async () =>
                JSON.stringify(await makeTransactCallbackPayload(transferAction))
            )

        const plugin = new WalletPluginTackleBox()
        const ui = makeMockUI()
        const kit = makeKit(plugin, ui)
        const {session} = await kit.login({
            chain: mockChainId,
            permissionLevel: mockPermissionLevel,
        })
        const result = await session.transact({action: transferAction}, {broadcast: false})

        assert.equal(result.signatures.length, 1)
        assert.isTrue(sendStub.notCalled, 'nothing is pushed without a channel')

        const prompt = ui.prompts[ui.prompts.length - 1]
        const types = (prompt.elements as any[]).map((e) => e.type)
        assert.deepEqual(types, ['qr', 'button', 'countdown'])
        const qr: any = (prompt.elements as any[]).find((e) => e.type === 'qr')
        assert.isTrue(String(qr.data).startsWith('esr://'))
    })
})
