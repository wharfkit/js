import {APIClient, FetchProvider} from '@greymass/eosio'

import {mockUrl} from './config'
import {mockFetch} from './fetch'

export function makeClient(url?: string) {
    return new APIClient({
        provider: new FetchProvider(url || mockUrl, {fetch: mockFetch}),
    })
}
