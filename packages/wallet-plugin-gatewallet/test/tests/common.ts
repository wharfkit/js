import {assert} from 'chai'
import {PermissionLevel, SessionKit} from '@wharfkit/session'
import {
    mockChainDefinition,
    mockPermissionLevel,
    mockSessionKitArgs,
    mockSessionKitOptions,
} from '@wharfkit/mock-data'

import {WalletPluginGateWallet} from '$lib'

suite('wallet plugin', function () {
    // browser-only: the scatter protocol import needs `window`
    test.skip('login and sign', async function () {
        const kit = new SessionKit(
            {
                ...mockSessionKitArgs,
                walletPlugins: [new WalletPluginGateWallet()],
            },
            mockSessionKitOptions
        )
        const {session} = await kit.login({
            chain: mockChainDefinition.id,
            permissionLevel: mockPermissionLevel,
        })
        assert.isTrue(session.chain.equals(mockChainDefinition))
        assert.isTrue(session.actor.equals(PermissionLevel.from(mockPermissionLevel).actor))
        assert.isTrue(
            session.permission.equals(PermissionLevel.from(mockPermissionLevel).permission)
        )
        const result = await session.transact(
            {
                action: {
                    authorization: [PermissionLevel.from(mockPermissionLevel)],
                    account: 'eosio.token',
                    name: 'transfer',
                    data: {
                        from: PermissionLevel.from(mockPermissionLevel).actor,
                        to: 'wharfkittest',
                        quantity: '0.0001 EOS',
                        memo: 'wharfkit/session wallet plugin template',
                    },
                },
            },
            {
                broadcast: false,
            }
        )
        assert.isTrue(result.signer.equals(mockPermissionLevel))
        assert.equal(result.signatures.length, 1)
    })
})
