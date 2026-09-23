import zlib from 'pako'
import {APIClient, FetchProvider} from '@wharfkit/antelope'
import {
    ABICache,
    CallbackPayload,
    PermissionLevel,
    PrivateKey,
    SigningRequest,
} from '@wharfkit/session'
import {
    mockChainId,
    mockFetch,
    mockPermissionLevel,
    mockPrivateKey,
    mockUrl,
} from '@wharfkit/mock-data'

export const mockPublicKey = String(PrivateKey.from(mockPrivateKey).toPublic())
export const mockChannelId = '00000000-0000-0000-0000-00000000cafe'
export const mockChannelUrl = `https://cb.anchor.link/${mockChannelId}`

const client = new APIClient({provider: new FetchProvider(mockUrl, {fetch: mockFetch})})
const abiCache = new ABICache(client)

const mockTapos = {
    expiration: '2035-01-01T00:00:00',
    ref_block_num: 0,
    ref_block_prefix: 0,
}

function signAndBuildPayload(resolved): CallbackPayload {
    const signature = PrivateKey.from(mockPrivateKey).signDigest(
        resolved.transaction.signingDigest(mockChainId)
    )
    const callback = resolved.getCallback([signature])
    if (!callback) {
        throw new Error('mock request has no callback')
    }
    return {...callback.payload}
}

/**
 * Build the callback payload TackleBox POSTs after the user accepts a login
 * request: the signed identity plus the link session announcement.
 */
export function makeLoginCallbackPayload(options: {channel?: boolean} = {}): CallbackPayload {
    const request = SigningRequest.identity(
        {
            callback: {url: 'https://cb.anchor.link/login-channel', background: true},
            scope: 'unittest',
            chainId: mockChainId,
        },
        {zlib}
    )
    const resolved = request.resolve(
        new Map(),
        PermissionLevel.from(mockPermissionLevel),
        mockTapos
    )
    const payload = signAndBuildPayload(resolved)
    if (options.channel !== false) {
        payload.link_ch = mockChannelUrl
        payload.link_key = mockPublicKey
        payload.link_name = 'TackleBox'
    }
    return payload
}

/**
 * Build the callback payload TackleBox POSTs after signing a pushed
 * transaction request.
 */
export async function makeTransactCallbackPayload(action): Promise<CallbackPayload> {
    const request = await SigningRequest.create(
        {
            action,
            chainId: mockChainId,
            broadcast: false,
            callback: {url: 'https://cb.anchor.link/transact-channel', background: true},
        },
        {zlib, abiProvider: abiCache}
    )
    const abis = await request.fetchAbis(abiCache)
    const resolved = request.resolve(abis, PermissionLevel.from(mockPermissionLevel), mockTapos)
    const payload = signAndBuildPayload(resolved)
    payload.link_name = 'TackleBox'
    return payload
}
