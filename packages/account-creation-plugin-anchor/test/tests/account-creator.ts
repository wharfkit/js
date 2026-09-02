import {assert} from 'chai'

import {AccountCreator} from '../../src/account-creator'

const serviceUrl = 'https://create.anchor.link/nested'
const serviceOrigin = 'https://create.anchor.link'

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

function creator() {
    return new AccountCreator({scope: 'wallet', creationServiceUrl: serviceUrl})
}

suite('AccountCreator', function () {
    test('resolves with the account reported by the service', async function () {
        mockPopup()
        const result = creator().createAccount()
        post({sa: 'wharfkit1111', cid: 'aca376f2'}, serviceOrigin)
        assert.equal((await result).sa, 'wharfkit1111')
    })

    test('ignores messages from another origin', async function () {
        mockPopup()
        const result = creator().createAccount()
        post({sa: 'attacker1111'}, 'https://example.com')
        const settled = await Promise.race([
            result,
            new Promise((resolve) => setTimeout(() => resolve('pending'), 10)),
        ])
        assert.equal(settled, 'pending')
        post({sa: 'wharfkit1111'}, serviceOrigin)
        assert.equal((await result).sa, 'wharfkit1111')
    })

    test('rejects when the popup is closed first', async function () {
        const popup = mockPopup()
        const result = creator().createAccount()
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
