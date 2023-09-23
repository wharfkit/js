import {assert} from 'chai'

import {APIClient, Checksum256, FetchProvider, Float64, Name, UInt64} from '@wharfkit/antelope'
import {mockFetch} from '@wharfkit/mock-data'

import {HyperionAPIClient} from '$lib'

const ABIResponse = {
  // Add mock data that mimics the actual ABI snapshot structure
};

const client = new APIClient({
    provider: new FetchProvider('https://wax.blokcrafters.io/', {fetch: mockFetch}),
})

const hyperion = new HyperionAPIClient(client)

suite('Hyperion API', function () {
    this.slow(200)
    this.timeout(10 * 10000)

    test('get_abi_snapshot', async function () {
        const response = await hyperion.get_abi_snapshot("eosio.token", 2000, true);
        assert.equal(response.abi.version, "eosio::abi/1.1")
    })

    test('get_voters', async function () {
        const response = await hyperion.get_voters('teamgreymass', true, 100, 200);
        assert.equal(response.voters.length, 100);
        assert.instanceOf(response.voters[0].account, Name);
        assert.equal(String(response.voters[0].account), 'j3.rq.wam');
        assert.equal(Number(response.voters[0].weight), 1.5044807131168136e+39);
        assert.equal(Number(response.voters[0].last_vote), 266448316);
    });

    test('get_links', async function () {
        const response = await hyperion.get_links('teamgreymass');
        assert.isArray(response.links);
        assert.equal(response.links.length, 10);
        assert.instanceOf(response.links[0].account, Name);
    });

    test('get_proposals', async function () {
        const response = await hyperion.get_proposals({
            skip: 1,
            limit: 10
        });

        assert.isArray(response.proposals);
        assert.equal(response.proposals.length, 10);
        assert.instanceOf(response.proposals[0].proposer, Name);
    })

    test('get_actions', async function () {
        const response = await hyperion.get_actions("teamgreymass", {
            filter: "eosio.token:*",
            skip: 100,
            limit: 5
        });

    
        assert.isArray(response.actions);
        assert.equal(response.actions.length, 5);
        assert.instanceOf(response.actions[0].act.name, Name);
        assert.instanceOf(response.actions[0].act.authorization[0].actor, Name);
    });

    test('get_created_accounts', async function () {
        const response = await hyperion.get_created_accounts("teamgreymass");

        assert.isArray(response.accounts);
        assert.equal(response.accounts.length, 4);
        assert.instanceOf(response.accounts[0].name, Name);
    })

    test('get_creator', async function () {
        const response = await hyperion.get_creator("teamgreymass");

        assert.instanceOf(response.creator, Name);
        assert.equal(String(response.creator), "gqyqi.waa");
    })

    test('get_deltas', async function () {
        const response = await hyperion.get_deltas("eosio.token", "teamgreymass", "accounts", "teamgreymass");

        assert.equal(response.deltas.length, 10);
        assert.instanceOf(response.deltas[0].code, Name);
    })

    test('get_table_state', async function () {
        const response = await hyperion.get_table_state("eosio.token", "stat", 267000000);

        assert.instanceOf(response.code, Name);
        assert.equal(response.results.length, 1);
    })

    test('get_key_accounts', async function () {
        const response = await hyperion.get_key_accounts("EOS8KmhygTrrvtW7zJd6HXWrNqA5WX9NzScZ37JyXRiwpiJN2g2rR");
        
        assert.equal(response.account_names.length, 1);
        assert.instanceOf(response.account_names[0], Name);
        assert.equal(String(response.account_names[0]), "teamgreymass");
    })

    test('get_tokens', async function () {
        const response = await hyperion.get_tokens("teamgreymass");

        assert.instanceOf(response.account, Name);
        assert.equal(response.tokens.length, 2);
        assert.instanceOf(response.tokens[0].amount, Float64);
    })

    test('get_transaction', async function () {
        const response = await hyperion.get_transaction("a51a3cc53b2ff5d5b25ad44b1e3ef5f796ce3ca60101ea05b3be64e68b684ccb");

        assert.instanceOf(response.trx_id, Checksum256);
        assert.equal(response.actions.length, 5);
        assert.instanceOf(response.actions[0].act.name, Name);
    })
})
