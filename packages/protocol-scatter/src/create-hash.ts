import {Bytes, Checksum256} from '@wharfkit/antelope'

// Aliased over the `create-hash` package when scatter-ts is bundled: its one sha256 call site
// otherwise drags in cipher-base and readable-stream, which require the `stream` and `events`
// Node builtins and break bundlers targeting runtimes without them.
export default function createHash(algorithm: string) {
    if (algorithm !== 'sha256') {
        throw new Error(`create-hash shim: unsupported algorithm '${algorithm}'`)
    }
    let buffer = ''
    const hash = {
        update(data: string) {
            if (typeof data !== 'string') {
                throw new Error('create-hash shim: only string input is supported')
            }
            buffer += data
            return hash
        },
        digest(encoding: string) {
            if (encoding !== 'hex') {
                throw new Error(`create-hash shim: unsupported encoding '${encoding}'`)
            }
            return Checksum256.hash(Bytes.fromString(buffer, 'utf8')).hexString
        },
    }
    return hash
}
