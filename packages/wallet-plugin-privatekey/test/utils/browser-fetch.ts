import {Bytes, Checksum160} from '@wharfkit/antelope'

const data = global.MOCK_DATA

function getFilename(path: string, params?: unknown) {
    const digest = Checksum160.hash(
        Bytes.from(path + (params ? JSON.stringify(params) : ''), 'utf8')
    ).hexString
    return digest + '.json'
}

export async function mockFetch(path: string, params?: unknown) {
    const existing = data[getFilename(path, params)]
    if (existing) {
        return new Response(existing.text, {
            status: existing.status,
            headers: existing.headers,
        })
    }
    throw new Error(`No data for ${path}`)
}
