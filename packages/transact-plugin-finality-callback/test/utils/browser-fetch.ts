const data = global.MOCK_DATA

function getFilename(path: string) {
    const pathParts = path.split('/')
    return pathParts[pathParts.length - 1] + '.json'
}

export async function mockFetch(path: string) {
    const existing = data[getFilename(path)]
    if (existing) {
        return new Response(JSON.stringify(existing.json), {
            status: existing.status,
            headers: existing.headers,
        })
    }
    throw new Error(`No data for ${path}`)
}
