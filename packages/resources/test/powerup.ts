import 'mocha'
import {strict as assert} from 'assert'

import {Asset} from '@wharfkit/antelope'
import {makeClient} from '@wharfkit/mock-data'

import {PowerUpState, Resources} from '../src'

const resources_eos = new Resources({
    api: makeClient('https://eos.greymass.com'),
})

const resources_jungle = new Resources({
    api: makeClient('https://jungle4.greymass.com'),
})

const resources_wax = new Resources({
    api: makeClient('https://wax.greymass.com'),
    sampleAccount: 'boost.wax',
})

// Fixture for tests to provide reproducable values
const defaultFixture = {
    timestamp: 1616784396,
}

suite('powerup', function () {
    this.slow(200)
    test('powerup = v1.powerup.get_state', async function () {
        const powerup = await resources_eos.v1.powerup.get_state()
        assert.equal(powerup instanceof PowerUpState, true)
    })
})

suite('[eos] powerup - cpu calculations', function () {
    this.slow(200)
    setup(async function () {
        const info = await resources_eos.api.v1.chain.get_info()
        this.testFixture = Object.assign({}, defaultFixture, {
            virtual_block_cpu_limit: info.virtual_block_cpu_limit,
            virtual_block_net_limit: info.virtual_block_net_limit,
        })
    })
    test('powerup.cpu.us_to_weight', async function () {
        const powerup = await resources_eos.v1.powerup.get_state()
        const sample = await resources_eos.getSampledUsage()
        assert.equal(
            powerup.cpu.us_to_weight(sample.cpu, 35868).equals(397077382),
            true,
            `got ${powerup.cpu.us_to_weight(sample.cpu, 35868)} instead of 397077382`
        )
    })
    test('powerup.cpu.weight_to_us', async function () {
        const powerup = await resources_eos.v1.powerup.get_state()
        const sample = await resources_eos.getSampledUsage()
        assert.equal(
            powerup.cpu.weight_to_us(sample.cpu, 12930064).equals(1168),
            true,
            `got ${powerup.cpu.weight_to_us(sample.cpu, 12930064)} instead of 1168`
        )
    })
    test('powerup.cpu.allocated', async function () {
        const powerup = await resources_eos.v1.powerup.get_state()

        assert.equal(powerup.cpu.allocated, 0.99)
        // 70.2192246791559% represented as float
    })
    test('powerup.cpu.reserved', async function () {
        const powerup = await resources_eos.v1.powerup.get_state()

        assert.equal(
            powerup.cpu.reserved.equals(0.07891504719871277),
            true,
            `got ${powerup.cpu.reserved} instead of 0.07891504719871277`
        )
        // 7.891504719871277% represented as float
    })
    test('powerup.cpu.price_per_us(60)', async function () {
        const powerup = await resources_eos.v1.powerup.get_state()
        const sample = await resources_eos.getSampledUsage()
        const price = powerup.cpu.price_per_ms(sample, 60, this.testFixture)
        assert.equal(price, 0.012)
    })
    test('powerup.cpu.price_per_us(1000)', async function () {
        const powerup = await resources_eos.v1.powerup.get_state()
        const sample = await resources_eos.getSampledUsage()

        const price_us = powerup.cpu.price_per_us(sample, 1000, this.testFixture)
        const price_ms = powerup.cpu.price_per_ms(sample, 1, this.testFixture)

        assert.equal(price_us, price_ms)
        assert.equal(price_us, 0.0002)
    })
    test('powerup.cpu.price_per_ms(1)', async function () {
        const powerup = await resources_eos.v1.powerup.get_state()
        const sample = await resources_eos.getSampledUsage()

        const price = powerup.cpu.price_per_ms(sample, 1, this.testFixture)
        assert.equal(price, 0.0002)

        const asset = Asset.from(price, '4,EOS')
        assert.equal(String(asset), '0.0002 EOS')
        assert.equal(asset.value, 0.0002)
        assert.equal(Number(asset.units), 2)
    })
    test('powerup.cpu.price_per_ms(1000)', async function () {
        const powerup = await resources_eos.v1.powerup.get_state()
        const sample = await resources_eos.getSampledUsage()

        const price = powerup.cpu.price_per_ms(sample, 1000, this.testFixture)
        assert.equal(price, 0.1999)

        const asset = Asset.from(price, '4,EOS')
        assert.equal(String(asset), '0.1999 EOS')
        assert.equal(asset.value, 0.1999)
        assert.equal(Number(asset.units), 1999)
    })
    test('powerup.cpu.determine_adjusted_utilization', async function () {
        const powerup = await resources_eos.v1.powerup.get_state()

        // Fixture has utilization < adjusted_utilization, so the value decays over time
        const utilization_ts = Number(powerup.cpu.utilization_timestamp.value)
        const decay_secs = Number(powerup.cpu.decay_secs)

        // At one decay constant, the gap of 5871642335 has decayed by a factor of e
        const one_decay = powerup.cpu.determine_adjusted_utilization({
            timestamp: utilization_ts + decay_secs,
        })
        assert.equal(
            one_decay.equals(23126085607985),
            true,
            `got ${one_decay} instead of 23126085607985`
        )

        // At ten decay constants, almost all of the gap is gone
        const ten_decays = powerup.cpu.determine_adjusted_utilization({
            timestamp: utilization_ts + decay_secs * 10,
        })
        assert.equal(
            ten_decays.equals(23123925818057),
            true,
            `got ${ten_decays} instead of 23123925818057`
        )
    })
    test('powerup.cpu.frac()', async function () {
        const powerup = await resources_eos.v1.powerup.get_state()
        const sample = await resources_eos.getSampledUsage()

        const frac1 = powerup.cpu.frac(sample, 100)
        assert.equal(frac1.equals(2899435), true, `got ${frac1} instead of 2899435`)

        const frac1000 = powerup.cpu.frac(sample, 1000000)
        assert.equal(frac1000.equals(28994373800), true, `got ${frac1000} instead of 28994373800`)
    })
})

