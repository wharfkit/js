import {beforeAll, describe, expect, test} from 'bun:test'
import {ABI, Action, Serializer} from '@wharfkit/antelope'

import {
    argsFor,
    CASE_TYPE,
    loadAbi,
    maskedCase,
    opActionNames,
    precisionFromLabel,
} from '../testnet/args'
import {callOp, resetContract, seedAll} from './helpers'

const abi = loadAbi()
const account = 'conform.gm'
const ZERO128 = `0x${'00'.repeat(16)}`

function isTailOp(op: string): boolean {
    return op.startsWith('fq') || op.endsWith('tofq') || op.endsWith('ix') || op.endsWith('ux')
}

function structFields(name: string): string[] {
    const found = abi.structs.find((s) => String(s.name) === name)
    if (!found) throw new Error(`no ${name} struct in the ABI`)
    return found.fields.map((f) => String(f.name))
}

function syntheticRow(op: string, overrides: Record<string, unknown> = {}) {
    return Serializer.decode({
        object: {
            id: 0,
            op,
            label: 'synthetic p4',
            a32: 0,
            b32: 0,
            r32: 0,
            a64: 0,
            b64: 0,
            r64: 0,
            a128: ZERO128,
            b128: ZERO128,
            r128: ZERO128,
            ri: 0,
            ax: 0,
            rx: 0,
            rb: false,
            by_f64: 0,
            by_f128: ZERO128,
            ...overrides,
        },
        type: CASE_TYPE,
        abi,
    }) as any
}

describe('argsFor against the production ABI', () => {
    test('the production ABI carries 100 actions and 97 of them are ops', () => {
        expect(abi.actions.length).toBe(100)
        expect(opActionNames(abi).length).toBe(97)
    })

    test('the production ABI has no wipe action', () => {
        expect(abi.actions.map((a) => String(a.name))).not.toContain('wipe')
    })

    test('every op action gets arguments matching its ABI field names', () => {
        for (const op of opActionNames(abi)) {
            const args = argsFor(syntheticRow(op))
            expect(Object.keys(args).sort()).toEqual(structFields(op).sort())
        }
    })

    test('every op action serializes from its rebuilt arguments', () => {
        for (const op of opActionNames(abi)) {
            const action = Action.from(
                {account, name: op, authorization: [], data: argsFor(syntheticRow(op))},
                abi
            )
            expect(String(action.name)).toBe(op)
            expect(action.data.array.length).toBeGreaterThan(0)
        }
    })

    test('an op name outside the grid is rejected rather than guessed at', () => {
        expect(() => argsFor({op: 'fdnope', label: ''})).toThrow('unhandled op')
        expect(() => argsFor({op: 'zzadd', label: ''})).toThrow('no known width prefix')
    })

    test('unsigned from-int operands are read back out of the signed column', () => {
        const negative = {ri: '-1', ax: '-1'}
        expect(String(argsFor(syntheticRow('fdfromus', negative)).a)).toBe('4294967295')
        expect(String(argsFor(syntheticRow('fdfromul', negative)).a)).toBe('18446744073709551615')
        expect(String(argsFor(syntheticRow('fdfromux', negative)).a)).toBe(
            '340282366920938463463374607431768211455'
        )
        expect(String(argsFor(syntheticRow('fdfromil', negative)).a)).toBe('-1')
        expect(String(argsFor(syntheticRow('fdfromix', negative)).a)).toBe('-1')
    })

    test('the amt ops take their precision from the label', () => {
        expect(precisionFromLabel('1234.5678 p4')).toBe(4)
        expect(argsFor(syntheticRow('fdtoamt')).precision).toBe(4)
        expect(argsFor(syntheticRow('amttofd')).precision).toBe(4)
        expect(() => argsFor(syntheticRow('fdtoamt', {label: 'no precision'}))).toThrow(
            'label carries no precision'
        )
    })
})

describe('argsFor against seeded grid rows', () => {
    let firstRowPerOp: Map<string, any>

    beforeAll(async () => {
        await resetContract()
        const version = await seedAll()
        firstRowPerOp = new Map()
        for (let id = 0; id < Number(version.fq_start); id++) {
            const row = await callOp('fpcase', [id])
            const op = String(row.op)
            if (!firstRowPerOp.has(op)) firstRowPerOp.set(op, row)
        }
    }, 120000)

    test('the grid below fq_start uses every op outside the wide-int and fq tail', () => {
        const expected = opActionNames(abi)
            .filter((op) => !isTailOp(op))
            .sort()
        expect([...firstRowPerOp.keys()].sort()).toEqual(expected)
    })

    test('one row per op replays through argsFor', async () => {
        for (const [op, row] of firstRowPerOp) {
            const out = await callOp(op, argsFor(row) as any)
            expect(String(out.op)).toBe(op)
            expect(Object.is(out.r32.value, row.r32.value)).toBeTrue()
            expect(Object.is(out.r64.value, row.r64.value)).toBeTrue()
            expect(String(out.ri)).toBe(String(row.ri))
            expect(String(out.rx)).toBe(String(row.rx))
            expect(String(out.rb)).toBe(String(row.rb))
        }
    }, 60000)

    test('the masked row encodes to the bytes a read-only op returns', async () => {
        for (const [op, row] of firstRowPerOp) {
            const out = await callOp(op, argsFor(row) as any)
            const returned = Serializer.encode({object: out, type: CASE_TYPE, abi}).hexString
            const expected = Serializer.encode({
                object: maskedCase(row, abi),
                type: CASE_TYPE,
                abi,
            }).hexString
            expect(returned).toBe(expected)
        }
    }, 60000)

    test('the wide-int and fq tail the grid uses above fq_start is covered by argsFor', () => {
        const tail = opActionNames(abi).filter(isTailOp)
        for (const op of tail) {
            expect(Object.keys(argsFor(syntheticRow(op))).sort()).toEqual(structFields(op).sort())
        }
        expect(tail.length).toBe(opActionNames(abi).length - firstRowPerOp.size)
    })
})

test('the ABI loader returns an ABI', () => {
    expect(abi).toBeInstanceOf(ABI)
})
