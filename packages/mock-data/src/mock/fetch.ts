import fetch, {Response} from 'node-fetch'
import {join as joinPath} from 'path'
import {promisify} from 'util'
import {readFile as _readFile, writeFile as _writeFile} from 'fs'
import {request} from 'http'
import {Bytes, Checksum160} from '@wharfkit/antelope'

const readFile = promisify(_readFile)
const writeFile = promisify(_writeFile)

function getFilename(path: string, params?: unknown) {
    const digest = Checksum160.hash(
        Bytes.from(path + (params ? JSON.stringify(params) : ''), 'utf8')
    ).hexString
    if (!process.env['MOCK_DIR']) {
        throw new Error('MOCK_DIR environment variable not set')
    }
    return joinPath(process.cwd(), process.env['MOCK_DIR'], digest + '.json')
}

async function getExisting(filename: string) {
    try {
        const data = await readFile(filename)
        return JSON.parse(data.toString('utf8'))
    } catch (error) {
        if ((<any>error).code !== 'ENOENT') {
            throw error
        }
    }
}

async function unixSocketFetch(socketPath: string, path: string, params: any): Promise<Response> {
    if (typeof process === 'undefined' || !process.versions?.node) {
        throw new Error('Unix socket fetch is only supported in Node.js environments')
    }

    return new Promise((resolve, reject) => {
        const url = new URL(path)
        const requestPath = url.pathname + url.search

        const options = {
            socketPath,
            path: requestPath,
            method: params?.method || 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...params?.headers,
            },
        }

        const req = request(options, (res) => {
            let data = ''
            res.on('data', (chunk) => (data += chunk))
            res.on('end', () => {
                resolve(
                    new Response(data, {
                        status: res.statusCode,
                        headers: res.headers as any,
                    })
                )
            })
        })

        req.on('error', reject)

        if (params?.body) {
            req.write(params.body)
        }
        req.end()
    })
}

export async function mockFetch(path, params) {
    if (process.env['LOGHTTP']) {
        console.log('HTTP Request', {path, params}) // eslint-disable-line no-console
    }
    const filename = getFilename(path, params)
    if (process.env['MOCK'] !== 'overwrite') {
        const existing = await getExisting(filename)
        if (existing) {
            if (process.env['LOGHTTP'] === 'size') {
                const size = Buffer.byteLength(JSON.stringify(existing.json))
                console.log('HTTP Response (from cache)', {path, params, size}) // eslint-disable-line no-console
            }
            return new Response(existing.text, {
                status: existing.status,
                headers: existing.headers,
            })
        }
    }
    if (process.env['MOCK']) {
        let response: Response

        if (process.env['MOCK_SOCKET']) {
            response = await unixSocketFetch(process.env['MOCK_SOCKET'], path, params)
        } else {
            response = await fetch(path, params)
        }

        const cloned = await response.clone()
        let size = 0
        cloned.json().then((json) => {
            size = Buffer.byteLength(JSON.stringify(json))
            writeFile(
                filename,
                JSON.stringify(
                    {
                        request: {
                            path,
                            params,
                        },
                        // headers: Object.fromEntries(response.headers.entries()),
                        status: response.status,
                        json,
                        text: JSON.stringify(json),
                    },
                    undefined,
                    4
                )
            )
            if (process.env['LOGHTTP'] === 'size') {
                console.log('HTTP Response (from API)', {path, params, size}) // eslint-disable-line no-console
            }
        })
        return response
    } else {
        throw new Error(`No data for ${path}`)
    }
}