suite('[eos] powerup - net calculations', function () {
    this.slow(200)
    setup(async function () {
        const info = await resources_eos.api.v1.chain.get_info()
        this.testFixture = Object.assign({}, defaultFixture, {
            virtual_block_cpu_limit: info.virtual_block_cpu_limit,
            virtual_block_net_limit: info.virtual_block_net_limit,
        })
    })
    test('powerup.net.allocated', async function () {
        const powerup = await resources_eos.v1.powerup.get_state()

        assert.equal(powerup.net.allocated, 0.99)
        // 99% represented as float
    })
    test('powerup.net.reserved', async function () {
        const powerup = await resources_eos.v1.powerup.get_state()

        assert.equal(
            powerup.net.reserved.equals(0.004102226924904269),
            true,
            `got ${powerup.net.reserved} instead of 0.004102226924904269`
        )
        // 0.4102226924904269% represented as float
    })
    test('powerup.net.price_per_kb(1000000000000)', async function () {
        const powerup = await resources_eos.v1.powerup.get_state()
        const sample = await resources_eos.getSampledUsage()

        const price = powerup.net.price_per_kb(sample, 1000, this.testFixture)
        assert.equal(price, 0.0001)

        const asset = Asset.from(price, '4,EOS')
        assert.equal(String(asset), '0.0001 EOS')
        assert.equal(asset.value, 0.0001)
        assert.equal(Number(asset.units), 1)
    })
    test('powerup.net.frac()', async function () {
        const powerup = await resources_eos.v1.powerup.get_state()
        const sample = await resources_eos.getSampledUsage()

        const frac1000 = powerup.net.frac(sample, 1000000)
        assert.equal(frac1000.equals(5532558), true, `got ${frac1000} instead of 5556098`)
    })
})

suite('[jungle] powerup - cpu calculations', function () {
    this.slow(200)
    setup(async function () {
        const info = await resources_jungle.api.v1.chain.get_info()
        this.testFixture = Object.assign({}, defaultFixture, {
            virtual_block_cpu_limit: info.virtual_block_cpu_limit,
            virtual_block_net_limit: info.virtual_block_net_limit,
        })
    })
    test('powerup.cpu.allocated', async function () {
        const powerup = await resources_jungle.v1.powerup.get_state()

        assert.equal(powerup.cpu.allocated, 0.99)
        // 99% represented as float
    })
    test('powerup.cpu.reserved', async function () {
        const powerup = await resources_jungle.v1.powerup.get_state()

        assert.equal(powerup.cpu.reserved.equals(0.022093458117636362), true)
        // 0.032428358627099564% represented as float
    })
    test('powerup.cpu.price_per_us(1000000)', async function () {
        const powerup = await resources_jungle.v1.powerup.get_state()
        const sample = await resources_eos.getSampledUsage()

        const price_us = powerup.cpu.price_per_us(sample, 1000000, this.testFixture)
        const price_ms = powerup.cpu.price_per_ms(sample, 1000, this.testFixture)
        assert.equal(price_us, price_ms)
        assert.equal(price_ms, 3.384)
    })
    test('powerup.cpu.price_per_ms(1000)', async function () {
        const powerup = await resources_jungle.v1.powerup.get_state()
        const sample = await resources_eos.getSampledUsage()

        const price = powerup.cpu.price_per_ms(sample, 1000, this.testFixture)
        assert.equal(price, 3.384)

        const asset = Asset.from(price, '4,EOS')
        assert.equal(String(asset), '3.3840 EOS')
        assert.equal(asset.value, 3.384)
        assert.equal(Number(asset.units), 33840)
    })
    test('powerup.cpu.price_per_ms(1000000)', async function () {
        const powerup = await resources_jungle.v1.powerup.get_state()
        const sample = await resources_eos.getSampledUsage()

        const price = powerup.cpu.price_per_ms(sample, 1000000, this.testFixture)
        assert.equal(price, 3814.2618)

        const asset = Asset.from(price, '4,EOS')
        assert.equal(String(asset), '3814.2618 EOS')
        assert.equal(asset.value, 3814.2618)
        assert.equal(Number(asset.units), 38142618)
    })
})

