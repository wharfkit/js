import {beforeEach, describe, expect, test} from 'bun:test'

import {fetchRows, readVersion, resetContract, seedAll} from './helpers'

const pkg = await Bun.file('./package.json').json()

describe('action: version', () => {
    beforeEach(async () => {
        await resetContract()
    })

    test('reports the package version and CDT version', async () => {
        const row = await readVersion()
        expect(String(row.contract_version)).toBe(pkg.version)
        expect(String(row.cdt_version)).toBe('4.1.1')
    })

    test('reports the grid size the contract computes', async () => {
        const row = await readVersion()
        expect(Number(row.grid_size)).toBeGreaterThan(0)
        expect(Number(row.fq_start)).toBeGreaterThan(0)
        expect(Number(row.fq_start)).toBeLessThanOrEqual(Number(row.grid_size))
        await seedAll()
        expect(fetchRows().length).toBe(Number(row.fq_start))
    })
})
