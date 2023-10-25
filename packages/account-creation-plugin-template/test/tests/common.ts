import {assert} from 'chai'
import {Chains, PermissionLevel, SessionKit} from '@wharfkit/session'
import {
    mockChainDefinition,
    mockPermissionLevel,
    mockSessionKitArgs,
    mockSessionKitOptions,
} from '@wharfkit/mock-data'

import {AccountCreationPluginTEMPLATE} from '$lib'

suite('wallet plugin', function () {
    test('login and sign', async function () {
        const kit = new SessionKit(
            {
                ...mockSessionKitArgs,
                accountCreationPlugins: [new AccountCreationPluginTEMPLATE()],
            },
            mockSessionKitOptions
        )
        const result = await kit.create({
            chain: mockChainDefinition.id,
            permissionLevel: mockPermissionLevel,
        })
        assert.equal(result.chain, Chains.EOS)
        assert.equal(result.accountName, 'wharfkit1111')
    })
})