suite('[wax] powerup - cpu calculations', function () {
    this.slow(200)
    setup(async function () {
        const info = await resources_wax.api.v1.chain.get_info()
        this.testFixture = Object.assign({}, defaultFixture, {
            virtual_block_cpu_limit: info.virtual_block_cpu_limit,
            virtual_block_net_limit: info.virtual_block_net_limit,
        })
    })
    test('powerup.cpu.allocated', async function () {
        const powerup = await resources_wax.v1.powerup.get_state()

        assert.equal(powerup.cpu.allocated, 0.99)
    })
    test('powerup.cpu.reserved', async function () {
        const powerup = await resources_wax.v1.powerup.get_state()

        assert.equal(powerup.cpu.reserved.equals(0.1147547419042913), true)
    })
    test('powerup.cpu.price_per_us(1000000)', async function () {
        const powerup = await resources_wax.v1.powerup.get_state()
        const sample = await resources_wax.getSampledUsage()

        const price_us = powerup.cpu.price_per_us(sample, 1000000, this.testFixture)
        const price_ms = powerup.cpu.price_per_ms(sample, 1000, this.testFixture)
        assert.equal(price_us, price_ms)
        assert.equal(price_ms, 1.58622407)
    })
    test('powerup.cpu.price_per_ms(1000)', async function () {
        const powerup = await resources_wax.v1.powerup.get_state()
        const sample = await resources_wax.getSampledUsage()

        const price = powerup.cpu.price_per_ms(sample, 1000, this.testFixture)
        assert.equal(price, 1.58622407)

        const asset = Asset.from(price, '8,WAX')
        assert.equal(String(asset), '1.58622407 WAX')
        assert.equal(asset.value, 1.58622407)
        assert.equal(Number(asset.units), 158622407)
    })
    test('powerup.cpu.price_per_ms(1000000)', async function () {
        const powerup = await resources_wax.v1.powerup.get_state()
        const sample = await resources_wax.getSampledUsage()

        const price = powerup.cpu.price_per_ms(sample, 1000000, this.testFixture)
        assert.equal(price, 1790.00486874)

        const asset = Asset.from(price, '8,WAX')
        assert.equal(String(asset), '1790.00486874 WAX')
        assert.equal(asset.value, 1790.00486874)
        assert.equal(Number(asset.units), 179000486874)
    })
})

suite('[wax] powerup - net calculations', function () {
    this.slow(200)
    setup(async function () {
        const info = await resources_wax.api.v1.chain.get_info()
        this.testFixture = Object.assign({}, defaultFixture, {
            virtual_block_cpu_limit: info.virtual_block_cpu_limit,
            virtual_block_net_limit: info.virtual_block_net_limit,
        })
    })
    test('powerup.net.allocated', async function () {
        const powerup = await resources_wax.v1.powerup.get_state()

        assert.equal(powerup.net.allocated, 0.99)
    })
    test('powerup.net.reserved', async function () {
        const powerup = await resources_wax.v1.powerup.get_state()

        assert.equal(powerup.net.reserved.equals(0.00006380031736302496), true)
    })
    test('powerup.net.price_per_kb(1000000000000)', async function () {
        const powerup = await resources_wax.v1.powerup.get_state()
        const sample = await resources_wax.getSampledUsage()

        const price = powerup.net.price_per_kb(sample, 1000, this.testFixture)
        assert.equal(price, 0.00013289)

        const asset = Asset.from(price, '8,WAX')
        assert.equal(String(asset), '0.00013289 WAX')
        assert.equal(asset.value, 0.00013289)
        assert.equal(Number(asset.units), 13289)
    })
    test('powerup.net.frac()', async function () {
        const powerup = await resources_wax.v1.powerup.get_state()
        const sample = await resources_wax.getSampledUsage()

        const frac1000 = powerup.net.frac(sample, 1000000)
        assert.equal(frac1000.equals(6926405), true, `got ${frac1000} instead of 6926405`)
    })
})
