import {ABISerializableConstructor, APIClient, NameType} from '@wharfkit/antelope'
import * as Types from './types'

export class LightAPIClient {
    constructor(private client: APIClient) {}

    get_networks() {
        return this.callJson<Types.NetworkInfo>('/api/networks')
    }

    get_account(network: string, account: NameType | string) {
        return this.callStruct(
            `/api/account/${this.encodeSegment(network)}/${this.encodeSegment(account)}`,
            Types.AccountResponse
        )
    }

    get_accinfo(network: string, account: NameType | string) {
        return this.callStruct(
            `/api/accinfo/${this.encodeSegment(network)}/${this.encodeSegment(account)}`,
            Types.AccountInfoResponse
        )
    }

    get_balances(network: string, account: NameType | string) {
        return this.callStruct(
            `/api/balances/${this.encodeSegment(network)}/${this.encodeSegment(account)}`,
            Types.BalancesResponse
        )
    }

    get_rexbalance(network: string, account: NameType | string) {
        return this.callStruct(
            `/api/rexbalance/${this.encodeSegment(network)}/${this.encodeSegment(account)}`,
            Types.RexBalanceResponse
        )
    }

    get_rexraw(network: string, account: NameType | string) {
        return this.callStruct(
            `/api/rexraw/${this.encodeSegment(network)}/${this.encodeSegment(account)}`,
            Types.RexRawResponse
        )
    }

    get_tokenbalance(
        network: string,
        account: NameType | string,
        contract: NameType | string,
        token: string
    ) {
        return this.callText(
            `/api/tokenbalance/${this.encodeSegment(network)}/${this.encodeSegment(
                account
            )}/${this.encodeSegment(contract)}/${this.encodeSegment(token)}`
        )
    }

    get_key(key: string) {
        return this.callJson<Types.KeyLookupResponse>(`/api/key/${this.encodeSegment(key)}`)
    }

    get_codehash(hash: string) {
        return this.callJson<Types.CodeHashResponse>(`/api/codehash/${this.encodeSegment(hash)}`)
    }

    get_topholders(network: string, contract: NameType | string, token: string, count: number) {
        return this.callJson<Types.TopHolderRow[]>(
            `/api/topholders/${this.encodeSegment(network)}/${this.encodeSegment(
                contract
            )}/${this.encodeSegment(token)}/${this.encodeSegment(count)}`
        )
    }

    get_holdercount(network: string, contract: NameType | string, token: string) {
        return this.callText(
            `/api/holdercount/${this.encodeSegment(network)}/${this.encodeSegment(
                contract
            )}/${this.encodeSegment(token)}`
        )
    }

    get_usercount(network: string) {
        return this.callText(`/api/usercount/${this.encodeSegment(network)}`)
    }

    get_topram(network: string, count: number) {
        return this.callJson<Types.TopRamRow[]>(
            `/api/topram/${this.encodeSegment(network)}/${this.encodeSegment(count)}`
        )
    }

    get_topstake(network: string, count: number) {
        return this.callJson<Types.TopStakeRow[]>(
            `/api/topstake/${this.encodeSegment(network)}/${this.encodeSegment(count)}`
        )
    }

    get_sync(network: string) {
        return this.callText(`/api/sync/${this.encodeSegment(network)}`)
    }

    get_status() {
        return this.callText('/api/status')
    }

    private callStruct<T extends ABISerializableConstructor>(path: string, responseType: T) {
        return this.client.call({
            path,
            method: 'GET',
            responseType,
        })
    }

    private callJson<T>(path: string) {
        return this.client.call<T>({
            path,
            method: 'GET',
        })
    }

    private callText(path: string) {
        return this.client.call<string>({
            path,
            method: 'GET',
        })
    }

    private encodeSegment(value: string | number | NameType) {
        return encodeURIComponent(String(value))
    }
}
