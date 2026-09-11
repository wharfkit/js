import {assert} from 'chai'
import {createHash as nodeCreateHash} from 'node:crypto'

import createHash from '$lib/create-hash'

const VECTORS: [string, string][] = [
    ['', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'],
    ['abc', 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'],
]

suite('create-hash shim', function () {
    test('matches the published sha256 vectors', function () {
        for (const [input, expected] of VECTORS) {
            assert.equal(createHash('sha256').update(input).digest('hex'), expected)
        }
    })

    test('matches node:crypto on the inputs scatter-ts hashes', function () {
        const inputs = [
            '',
            'appkey:8f3a0c1d',
            'hello world',
            'ünïcødé ✓ 漢字',
            'x'.repeat(5000),
            String(Date.now()),
        ]
        for (const input of inputs) {
            const expected = nodeCreateHash('sha256')
                .update(Buffer.from(input, 'utf8'))
                .digest('hex')
            assert.equal(
                createHash('sha256').update(input).digest('hex'),
                expected,
                input.slice(0, 32)
            )
        }
    })

    test('update chains and accumulates', function () {
        const chained = createHash('sha256').update('foo').update('bar').digest('hex')
        assert.equal(chained, createHash('sha256').update('foobar').digest('hex'))
    })

    test('rejects the surface it does not implement', function () {
        assert.throws(() => createHash('sha512'), /unsupported algorithm/)
        assert.throws(() => createHash('sha256').update(Buffer.from('x') as any), /only string/)
        assert.throws(
            () => createHash('sha256').update('x').digest('base64'),
            /unsupported encoding/
        )
    })
})
