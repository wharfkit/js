import {Checksum256, Name, Struct} from '@wharfkit/antelope'
import {SerializedSession, Session, SessionType} from './session'

/**
 * A serialized session encoded as an Antelope struct, for transport through a
 * URL parameter or a message payload.
 */
@Struct.type('url_encoded_session')
export class URLEncodedSession extends Struct {
    @Struct.field(Checksum256) declare chain: Checksum256
    @Struct.field(Name) declare actor: Name
    @Struct.field(Name) declare permission: Name
    @Struct.field('string') declare walletPlugin: string
    @Struct.field('string', {optional: true}) declare data?: string

    static fromSession(data: SessionType): URLEncodedSession {
        const session = data instanceof Session ? data.serialize() : data
        return new URLEncodedSession({
            chain: session.chain,
            actor: session.actor,
            permission: session.permission,
            walletPlugin: JSON.stringify(session.walletPlugin),
            data: JSON.stringify(session.data),
        })
    }

    get serialized(): SerializedSession {
        return {
            chain: this.chain,
            actor: this.actor,
            permission: this.permission,
            walletPlugin: JSON.parse(this.walletPlugin),
            data: this.data ? JSON.parse(this.data) : undefined,
        }
    }
}
