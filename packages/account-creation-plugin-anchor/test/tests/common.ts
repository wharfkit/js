import {assert} from 'chai'
import sinon from 'sinon'
import {Chains, SessionKit} from '@wharfkit/session'
import {mockSessionKitArgs, mockSessionKitOptions} from '@wharfkit/mock-data'

import {AccountCreator} from '../../src/account-creator'
import {AccountCreationPluginGreymass} from '$lib'

suite('AccountCreationPluginGreymass', function () {
    let createAccountStub

    setup(function () {
        // Before each test, replace the `createAccount` method with a stub
        createAccountStub = sinon.stub(AccountCreator.prototype, 'createAccount')
    })

    teardown(function () {
        // After each test, restore the original method
        createAccountStub.restore()
    })

    // test('createAccount', async function () {
    //     // Make the stub resolve the desired values
    //     createAccountStub.resolves({
    //         cid: Chains.EOS.id,
    //         sa: 'wharfkit1111',
    //     })

    //     const kit = new SessionKit(mockSessionKitArgs, {
    //         ...mockSessionKitOptions,
    //         accountCreationPlugins: [new AccountCreationPluginGreymass()],
    //     })

    //     const result = await kit.createAccount({
    //         chain: Chains.EOS,
    //         accountName: 'wharfkit1111',
    //     })

    //     assert.equal(result.chain, Chains.EOS)
    //     assert.equal(result.accountName, 'wharfkit1111')
    // })
})
