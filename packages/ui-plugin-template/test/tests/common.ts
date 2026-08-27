import {assert} from 'chai'
import {PermissionLevel, SessionKit} from '@wharfkit/session'
import {
    mockChainDefinition,
    mockPermissionLevel,
    mockSessionKitArgs,
    mockSessionKitOptions,
} from '@wharfkit/mock-data'

import {UserInterfaceTEMPLATE} from '$lib'

suite('user interface', function () {
    test('login and sign', async function () {
        const kit = new SessionKit(
            {
                ...mockSessionKitArgs,
                ui: new UserInterfaceTEMPLATE(),
            },
            mockSessionKitOptions
        )
        const {session} = await kit.login({
            chain: mockChainDefinition.id,
            permissionLevel: mockPermissionLevel,
        })
        assert.isTrue(session.chain.equals(mockChainDefinition))
        assert.isTrue(session.actor.equals(PermissionLevel.from(mockPermissionLevel).actor))
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
                        memo: 'wharfkit/session ui plugin template',
                    },
                },
            },
            {broadcast: false}
        )
        assert.equal(result.signatures.length, 1)
    })
})
