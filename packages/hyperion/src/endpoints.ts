import {APIClient} from '@wharfkit/antelope'
import {HyperionV1APIClient} from './endpoints/v1'
import {HyperionV2APIClient} from './endpoints/v2'

export class HyperionAPIClient {
    public v1: HyperionV1APIClient
    public v2: HyperionV2APIClient

    constructor(private client: APIClient) {
        this.v1 = new HyperionV1APIClient(client)
        this.v2 = new HyperionV2APIClient(client)
    }
}
