import {assert} from 'chai'
import {Checksum256, PrivateKey, UInt64} from '@wharfkit/antelope'
import {
    createIV,
    createSymmetricKey,
    encryptMessage,
    sealedMessagePayload,
    sealMessage,
    unsealMessage,
} from '../../src/index'

suite('utils', function () {
    test('sealMessage', function () {
        const from = PrivateKey.generate('K1')
        const to = PrivateKey.generate('K1').toPublic()
        const nonce = UInt64.from(1234567890)
        const message = 'Hello, World!'

        const sealedMessage = sealMessage(message, from, to, nonce)
        assert.notEqual(sealedMessage.toString('hex'), message)
        assert.isTrue(sealedMessage.length > 0)
        assert.match(sealedMessage.toString('hex'), /^[0-9a-f]+$/)
        assert.equal(sealedMessage.length % 16, 0)
    })

    test('unsealMessage', function () {
        const from = PrivateKey.generate('K1')
        const to = PrivateKey.generate('K1')
        const nonce = UInt64.from(1234567890)
        const message = 'Hello, World!'

        const sealedMessage = sealMessage(message, from, to.toPublic(), nonce)
        const unsealedMessage = unsealMessage(sealedMessage, to, from.toPublic(), nonce)
        assert.equal(unsealedMessage, message)
    })

    suite('shared secret with a leading zero byte', function () {
        // ECDH x-coordinate of this pair starts with 0x00
        const from = PrivateKey.from('5KZJED2ubZVe7L5Xw7u7sb6pktpaoT69rxGRjQT6PKrDRzp9Gu8')
        const to = PrivateKey.from('5Ke897mHoFzE1mTSk4j8KCxrsSRyzQZCqYPGv1rahh39XVpqcTL')
        const nonce = UInt64.from(1234567890)
        const message = 'Hello, World!'

        test('seals with the stripped derivation', function () {
            const payload = sealedMessagePayload(message, from, to.toPublic(), nonce)
            assert.equal(payload.ciphertext.hexString, '51686e0c16836c4d30b8bb0938e4cfe5')
            assert.equal(Number(payload.checksum), 3865664645)
            assert.equal(String(payload.from), String(from.toPublic()))
        })

        test('differs from the 32-byte derivation', function () {
            const secret = from.sharedSecret(to.toPublic())
            const iv = createIV(nonce, secret)
            const ciphertext = encryptMessage(iv, createSymmetricKey(secret, nonce), message)
            const checksum = new DataView(Checksum256.hash(iv.array).array.buffer).getUint32(
                0,
                true
            )
            const payload = sealedMessagePayload(message, from, to.toPublic(), nonce)
            assert.notEqual(payload.ciphertext.hexString, ciphertext.hexString)
            assert.notEqual(Number(payload.checksum), checksum)
        })

        test('unseals the stripped derivation', function () {
            const payload = sealedMessagePayload(message, from, to.toPublic(), nonce)
            assert.equal(unsealMessage(payload.ciphertext, to, payload.from, nonce), message)
        })
    })
})
