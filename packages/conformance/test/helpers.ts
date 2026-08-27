import {Blockchain} from '@greymass/vert'

const LONG_DOUBLE_IMPORTS = [
    'db_idx_long_double_store',
    'db_idx_long_double_update',
    'db_idx_long_double_remove',
    'db_idx_long_double_find_secondary',
    'db_idx_long_double_find_primary',
    'db_idx_long_double_lowerbound',
    'db_idx_long_double_upperbound',
    'db_idx_long_double_end',
    'db_idx_long_double_next',
    'db_idx_long_double_previous',
]

// vert ships the float128 secondary index host calls commented out, so the byfq index fails to link.
const wasmInstantiate = WebAssembly.instantiate
;(WebAssembly as any).instantiate = function (bytes: any, imports: any) {
    if (imports && imports.env) {
        for (const fn of LONG_DOUBLE_IMPORTS) {
            if (typeof imports.env[fn] !== 'function') imports.env[fn] = () => -1
        }
    }
    return (wasmInstantiate as any).call(WebAssembly, bytes, imports)
}

export const blockchain = new Blockchain()
export const contractAccount = 'conformance'

export const contracts = {
    conformance: blockchain.createContract(contractAccount, './build/conformance.debug', true),
}

export async function resetContract() {
    await blockchain.resetTables()
}

export async function readVersion() {
    const traces = await contracts.conformance.actions.version().send()
    return traces[0].returnValue
}

export async function seedRange(from: number, to: number) {
    await contracts.conformance.actions.seed([from, to]).send()
}

export function fetchRows(): any[] {
    return contracts.conformance.tables.fpcases().getTableRows()
}

export async function callOp(op: string, args: any[]) {
    const traces = await contracts.conformance.actions[op](args).send()
    return traces[0].returnValue
}

export async function seedAll() {
    const v = await readVersion()
    const end = Number(v.fq_start)
    const step = 50
    for (let from = 0; from < end; from += step) {
        await seedRange(from, Math.min(from + step, end))
    }
    return v
}

export function isValidName(s: string) {
    return /^[a-z1-5.]{1,12}$/.test(s) && !s.endsWith('.')
}
