import {
    APIClient,
    Asset,
    Checksum256Type,
    Int64Type,
    NameType,
    PublicKeyType,
} from '@wharfkit/antelope'
import {
    GetABISnapshotResponse,
    GetActionsResponse,
    GetCreatedAccountsResponse,
    GetCreatorResponse,
    GetDeltasResponse,
    GetKeyAccountsResponse,
    GetLinksResponse,
    GetProposalsResponse,
    GetTableStateResponse,
    GetTokensResponse,
    GetTransactionResponse,
    GetVotersResponse,
} from './types'

export class HyperionAPIClient {
    constructor(private client: APIClient) {}

    async get_abi_snapshot(
        contract: string,
        block?: number,
        fetch = false
    ): Promise<GetABISnapshotResponse> {
        if (!block) {
            const info = await this.client.v1.chain.get_info()

            block = Number(info.last_irreversible_block_num)
        }

        return this.client.call({
            path: `/v2/history/get_abi_snapshot?contract=${encodeURIComponent(
                contract
            )}&block=${block}&fetch=${fetch}`,
            method: 'GET',
            responseType: GetABISnapshotResponse,
        })
    }

    async get_voters(
        producer?: NameType,
        proxy?: boolean,
        skip?: number,
        limit?: number
    ): Promise<GetVotersResponse> {
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
            responseType: GetVotersResponse,
        })
    }

    async get_links(account?: NameType): Promise<GetLinksResponse> {
        const queryParams = account ? `?account=${account}` : ''

        return this.client.call({
            path: `/v2/state/get_links${queryParams}`,
            method: 'GET',
            responseType: GetLinksResponse,
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
    }): Promise<GetProposalsResponse> {
        const queryParts: string[] = []

        for (const [key, value] of Object.entries(options || {})) {
            queryParts.push(`${key}=${value}`)
        }

        const queryParams = queryParts.length ? '?' + queryParts.join('&') : ''

        return this.client.call({
            path: `/v2/state/get_proposals${queryParams}`,
            method: 'GET',
            responseType: GetProposalsResponse,
        })
    }

    async get_actions(
        account: NameType,
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
    ): Promise<GetActionsResponse> {
        const queryParts: string[] = [`account=${account}`]

        for (const [key, value] of Object.entries(options || {})) {
            queryParts.push(`${key}=${value}`)
        }

        const queryParams = queryParts.length ? '?' + queryParts.join('&') : ''

        return this.client.call({
            path: `/v2/history/get_actions${queryParams}`,
            method: 'GET',
            responseType: GetActionsResponse,
        })
    }

    async get_created_accounts(account: NameType): Promise<GetCreatedAccountsResponse> {
        return this.client.call({
            path: `/v2/history/get_created_accounts?account=${account}`,
            method: 'GET',
            responseType: GetCreatedAccountsResponse,
        })
    }

    async get_creator(account: NameType): Promise<GetCreatorResponse> {
        return this.client.call({
            path: `/v2/history/get_creator?account=${account}`,
            method: 'GET',
            responseType: GetCreatorResponse,
        })
    }

    async get_deltas(
        code: NameType,
        scope: NameType,
        table: NameType,
        payer: NameType
    ): Promise<GetDeltasResponse> {
        return this.client.call({
            path: `/v2/history/get_deltas?code=${code}&scope=${scope}&table=${table}&payer=${payer}`,
            method: 'GET',
            responseType: GetDeltasResponse,
        })
    }

    async get_table_state(
        code: NameType,
        table: NameType,
        block_num: Int64Type,
        after_key = ''
    ): Promise<GetTableStateResponse> {
        return this.client.call({
            path: `/v2/history/get_table_state?code=${code}&table=${table}&block_num=${block_num}&after_key=${after_key}`,
            method: 'GET',
            responseType: GetTableStateResponse,
        })
    }

    async get_key_accounts(public_key: PublicKeyType): Promise<GetKeyAccountsResponse> {
        return this.client.call({
            path: `/v2/state/get_key_accounts?public_key=${public_key}`,
            method: 'GET',
            responseType: GetKeyAccountsResponse,
        })
    }

    async get_tokens(account: NameType): Promise<GetTokensResponse> {
        return this.client.call({
            path: `/v2/state/get_tokens?account=${account}`,
            method: 'GET',
            responseType: GetTokensResponse,
        })
    }

    async get_transaction(id: Checksum256Type): Promise<GetTransactionResponse> {
        return this.client.call({
            path: `/v2/history/get_transaction?id=${id}`,
            method: 'GET',
            responseType: GetTransactionResponse,
        })
    }
}
