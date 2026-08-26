import {mockFetch} from '$test/utils/mock-fetch'
import {TransactPluginExplorerLink} from '../../src/index'

import {Session, SessionArgs, SessionOptions} from '@wharfkit/session'
import {WalletPluginPrivateKey} from '@wharfkit/wallet-plugin-privatekey'

const wallet = new WalletPluginPrivateKey('5Jtoxgny5tT7NiNFp1MLogviuPJ9NniWjnU4wKzaX4t7pL4kJ8s')

const mockSessionArgs: SessionArgs = {
    chain: {
        id: '73e4385a2708e6d7048834fbc1079f2fabb17b3c125b146af438971e90716c4d',
        url: 'https://jungle4.greymass.com',
    },
    permissionLevel: 'wharfkit1111@test',
    walletPlugin: wallet,
}

const mockSessionOptions: SessionOptions = {
    fetch: mockFetch,
    transactPlugins: [new TransactPluginExplorerLink()],
}

suite('example', function () {
    test('plugin usage', async function () {
        const session = new Session(mockSessionArgs, mockSessionOptions)
        const action = {
            authorization: [
                {
                    actor: 'wharfkit1111',
                    permission: 'test',
                },
            ],
            account: 'eosio.token',
            name: 'transfer',
            data: {
                from: 'wharfkit1111',
                to: 'wharfkittest',
                quantity: '0.0001 EOS',
                memo: 'wharfkit plugin - resource provider test (maxFee: 0.0001)',
            },
        }
        const result = await session.transact(
            {
                action,
            },
            {broadcast: true}
        )
        if (result.response) {
            console.log(result.response.transaction_id)
        }
    })
})
