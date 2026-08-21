/* eslint-disable no-console */
import {ABI, Action, Serializer, Transaction, UInt64} from '@wharfkit/antelope'

import {
    account,
    argsFor,
    CASE_TYPE,
    caseFieldTypes,
    client,
    maskedCase,
    productionAbi,
    readVersion,
} from './common'

type Row = Record<string, any>

const SAMPLE_LIMIT = Number(process.env.VERIFY_SAMPLE_LIMIT ?? 8)
const BATCH_SIZE = Number(process.env.VERIFY_BATCH_SIZE ?? 25)
const PAGE_SIZE = 500

interface Category {
    key: string
    parity: 'binary' | 'text' | 'math'
    title: string
    gap: boolean
}

const CATEGORIES: Category[] = [
    {
        key: 'row-binary',
        parity: 'binary',
        title: 'a decoded row does not re-encode to the bytes the node served',
        gap: false,
    },
    {
        key: 'row-order',
        parity: 'binary',
        title: 'the JSON page and the binary page disagree on row order',
        gap: false,
    },
    {
        key: 'text-float-format',
        parity: 'text',
        title: 'the two renderings differ in spelling and parse back to the same value',
        gap: true,
    },
    {
        key: 'text-float-lossy',
        parity: 'text',
        title: "the node's %.17f rendering does not parse back to the value it rendered",
        gap: true,
    },
    {
        key: 'text-exact',
        parity: 'text',
        title: 'a non-float field renders differently',
        gap: false,
    },
    {
        key: 'roundtrip',
        parity: 'math',
        title: 'a read-only call on the rebuilt operands returns a different result',
        gap: false,
    },
    {
        key: 'roundtrip-error',
        parity: 'math',
        title: 'a read-only call on the rebuilt operands raised an error',
        gap: false,
    },
    {
        key: 'index',
        parity: 'math',
        title: 'a secondary index query behaved unexpectedly',
        gap: false,
    },
]

const counts = new Map<string, number>()
const samples = new Map<string, string[]>()

function note(key: string, message: string) {
    counts.set(key, (counts.get(key) ?? 0) + 1)
    const kept = samples.get(key) ?? []
    if (kept.length < SAMPLE_LIMIT) {
        kept.push(message)
        samples.set(key, kept)
    }
}

function fail(message: string): never {
    console.error(`verify: ${message}`)
    process.exit(2)
}

function parseFloatText(text: string): number {
    const t = String(text).trim().toLowerCase()
    if (t.endsWith('nan')) return NaN
    if (t === 'inf' || t === 'infinity' || t === '+inf' || t === '+infinity') return Infinity
    if (t === '-inf' || t === '-infinity') return -Infinity
    return Number(t)
}

function describeExcept(except: any): string {
    const details = except?.stack?.[0]?.format ?? except?.message ?? JSON.stringify(except)
    return String(details).split('\n')[0]
}

console.log('conformance verify')
console.log('  binary parity: bytes on chain against bytes the SDK produces')
console.log('  text parity:   the node JSON rendering against the SDK JSON rendering')
console.log('  math parity:   stored results against a fresh read-only computation, index ordering')
console.log('')
console.log('  Float text differences are a format difference, not an SDK deficiency. The node')
console.log('  renders through fc %.17f, which loses significant digits as magnitude falls and')
console.log('  renders anything below 1e-17 as zero. The SDK renders shortest round-trip.')
console.log('')

// 1. Pin the node, the contract, and the ABI.

const info = await client.v1.chain.get_info()
const version = await readVersion()
const gridSize = Number(version.grid_size)
const fqStart = Number(version.fq_start)
console.log(`node     ${info.server_version_string} (chain ${info.chain_id})`)
console.log(`account  ${account}`)
console.log(
    `contract ${version.contract_version} built with cdt ${version.cdt_version}, ` +
        `grid ${gridSize}, fq_start ${fqStart}`
)
console.log(`seeded   ${version.seeded_at}`)
if (String(version.seeded_at).startsWith('1970')) {
    fail('the grid is not fully seeded; run make testnet/seed before verifying')
}

const onChainAbi = ABI.from((await client.v1.chain.get_abi(account)).abi!)
if (!Serializer.encode({object: onChainAbi}).equals(Serializer.encode({object: productionAbi}))) {
    fail('the on-chain ABI differs from build/conformance.abi; redeploy with make testnet')
}
console.log(`abi      matches build/conformance.abi, ${onChainAbi.actions.length} actions`)
console.log('')

function boolText(text: string): string {
    if (text === '1' || text === 'true') return 'true'
    if (text === '0' || text === 'false') return 'false'
    return text
}

const types = caseFieldTypes(onChainAbi)
const floatFields = new Set(
    [...types.entries()]
        .filter(([, type]) => type === 'float32' || type === 'float64')
        .map(([n]) => n)
)

