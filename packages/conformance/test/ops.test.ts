import {beforeEach, describe, expect, test} from 'bun:test'
import {UInt32, UInt64} from '@wharfkit/antelope'

import {callOp, readVersion, resetContract, seedAll} from './helpers'

function precisionFromLabel(label: string): number {
    const m = / p(\d+)$/.exec(label)
    if (!m) throw new Error(`label carries no precision: ${label}`)
    return Number(m[1])
}

function unsignedArg(v: any, bits: number): string {
    return String(BigInt(String(v)) & ((1n << BigInt(bits)) - 1n))
}

function argsFor(c: any): any[] {
    const op = String(c.op)
    if (op === 'amttofd') {
        return [c.ri, precisionFromLabel(String(c.label))]
    }
    const width = op.slice(0, 2)
    const rest = op.slice(2)
    const a = width === 'fs' ? c.a32 : c.a64
    const b = width === 'fs' ? c.b32 : c.b64
    if (rest === 'toamt') {
        return [a, precisionFromLabel(String(c.label))]
    }
    if (rest.startsWith('from')) {
        if (rest.endsWith('x')) return [c.ax]
        if (rest === 'fromus') return [UInt32.from(unsignedArg(c.ri, 32))]
        if (rest === 'fromul') return [UInt64.from(unsignedArg(c.ri, 64))]
        return [c.ri]
    }
    if (
        [
            'add',
            'sub',
            'mul',
            'div',
            'min',
            'max',
            'copysign',
            'eq',
            'ne',
            'lt',
            'le',
            'gt',
            'ge',
        ].includes(rest)
    ) {
        return [a, b]
    }
    return [a]
}

describe('fs and fd ops under vert', () => {
    beforeEach(async () => {
        await resetContract()
    })

    test('every seeded row reproduces through its read-only action', async () => {
        await seedAll()
        const end = Number((await readVersion()).fq_start)
        for (let id = 0; id < end; id++) {
            const row = await callOp('fpcase', [id])
            const out = await callOp(String(row.op), argsFor(row))
            expect(String(out.op)).toBe(String(row.op))
            expect(Object.is(out.r32.value, row.r32.value)).toBeTrue()
            expect(Object.is(out.r64.value, row.r64.value)).toBeTrue()
            expect(String(out.ri)).toBe(String(row.ri))
            expect(String(out.rb)).toBe(String(row.rb))
        }
    }, 60000)

    test('an fq action throws under vert', async () => {
        const zero = '0x00000000000000000000000000000000'
        await expect(callOp('fqadd', [zero, zero])).rejects.toThrow('Not implemented')
    })
})
