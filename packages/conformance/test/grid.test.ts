import {beforeEach, describe, expect, test} from 'bun:test'

import {abi} from '../codegen/conformance'
import {fetchRows, isValidName, readVersion, resetContract, seedAll, seedRange} from './helpers'

describe('grid', () => {
    beforeEach(async () => {
        await resetContract()
    })

    test('seeds every id before fq_start with contiguous ids', async () => {
        const v = await seedAll()
        const rows = fetchRows()
        expect(rows.length).toBe(Number(v.fq_start))
        rows.forEach((row, i) => expect(Number(row.id)).toBe(i))
    })

    test('every op names an action in the ABI and every fp action appears in the grid', async () => {
        await seedAll()
        const rows = fetchRows()
        const actionNames = new Set(abi.actions.map((a) => String(a.name)))
        const opsUsed = new Set(rows.map((r) => String(r.op)))
        for (const op of opsUsed) expect(actionNames.has(op)).toBeTrue()
        const fpActions = [...actionNames].filter((n) => /^f[sdq]/.test(n))
        for (const n of fpActions) {
            if (n.startsWith('fq') || n.endsWith('tofq') || /[iu]x$/.test(n)) continue
            expect(opsUsed.has(n)).toBeTrue()
        }
    })

    test('every action name is a valid Antelope name', () => {
        for (const a of abi.actions) expect(isValidName(String(a.name))).toBeTrue()
    })

    test('rows never carry NaN secondary keys', async () => {
        await seedAll()
        for (const row of fetchRows()) {
            expect(Number.isNaN(Number(row.by_f64))).toBeFalse()
        }
    })

    test('fq_start splits the grid: no fq-touching op below it', async () => {
        const v = await seedAll()
        const fqStart = Number(v.fq_start)
        for (const row of fetchRows()) {
            const op = String(row.op)
            const touchesFq = op.startsWith('fq') || op.endsWith('tofq') || /[iu]x$/.test(op)
            expect(touchesFq).toBe(Number(row.id) >= fqStart)
        }
    })

    test('seeding the fq range throws under vert', async () => {
        const v = await readVersion()
        const fqStart = Number(v.fq_start)
        expect(fqStart).toBeLessThan(Number(v.grid_size))
        await expect(seedRange(fqStart, fqStart + 1)).rejects.toThrow('Not implemented')
    })
})
