import {
    APIClient,
    Asset,
    Checksum256Type,
    Int64Type,
    NameType,
    PublicKeyType,
} from '@wharfkit/antelope'
import {Types} from '$lib'

export class HyperionV2APIClient {
    public state: HyperionV2StateAPIClient
    public history: HyperionV2HistoryAPIClient

    constructor(private client: APIClient) {
        this.state = new HyperionV2StateAPIClient(client)
        this.history = new HyperionV2HistoryAPIClient(client)
    }

    get_health() {
        return this.client.call({
            path: `/v2/health`,
            method: 'GET',
            responseType: Types.v2.GetHealthResponse,
        })
    }
}

class HyperionV2StateAPIClient {
    constructor(private client: APIClient) {}

    async get_voters(producer?: NameType, proxy?: boolean, skip?: number, limit?: number) {
        let queryParams = ''
        const queryParts: string[] = []

        if (producer) queryParts.push(`producer=${producer}`)
        if (proxy !== undefined) queryParts.push(`proxy=${proxy}`)
        if (skip !== undefined) queryParts.push(`skip=${skip}`)
        if (limit !== undefined) queryParts.push(`limit=${limit}`)

        queryParams = queryParts.length ? '?' + queryParts.join('&') : ''

        return this.client.call({
            path: `/v2/state/get_voters${queryParams}`,
            method: 'GET',
            responseType: Types.v2.GetVotersResponse,
        })
    }

    async get_links(account?: NameType, code?: NameType, action?: NameType, permission?: NameType) {
        let queryParams = ''
        const queryParts: string[] = []

        if (account !== undefined) queryParts.push(`account=${account}`)
        if (code !== undefined) queryParts.push(`code=${code}`)
        if (action !== undefined) queryParts.push(`action=${action}`)
        if (permission !== undefined) queryParts.push(`permission=${permission}`)

        queryParams = queryParts.length ? '?' + queryParts.join('&') : ''

        return this.client.call({
            path: `/v2/state/get_links${queryParams}`,
            method: 'GET',
            responseType: Types.v2.GetLinksResponse,
        })
    }

    async get_key_accounts(public_key: PublicKeyType) {
        return this.client.call({
            path: `/v2/state/get_key_accounts?public_key=${public_key}`,
            method: 'GET',
            responseType: Types.v2.GetKeyAccountsResponse,
        })
    }

    async get_tokens(account: NameType) {
        return this.client.call({
            path: `/v2/state/get_tokens?account=${account}`,
            method: 'GET',
            responseType: Types.v2.GetTokensResponse,
        })
    }

    async get_proposals(options?: {
        proposer?: NameType
        proposal?: NameType
        account?: NameType
        requested?: string
        provided?: string
        track?: number | boolean
        skip?: number
        limit?: number
    }) {
        const queryParts: string[] = []

        for (const [key, value] of Object.entries(options || {})) {
            queryParts.push(`${key}=${value}`)
        }

        const queryParams = queryParts.length ? '?' + queryParts.join('&') : ''

        return this.client.call({
            path: `/v2/state/get_proposals${queryParams}`,
            method: 'GET',
            responseType: Types.v2.GetProposalsResponse,
        })
    }

    async get_account(account: NameType) {
        return this.client.call({
            path: `/v2/state/get_account?account=${account}`,
            method: 'GET',
            responseType: Types.v2.GetAccountResponse,
        })
    }
}

export class HyperionV2HistoryAPIClient {
    constructor(private client: APIClient) {}

    async get_abi_snapshot(contract: string, block?: number, fetch = false) {
        if (!block) {
            const info = await this.client.v1.chain.get_info()

            block = Number(info.last_irreversible_block_num)
        }

        return this.client.call({
            path: `/v2/history/get_abi_snapshot?contract=${encodeURIComponent(
                contract
            )}&block=${block}&fetch=${fetch}`,
            method: 'GET',
            responseType: Types.v2.GetABISnapshotResponse,
        })
    }

    async get_actions(
        account?: NameType | null,
        options?: {
            filter?: string
            skip?: number
            limit?: number
            sort?: string
            after?: string
            before?: string
            transfer_to?: NameType
            transfer_from?: NameType
            transfer_symbol?: Asset.Symbol
            act_name?: string
            act_account?: NameType
        }
    ) {
        const queryParts: string[] = []

        if (account) {
            queryParts.push(`account=${account}`)
        }

        for (const [key, value] of Object.entries(options || {})) {
            queryParts.push(`${key}=${value}`)
        }

        const queryParams = queryParts.length ? '?' + queryParts.join('&') : ''

        return this.client.call({
            path: `/v2/history/get_actions${queryParams}`,
            method: 'GET',
            responseType: Types.v2.GetActionsResponse,
        })
    }

    async get_created_accounts(
        account: NameType,
        options?: {
            skip?: number
            limit?: number
        }
    ) {
        const queryParts: string[] = [`account=${account}`]

        for (const [key, value] of Object.entries(options || {})) {
            queryParts.push(`${key}=${value}`)
        }

        const queryParams = queryParts.length ? '?' + queryParts.join('&') : ''

        return this.client.call({
            path: `/v2/history/get_created_accounts${queryParams}`,
            method: 'GET',
            responseType: Types.v2.GetCreatedAccountsResponse,
        })
    }

    async get_creator(account: NameType) {
        return this.client.call({
            path: `/v2/history/get_creator?account=${account}`,
            method: 'GET',
            responseType: Types.v2.GetCreatorResponse,
        })
    }

    async get_deltas(code: NameType, scope: NameType, table: NameType, payer: NameType) {
        return this.client.call({
            path: `/v2/history/get_deltas?code=${code}&scope=${scope}&table=${table}&payer=${payer}`,
            method: 'GET',
            responseType: Types.v2.GetDeltasResponse,
        })
    }

    async get_table_state(code: NameType, table: NameType, block_num: Int64Type, after_key = '') {
        return this.client.call({
            path: `/v2/history/get_table_state?code=${code}&table=${table}&block_num=${block_num}&after_key=${after_key}`,
            method: 'GET',
            responseType: Types.v2.GetTableStateResponse,
        })
    }

    async get_transaction(id: Checksum256Type) {
        return this.client.call({
            path: `/v2/history/get_transaction?id=${id}`,
            method: 'GET',
            responseType: Types.v2.GetTransactionResponse,
        })
    }

    async get_transfers() {
        throw new Error('Method not implemented.')
    }

    async get_transacted_accounts() {
        throw new Error('Method not implemented.')
    }
}
