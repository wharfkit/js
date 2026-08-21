import {APIClient} from '@wharfkit/antelope'

import {Contract} from '../codegen/conformance'
import {loadAbi, productionAbiPath} from './args'

export * from './args'

export const nodeUrl = process.env.TESTNET_NODE_URL
export const account = process.env.CONFORMANCE_TESTNET_ACCOUNT

export const client = new APIClient({url: nodeUrl})
export const contract = new Contract({account, client})

export const productionAbi = loadAbi(productionAbiPath)

export async function readVersion() {
    return contract.readonly('version')
}