// 2. Fetch the grid twice, once as node-rendered JSON and once as raw bytes.

async function fetchAll(json: boolean): Promise<any[]> {
    const collected: any[] = []
    let lower = UInt64.from(0)
    for (;;) {
        const res: any = await client.v1.chain.get_table_rows({
            code: account,
            scope: account,
            table: 'fpcases',
            key_type: 'i64',
            lower_bound: lower,
            limit: PAGE_SIZE,
            json,
        } as any)
        collected.push(...res.rows)
        if (!res.more || !res.next_key) break
        lower = UInt64.from(res.next_key)
    }
    return collected
}

const jsonRows: Row[] = await fetchAll(true)
const hexRows: string[] = (await fetchAll(false)).map((row) => String(row))
console.log(`rows     ${jsonRows.length} JSON, ${hexRows.length} binary`)
if (jsonRows.length !== gridSize) {
    fail(`expected ${gridSize} rows, the node served ${jsonRows.length}`)
}
if (hexRows.length !== gridSize) {
    fail(`expected ${gridSize} binary rows, the node served ${hexRows.length}`)
}

// 3. Binary and text parity, row by row; the binary row is the authority.

const decodedRows = hexRows.map((hex) =>
    Serializer.decode({data: hex, type: CASE_TYPE, abi: onChainAbi})
) as Row[]

for (let i = 0; i < decodedRows.length; i++) {
    const decoded = decodedRows[i]
    const jsonRow = jsonRows[i]
    const id = String(decoded.id)
    const op = String(decoded.op)
    const label = String(decoded.label)
    const where = `id=${id} op=${op} label="${label}"`

    if (String(jsonRow.id) !== id) {
        note('row-order', `${where}: the JSON page carries id=${jsonRow.id} at the same offset`)
        continue
    }

    const reencoded = Serializer.encode({
        object: decoded,
        type: CASE_TYPE,
        abi: onChainAbi,
    }).hexString
    if (reencoded.toLowerCase() !== hexRows[i].toLowerCase()) {
        note('row-binary', `${where}: chain=${hexRows[i]} sdk=${reencoded}`)
    }

    const objectified: Row = Serializer.objectify(decoded)
    for (const name of types.keys()) {
        const chainText = String(jsonRow[name])
        const sdkText = String(objectified[name])
        if (chainText === sdkText) continue
        // The node renders bool as 0 and 1, the SDK as false and true. Same value, different spelling.
        if (types.get(name) === 'bool' && boolText(chainText) === boolText(sdkText)) continue
        if (!floatFields.has(name)) {
            note('text-exact', `${where} ${name}: chain=${chainText} sdk=${sdkText}`)
            continue
        }
        const chainValue = parseFloatText(chainText)
        const sdkValue = parseFloatText(sdkText)
        const key = Object.is(chainValue, sdkValue) ? 'text-float-format' : 'text-float-lossy'
        note(key, `${where} ${name}: chain=${chainText} sdk=${sdkText}`)
    }
}

// 4. Read-only round trip: rebuild each row's operands and ask the chain to recompute.

function maskedExpectation(decoded: Row): string {
    const masked = maskedCase(decoded, onChainAbi)
    return Serializer.encode({object: masked, type: CASE_TYPE, abi: onChainAbi}).hexString
}

function actionFor(decoded: Row): Action {
    return Action.from(
        {account, name: String(decoded.op), authorization: [], data: argsFor(decoded)},
        onChainAbi
    )
}

async function sendReadOnly(actions: Action[]): Promise<string[]> {
    const tx = Transaction.from({
        ref_block_num: 0,
        ref_block_prefix: 0,
        expiration: 0,
        actions,
    })
    const res: any = await client.v1.chain.send_read_only_transaction(tx)
    if (res.processed.except) throw new Error(describeExcept(res.processed.except))
    const traces = res.processed.action_traces
    if (traces.length !== actions.length) {
        throw new Error(`expected ${actions.length} traces, the node returned ${traces.length}`)
    }
    return traces.map((trace: any) => String(trace.return_value_hex_data).toLowerCase())
}

function compareRoundTrip(decoded: Row, returned: string) {
    const where = `id=${decoded.id} op=${decoded.op} label="${decoded.label}"`
    const expected = maskedExpectation(decoded).toLowerCase()
    if (returned !== expected) {
        note('roundtrip', `${where}: action=${returned} row=${expected}`)
    }
}

