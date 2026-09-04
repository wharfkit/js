import {assert} from 'chai'

import * as protocolScatter from '$lib'

const mockContext = {
    appName: 'unittests',
    chain: {
        id: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
        name: 'eos',
        url: 'https://eos.greymass.com',
    },
}

suite('browser-only contract', function () {
    test('importing the package outside a browser succeeds', function () {
        assert.isFunction(protocolScatter.getScatter)
        assert.isFunction(protocolScatter.handleLogin)
        assert.isFunction(protocolScatter.handleLogout)
        assert.isFunction(protocolScatter.handleSignatureRequest)
    })

    test('getScatter outside a browser throws an error the package chooses', async function () {
        assert.isUndefined((globalThis as any).window)
        try {
            await protocolScatter.getScatter(mockContext)
            assert.fail('getScatter resolved outside a browser')
        } catch (error) {
            assert.instanceOf(error, Error)
            assert.match(String((error as Error).message), /requires a browser environment/)
        }
    })
})
