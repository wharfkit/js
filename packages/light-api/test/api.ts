import {assert} from 'chai'

import {
    APIClient,
    Checksum256,
    FetchProvider,
    Int64,
    Name,
    PublicKey,
    UInt64,
} from '@wharfkit/antelope'
import {mockFetch} from '@wharfkit/mock-data'

import {LightAPIClient, Types} from '$lib'

const client = new APIClient({
    provider: new FetchProvider('https://eos.light-api.net', {fetch: mockFetch}),
})

const lightapi = new LightAPIClient(client)

suite('Light API', function () {
    this.slow(200)
    this.timeout(10 * 10000)

    test('get_networks', async function () {
        const response = await lightapi.get_networks()

        assert.isArray(response)
        assert.equal(response.length, 5)
        assert.equal(response[0].network, 'eos')
        assert.equal(response[0].systoken, 'EOS')
        assert.equal(
            response[0].chainid,
            'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906'
        )
    })

    test('get_account', async function () {
        const response = await lightapi.get_account('eos', 'teamgreymass')

        assert.instanceOf(response, Types.AccountResponse)
        assert.instanceOf(response.account_name, Name)
        assert.equal(String(response.account_name), 'teamgreymass')
        assert.instanceOf(response.chain.chainid, Checksum256)
        assert.instanceOf(response.permissions[0].perm, Name)
        assert.instanceOf(response.permissions[0].auth.keys[0].public_key, PublicKey)
        assert.instanceOf(response.resources.ram_bytes, UInt64)
        assert.equal(response.balances.length, 45)
        assert.equal(response.rex.fund, '0.0000 EOS')
    })

    test('get_accinfo', async function () {
        const response = await lightapi.get_accinfo('eos', 'teamgreymass')

        assert.instanceOf(response, Types.AccountInfoResponse)
        assert.instanceOf(response.account_name, Name)
        assert.equal(String(response.account_name), 'teamgreymass')
        assert.instanceOf(response.permissions[0].auth.keys[0].public_key, PublicKey)
        assert.instanceOf(response.delegated_from[0].net_weight, Int64)
        assert.equal(response.linkauth.length, 12)
        assert.equal(String(response.permissions[0].perm), 'active')
    })

    test('get_balances', async function () {
        const response = await lightapi.get_balances('eos', 'teamgreymass')

        assert.instanceOf(response, Types.BalancesResponse)
        assert.instanceOf(response.account_name, Name)
        assert.equal(response.balances.length, 45)
        assert.equal(response.balances[14].contract, 'eosio.token')
        assert.equal(response.balances[14].amount, '5292.4309')
        assert.equal(response.balances[14].decimals, '4')
    })

    test('get_rexbalance', async function () {
        const response = await lightapi.get_rexbalance('eos', 'teamgreymass')

        assert.instanceOf(response, Types.RexBalanceResponse)
        assert.instanceOf(response.account_name, Name)
        assert.equal(response.rex.fund, '0.0000 EOS')
        assert.equal(response.rex.maturing, '0.0000 EOS')
        assert.instanceOf(response.chain.chainid, Checksum256)
    })

    test('get_rexraw', async function () {
        const response = await lightapi.get_rexraw('eos', 'teamgreymass')

        assert.instanceOf(response, Types.RexRawResponse)
        assert.instanceOf(response.account_name, Name)
        assert.instanceOf(response.rexraw.pool.loan_num, UInt64)
        assert.equal(response.rexraw.fund, '0.000000000000000000000000')
        assert.equal(response.rexraw.pool.total_rex, '587072315799.259000000000000000000000')
    })

    test('get_tokenbalance', async function () {
        const response = await lightapi.get_tokenbalance(
            'eos',
            'teamgreymass',
            'eosio.token',
            'EOS'
        )

        assert.equal(response, '5292.4309')
    })

    test('get_key', async function () {
        const response = await lightapi.get_key(
            'PUB_K1_8QzGtCea2thiqcTVeXGdyRZpdKYptQznbcWSMj73FD5Rgra4mN'
        )

        assert.equal(response.eos.chain?.network, 'eos')
        assert.isArray(response.eos.accounts?.teamgreymass)
        assert.equal(response.eos.accounts?.teamgreymass[5].perm, 'owner')
        assert.equal(
            response.eos.accounts?.teamgreymass[5].auth.keys[0].public_key,
            'PUB_K1_8QzGtCea2thiqcTVeXGdyRZpdKYptQznbcWSMj73FD5Rgra4mN'
        )
        assert.equal(response.telos.chain?.network, 'telos')
    })

    test('get_codehash', async function () {
        const response = await lightapi.get_codehash(
            '0a16e1dac533c4558698c8754f41219839ba2a2b75e517e65ea2537f76681f49'
        )

        assert.equal(response.eos.chain?.network, 'eos')
        assert.equal(response.eos.accounts?.['eosio.token'].account_name, 'eosio.token')
        assert.equal(
            response.eos.accounts?.['eosio.token'].code_hash,
            '0a16e1dac533c4558698c8754f41219839ba2a2b75e517e65ea2537f76681f49'
        )
    })

    test('get_topholders', async function () {
        const response = await lightapi.get_topholders('eos', 'eosio.token', 'EOS', 10)

        assert.isArray(response)
        assert.equal(response.length, 10)
        assert.deepEqual(response[0], ['core.vaulta', '1035816036.0540'])
    })

    test('get_holdercount', async function () {
        const response = await lightapi.get_holdercount('eos', 'eosio.token', 'EOS')

        assert.equal(response, '1653061')
    })

    test('get_usercount', async function () {
        const response = await lightapi.get_usercount('eos')

        assert.equal(response, '6404414')
    })

    test('get_topram', async function () {
        const response = await lightapi.get_topram('eos', 10)

        assert.isArray(response)
        assert.equal(response.length, 10)
        assert.deepEqual(response[0], ['utxomng.xsat', 132071612727])
    })

    test('get_topstake', async function () {
        const response = await lightapi.get_topstake('eos', 10)

        assert.isArray(response)
        assert.equal(response.length, 10)
        assert.deepEqual(response[0], ['eosio.reserv', 363786986211796, 95432101211517])
    })

    test('get_sync', async function () {
        const response = await lightapi.get_sync('eos')

        assert.equal(response, '0 OK')
    })

    test('get_status', async function () {
        const response = await lightapi.get_status()

        assert.equal(response, 'OK ')
    })
})