let roundTripped = 0
for (let start = 0; start < decodedRows.length; start += BATCH_SIZE) {
    const batch = decodedRows.slice(start, start + BATCH_SIZE)
    let returned: string[] | undefined
    try {
        returned = await sendReadOnly(batch.map(actionFor))
    } catch (error) {
        returned = undefined
        for (const decoded of batch) {
            try {
                const [one] = await sendReadOnly([actionFor(decoded)])
                compareRoundTrip(decoded, one)
            } catch (single) {
                note(
                    'roundtrip-error',
                    `id=${decoded.id} op=${decoded.op} label="${decoded.label}": ${String(single).split('\n')[0]}`
                )
            }
            roundTripped++
        }
    }
    if (returned) {
        for (let i = 0; i < batch.length; i++) {
            compareRoundTrip(batch[i], returned[i])
        }
        roundTripped += batch.length
    }
}
console.log(`replay   ${roundTripped} rows recomputed through their read-only action`)

// 5. Secondary index queries.

async function indexQuery(params: Record<string, unknown>) {
    return client.v1.chain.get_table_rows({
        code: account,
        scope: account,
        table: 'fpcases',
        json: true,
        limit: 5,
        ...params,
    } as any)
}

try {
    const byF64: any = await indexQuery({
        index_position: 'secondary',
        key_type: 'float64',
        lower_bound: '1',
        upper_bound: '2',
    })
    console.log(`byfd     float64 index over [1,2]: ${byF64.rows.length} rows`)
    for (const row of byF64.rows) {
        const value = parseFloatText(String(row.by_f64))
        if (!(value >= 1 && value <= 2)) {
            note('index', `byfd returned id=${row.id} with by_f64=${row.by_f64}, outside [1,2]`)
        }
    }
} catch (error) {
    note(
        'index',
        `the float64 index query over [1,2] was rejected: ${String(error).split('\n')[0]}`
    )
}

try {
    const byF128: any = await indexQuery({
        index_position: 'tertiary',
        key_type: 'float128',
        lower_bound: '1',
        upper_bound: '2',
    })
    console.log(`byfq     float128 index over [1,2]: ${byF128.rows.length} rows`)
} catch (error) {
    note(
        'index',
        `the float128 index query over [1,2] was rejected: ${String(error).split('\n')[0]}`
    )
}

// A float128 hex bound is a big-endian integer literal memcpy'd into the key, the byte reverse of the row's serialization.
const ONE_F128_BOUND = '0x3fff0000000000000000000000000000'
const ONE_F128_ROW = '0x0000000000000000000000000000ff3f'
try {
    const byF128Hex: any = await indexQuery({
        index_position: 'tertiary',
        key_type: 'float128',
        encode_type: 'hex',
        lower_bound: ONE_F128_BOUND,
        upper_bound: ONE_F128_BOUND,
        limit: 100,
    })
    console.log(`byfq     float128 index at 1.0 by hex bound: ${byF128Hex.rows.length} rows`)
    if (byF128Hex.rows.length === 0) {
        note(
            'index',
            'the byfq hex bound at 1.0 returned no rows, but rows with by_f128 == 1.0 exist'
        )
    }
    for (const row of byF128Hex.rows) {
        if (String(row.by_f128).toLowerCase() !== ONE_F128_ROW) {
            note('index', `byfq hex bound returned id=${row.id} with by_f128=${row.by_f128}`)
        }
    }
} catch (error) {
    note(
        'index',
        `the float128 index query at the 1.0 hex bound was rejected: ${String(error).split('\n')[0]}`
    )
}

try {
    await indexQuery({index_position: 'secondary', key_type: 'float64', lower_bound: 'nan'})
    note('index', 'the node accepted a NaN lower bound on the float64 index')
} catch (error) {
    console.log(`byfd     NaN lower bound rejected: ${String(error).split('\n')[0]}`)
}

// 6. Summary.

console.log('')
let total = 0
let blocking = 0
for (const parity of ['binary', 'text', 'math'] as const) {
    const lines: string[] = []
    for (const category of CATEGORIES.filter((c) => c.parity === parity)) {
        const count = counts.get(category.key) ?? 0
        if (count === 0) continue
        total += count
        if (!category.gap) blocking += count
        const tag = category.gap ? ' [float text format, not a contract defect]' : ''
        lines.push(`  ${count} x ${category.title}${tag}`)
        for (const sample of samples.get(category.key) ?? []) {
            lines.push(`      ${sample}`)
        }
        const hidden = count - (samples.get(category.key)?.length ?? 0)
        if (hidden > 0) lines.push(`      and ${hidden} more`)
    }
    if (lines.length === 0) {
        console.log(`${parity} parity: pass`)
    } else {
        console.log(`${parity} parity: differences found`)
        for (const line of lines) console.log(line)
    }
}

console.log('')
if (total === 0) {
    console.log('verify: every row matches on all three parity axes')
} else if (blocking === 0) {
    console.log(
        `verify: ${total} differences, all of them float text format. ` +
            'Binary and math parity hold, so the contract and the node agree.'
    )
} else {
    console.log(
        `verify: ${total} differences, ${blocking} of them outside the float text format gap`
    )
}
process.exit(blocking === 0 ? 0 : 1)
