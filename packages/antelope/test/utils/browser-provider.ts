import {APIMethods, APIProvider, Bytes, Checksum160} from '$lib'

const data = global.MOCK_DATA

export class MockProvider implements APIProvider {
    private context = ''

    constructor(private api: string = 'https://jungle4.greymass.com') {}

    setContext(name: string) {
        this.context = name
    }

    getFilename(path: string, params?: unknown) {
        const digest = Checksum160.hash(
            Bytes.from(
                this.api + path + this.context + (params ? JSON.stringify(params) : ''),
                'utf8'
            )
        ).hexString
        return digest + '.json'
    }

    async getExisting(filename: string) {
        return data[filename]
    }

    async call(args: {path: string; params?: unknown; method?: APIMethods}) {
        const existing = await this.getExisting(this.getFilename(args.path, args.params))
        if (existing) {
            return existing
        }
        throw new Error(`No data for ${args.path}`)
    }
}
