import {APIClient} from '@wharfkit/antelope'

export class HyperionV1APIClient {
    public history: HyperionV1HistoryAPIClient
    public chain: HyperionV1ChainAPIClient
    public trace_api: HyperionV1TraceApiClient

    constructor(private client: APIClient) {
        this.history = new HyperionV1HistoryAPIClient(client)
        this.chain = new HyperionV1ChainAPIClient(client)
        this.trace_api = new HyperionV1TraceApiClient(client)
    }
}

class HyperionV1HistoryAPIClient {
    constructor(private client: APIClient) {}

    async get_actions(): Promise<void> {
        throw new Error('Method not implemented.')
    }

    async get_controlled_accounts(): Promise<void> {
        throw new Error('Method not implemented.')
    }

    async get_key_accounts(): Promise<void> {
        throw new Error('Method not implemented.')
    }

    async get_transaction(): Promise<void> {
        throw new Error('Method not implemented.')
    }
}

class HyperionV1ChainAPIClient {
    constructor(private client: APIClient) {}

    async get_block(): Promise<void> {
        throw new Error('Method not implemented.')
    }
}

class HyperionV1TraceApiClient {
    constructor(private client: APIClient) {}

    async get_block(): Promise<void> {
        throw new Error('Method not implemented.')
    }
}
