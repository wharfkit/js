import {APIClient, FetchProvider} from '@wharfkit/antelope'
import {capitalize} from '@wharfkit/contract'

type logLevel = 'info' | 'debug'

export function makeClient(url: string): APIClient {
    const provider = new FetchProvider(url)
    return new APIClient({provider})
}

export function log(message, level: logLevel = 'debug') {
    if (level === 'info' || process.env.WHARFKIT_DEBUG) {
        process.stdout.write(`${message}\n`)
    }
}

export function capitalizeName(text: string) {
    return text
        .split(/[._]/)
        .map((part) => capitalize(part))
        .join('')
}

export function formatClassName(name: string) {
    return name.split(/[.]/).join('')
}
