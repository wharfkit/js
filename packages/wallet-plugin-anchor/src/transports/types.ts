import type {send} from '@greymass/buoy'
import {PrivateKey, PublicKey} from '@wharfkit/antelope'
import type {generateReturnUrl, waitForCallback} from '@wharfkit/protocol-esr'
import {UserInterfaceTranslateFunction} from '@wharfkit/session'
import {SigningRequest} from '@wharfkit/signing-request'
import WebSocket from 'isomorphic-ws'

/** The translation helper returned by `context.ui.getTranslate(pluginId)`. */
export type Translator = UserInterfaceTranslateFunction

/** The output of a single `createIdentityRequest` call. */
export interface IdentityRequestBundle {
    callback: any
    request: SigningRequest
    sameDeviceRequest: SigningRequest
    requestKey: PublicKey
    privateKey: PrivateKey
}

/** Everything a transport needs from the plugin that owns it. */
export interface TransportOptions {
    id: string
    /** The plugin's persisted storage — shared by reference across transports. */
    data: Record<string, any>
    buoyUrl: string
    buoyWs?: WebSocket
    // Overridable so tests can substitute them; ESM namespaces cannot be stubbed in place.
    send?: typeof send
    waitForCallback?: typeof waitForCallback
    generateReturnUrl?: typeof generateReturnUrl
}

/** An offer to move this login to the other Anchor transport. */
export interface WebFallback {
    /** Render the offer with the first prompt rather than only after `delayMs`. */
    immediate?: boolean
    delayMs: number
    /** Called synchronously inside the button's click handler. */
    onSelect: () => void
}
