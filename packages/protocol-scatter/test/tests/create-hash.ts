import {assert} from 'chai'

import createHash from '$lib/create-hash'

const VECTORS: [string, string][] = [
    ['', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'],
    ['abc', 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'],
    ['ünïcødé ✓ 漢字', '6e7be13c677639cb50e8f6fa7b1d007152b2f0b29a4e580e694192ed844017b6'],
    ['x'.repeat(5000), 'c59d3c0480cc2d71d8f646e735e92da65450311eec46e81a5db8c7e6e8a92054'],
]

suite('create-hash shim', function () {
    test('matches the published sha256 vectors', function () {
        for (const [input, expected] of VECTORS) {
            assert.equal(createHash('sha256').update(input).digest('hex'), expected)
        }
    })

    test('update chains and accumulates', function () {
        const chained = createHash('sha256').update('foo').update('bar').digest('hex')
        assert.equal(chained, createHash('sha256').update('foobar').digest('hex'))
    })

    test('rejects the surface it does not implement', function () {
        assert.throws(() => createHash('sha512'), /unsupported algorithm/)
        assert.throws(() => createHash('sha256').update(new Uint8Array(1) as any), /only string/)
        assert.throws(
            () => createHash('sha256').update('x').digest('base64'),
            /unsupported encoding/
        )
    })
})
