import {assert} from 'chai'

import {AccountCreator} from '../../src/account-creator'

const serviceUrl = 'https://eos.account.unicove.com/buy?supported_chains=aca376f2'
const serviceOrigin = 'https://eos.account.unicove.com'

function mockPopup() {
    const popup = {
        closed: false,
        close() {
            this.closed = true
        },
    }
    ;(window as any).open = () => popup
    return popup
}

function post(data: any, origin: string) {
    window.dispatchEvent(new (window as any).MessageEvent('message', {data, origin}))
}

suite('AccountCreator', function () {
    test('resolves with the account reported by the service', async function () {
        mockPopup()
        const result = new AccountCreator({url: serviceUrl}).createAccount()
        post({sa: 'wharfkit1111', sp: 'active'}, serviceOrigin)
        assert.deepEqual(await result, {sa: 'wharfkit1111', sp: 'active'})
    })

    test('ignores messages from another origin', async function () {
        mockPopup()
        const result = new AccountCreator({url: serviceUrl}).createAccount()
        post({sa: 'attacker1111', sp: 'active'}, 'https://example.com')
        const settled = await Promise.race([
            result,
            new Promise((resolve) => setTimeout(() => resolve('pending'), 10)),
        ])
        assert.equal(settled, 'pending')
        post({sa: 'wharfkit1111', sp: 'active'}, serviceOrigin)
        assert.equal((await result).sa, 'wharfkit1111')
    })

    test('rejects when the popup is closed first', async function () {
        const popup = mockPopup()
        const result = new AccountCreator({url: serviceUrl}).createAccount()
        popup.closed = true
        let error: Error | undefined
        try {
            await result
        } catch (caught) {
            error = caught as Error
        }
        assert.instanceOf(error, Error)
        assert.equal(error?.message, 'Popup window closed')
    })
})
