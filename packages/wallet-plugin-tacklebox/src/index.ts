import {
    AbstractWalletPlugin,
    CallbackPayload,
    Cancelable,
    Checksum256,
    LoginContext,
    PermissionLevel,
    PrivateKey,
    PromptElement,
    PromptResponse,
    PublicKey,
    ResolvedSigningRequest,
    Serializer,
    SigningRequest,
    TransactContext,
    WalletPluginConfig,
    WalletPluginLoginResponse,
    WalletPluginMetadata,
    WalletPluginSignResponse,
} from '@wharfkit/session'
import {
    createIdentityRequest,
    extractSignaturesFromCallback,
    isCallback,
    isKnownMobile,
    LinkInfo,
    sealMessage,
    setTransactionCallback,
    verifyLoginCallbackResponse,
    waitForCallback,
} from '@wharfkit/protocol-esr'
import {send} from '@greymass/buoy'
import WebSocket from 'isomorphic-ws'

import defaultTranslations from './translations'
import {tackleboxLogo} from './logo'
import {applyModalTheme} from './theme'

/** Options for the TackleBox wallet plugin. */
export interface WalletPluginTackleBoxOptions {
    /**
     * Buoy callback-forwarder service used for this dapp's callbacks.
     *
     * TackleBox's own listening channel is announced by the wallet at login
     * (`link_ch`) and does not depend on this value.
     */
    buoyUrl?: string
    /** WebSocket constructor override forwarded to buoy callback handling. */
    buoyWs?: WebSocket
    /**
     * Skip firing the `tacklebox:` deep link that opens the wallet app
     * automatically on login and manual signing. The prompt always keeps the
     * launch link, QR code and copy fallbacks.
     */
    disableAutoLaunch?: boolean
}

/** Default buoy service, shared with the rest of the anchor-link ecosystem. */
export const DEFAULT_BUOY_URL = 'https://cb.anchor.link'

/**
 * A @wharfkit/session WalletPlugin for TackleBox, the native wallet and block
 * explorer for Antelope blockchains (https://github.com/on-a-t-break/tacklebox).
 *
 * TackleBox speaks the anchor-link protocol. Logging in fires a `tacklebox:`
 * deep link that opens the wallet with the ESR identity request (with QR code
 * and copy-paste fallbacks in the prompt); TackleBox answers over a buoy
 * callback and opens a sealed push channel. Transactions are then pushed
 * straight into the wallet, which raises its own window for review - every
 * request still passes TackleBox's whitelist guard and signing review.
 */
export class WalletPluginTackleBox extends AbstractWalletPlugin {
    buoyUrl: string
    buoyWs: WebSocket | undefined
    autoLaunch: boolean

    /**
     * The unique identifier for the wallet plugin.
     */
    get id(): string {
        return 'tacklebox'
    }

    /**
     * The translations for this plugin.
     */
    translations = defaultTranslations

    constructor(options?: WalletPluginTackleBoxOptions) {
        super()
        this.buoyUrl = options?.buoyUrl || DEFAULT_BUOY_URL
        this.buoyWs = options?.buoyWs || WebSocket
        this.autoLaunch = !options?.disableAutoLaunch
    }

    /**
     * The logic configuration for the wallet plugin.
     */
    readonly config: WalletPluginConfig = {
        // TackleBox resolves the chain from the request (or asks the user),
        // so the UI never needs a chain selector.
        requiresChainSelect: false,
        // The user picks the account inside TackleBox.
        requiresPermissionSelect: false,
    }

    /**
     * The metadata for the wallet plugin to be displayed in the user interface.
     */
    readonly metadata: WalletPluginMetadata = WalletPluginMetadata.from({
        name: 'TackleBox',
        description: 'A native wallet and block explorer for Antelope blockchains.',
        logo: tackleboxLogo,
        homepage: 'https://github.com/on-a-t-break/tacklebox',
        download: 'https://github.com/on-a-t-break/tacklebox/releases',
    })

    login(context: LoginContext): Promise<WalletPluginLoginResponse> {
        return this.handleLogin(context)
    }

    private async handleLogin(context: LoginContext): Promise<WalletPluginLoginResponse> {
        if (!context.ui) {
            throw new Error('The TackleBox wallet plugin requires a UI to be present.')
        }

        const t = context.ui.getTranslate(this.id)
        const revertTheme = applyModalTheme(context.ui)

        try {
            const {callback, request, sameDeviceRequest, requestKey, privateKey} =
                await createIdentityRequest(context, this.buoyUrl)

            const encodedRequest = request.encode(true, true, 'esr:')
            const launchUrl = tackleboxDeepLink(sameDeviceRequest)

            const prompt = (copied: boolean) => {
                const elements: PromptElement[] = [
                    {
                        type: 'link',
                        label: t('login.launch', {default: 'Launch TackleBox'}),
                        data: {
                            href: launchUrl,
                            label: t('login.launch', {default: 'Launch TackleBox'}),
                            variant: 'primary',
                        },
                    },
                    {
                        type: 'button',
                        label: t('login.copy', {default: 'Copy login request'}),
                        data: {
                            label: t('login.copy', {default: 'Copy login request'}),
                            onClick: () => {
                                copyToClipboard(encodedRequest).then(
                                    (ok) => ok && !copied && prompt(true)
                                )
                            },
                        },
                    },
                ]

                // The QR code only helps when this device is not the one
                // running the wallet - hide it on known-mobile dapp devices.
                if (!onMobileDevice()) {
                    elements.unshift({
                        type: 'qr',
                        data: encodedRequest,
                    })
                }

                const promptPromise = context.ui!.prompt({
                    title: t('login.title', {default: 'Connect with TackleBox'}),
                    body: copied
                        ? t('login.copied', {
                              default:
                                  'Request copied. In TackleBox, open Contracts → ESR → CONNECT AS LOGIN and paste it to continue.',
                          })
                        : t('login.body', {
                              default:
                                  'TackleBox should open with this login request - approve the connection there. If nothing opens, launch it with the button, copy the request into TackleBox (Contracts → ESR → CONNECT AS LOGIN), or scan the QR code.',
                          }),
                    elements,
                })
                // The modal closing is handled by the session kit; swallow the rejection.
                promptPromise.catch(() => undefined)
            }

            prompt(false)

            // Open the wallet directly with the request, anchor-style.
            if (this.autoLaunch) {
                openDeepLink(launchUrl)
            }

            const callbackResponse: CallbackPayload = await waitForCallback(
                callback,
                this.buoyWs,
                t
            )

            verifyLoginCallbackResponse(callbackResponse, context)

            if (!callbackResponse.cid || !callbackResponse.sa || !callbackResponse.sp) {
                throw new Error(
                    t('error.invalid_response', {
                        default:
                            'Invalid response from TackleBox, it must contain the cid, sa and sp fields.',
                    })
                )
            }

            // TackleBox always opens a push channel on login; store it so
            // transact requests can be pushed straight into the wallet.
            if (
                callbackResponse.link_ch &&
                callbackResponse.link_key &&
                callbackResponse.link_name
            ) {
                this.data.requestKey = requestKey
                this.data.privateKey = privateKey
                this.data.signerKey = PublicKey.from(callbackResponse.link_key)
                this.data.channelUrl = callbackResponse.link_ch
                this.data.channelName = callbackResponse.link_name
            }

            const resolvedResponse = await ResolvedSigningRequest.fromPayload(
                callbackResponse,
                context.esrOptions
            )

            return {
                chain: Checksum256.from(callbackResponse.cid),
                permissionLevel: PermissionLevel.from({
                    actor: callbackResponse.sa,
                    permission: callbackResponse.sp,
                }),
                identityProof: resolvedResponse.getIdentityProof(callbackResponse.sig),
            }
        } finally {
            revertTheme()
        }
    }

    sign(
        resolved: ResolvedSigningRequest,
        context: TransactContext
    ): Promise<WalletPluginSignResponse> {
        return this.handleSign(resolved, context)
    }

    private async handleSign(
        resolved: ResolvedSigningRequest,
        context: TransactContext
    ): Promise<WalletPluginSignResponse> {
        if (!context.ui) {
            throw new Error('The TackleBox wallet plugin requires a UI to be present.')
        }

        const t = context.ui.getTranslate(this.id)
        const revertTheme = applyModalTheme(context.ui)

        const expiration = resolved.transaction.expiration.toDate()
        const expiresIn = Math.max(0, expiration.getTime() - Date.now())

        // Re-create the request through the session so the wallet resolves it
        // against fresh TAPOS values, and tag it with its expiration.
        const modifiedRequest = await context.createRequest({transaction: resolved.transaction})
        modifiedRequest.setInfoKey('link', LinkInfo.from({expiration}))

        const callback = setTransactionCallback(modifiedRequest, this.buoyUrl)
        const encodedRequest = modifiedRequest.encode(true, true, 'esr:')
        const launchUrl = tackleboxDeepLink(modifiedRequest)

        // Track every prompt shown for this signature so the first one the
        // user dismisses cancels the flow, whichever variant is on screen.
        const prompts: Cancelable<PromptResponse>[] = []
        let onPromptSettled: (p: Cancelable<PromptResponse>) => void = () => undefined
        const promptSettled = new Promise<PromptResponse>((resolve, reject) => {
            onPromptSettled = (p) => {
                prompts.push(p)
                p.then(resolve, reject)
            }
        })

        const countdown: PromptElement = {
            type: 'countdown',
            data: {
                label: t('transact.await', {default: 'Waiting for TackleBox'}),
                end: expiration.toISOString(),
            },
        }

        const launchElement: PromptElement = {
            type: 'link',
            label: t('transact.launch', {default: 'Open TackleBox'}),
            data: {
                href: launchUrl,
                label: t('transact.launch', {default: 'Open TackleBox'}),
            },
        }

        const promptManual = (copied: boolean) => {
            const elements: PromptElement[] = [
                launchElement,
                {
                    type: 'button',
                    label: t('transact.copy', {default: 'Copy signing request'}),
                    data: {
                        label: t('transact.copy', {default: 'Copy signing request'}),
                        onClick: () => {
                            copyToClipboard(encodedRequest).then(
                                (ok) => ok && !copied && promptManual(true)
                            )
                        },
                    },
                },
                countdown,
            ]
            if (!onMobileDevice()) {
                elements.unshift({
                    type: 'qr',
                    data: encodedRequest,
                })
            }
            onPromptSettled(
                context.ui!.prompt({
                    title: t('transact.title_manual', {default: 'Sign with TackleBox'}),
                    body: copied
                        ? t('transact.copied', {
                              default:
                                  'Request copied. In TackleBox, open Contracts → ESR and paste it to continue.',
                          })
                        : t('transact.body_manual', {
                              default:
                                  'TackleBox should open with this signing request. If nothing opens, launch it with the button, copy the request into TackleBox (Contracts → ESR), or scan the QR code.',
                          }),
                    elements,
                })
            )
        }

        try {
            if (this.data.channelUrl) {
                onPromptSettled(
                    context.ui.prompt({
                        title: t('transact.title', {default: 'Sign with TackleBox'}),
                        body: t('transact.body', {
                            channelName: this.data.channelName,
                            default: `Review and approve this transaction in TackleBox ("${this.data.channelName}").`,
                        }),
                        elements: [
                            countdown,
                            launchElement,
                            {
                                type: 'button',
                                label: t('transact.manual', {default: 'Sign manually instead'}),
                                data: {
                                    label: t('transact.manual', {
                                        default: 'Sign manually instead',
                                    }),
                                    onClick: () => promptManual(false),
                                },
                            },
                        ],
                    })
                )
            } else {
                promptManual(false)
                // No push channel: open the wallet directly with the request.
                if (this.autoLaunch) {
                    openDeepLink(launchUrl)
                }
            }

            // Timeouts above 2^31-1ms fire immediately; clamp far-future expiries.
            const timer = setTimeout(() => {
                prompts.forEach((p) =>
                    p.cancel(
                        t('error.expired', {default: 'The request expired, please try again.'})
                    )
                )
            }, Math.min(expiresIn, 0x7fffffff))

            const callbackPromise = waitForCallback(callback, this.buoyWs, t)

            if (this.data.channelUrl) {
                // Seal the request to the wallet's session key and push it
                // into TackleBox over its buoy channel; the wallet raises its
                // own window when the request arrives.
                const service = new URL(this.data.channelUrl).origin
                const channel = new URL(this.data.channelUrl).pathname.substring(1)
                const sealedMessage = await sealMessage(
                    encodedRequest,
                    PrivateKey.from(this.data.privateKey),
                    PublicKey.from(this.data.signerKey)
                )
                send(Serializer.encode({object: sealedMessage}).array, {service, channel})
            }

            const callbackResponse = await Promise.race([callbackPromise, promptSettled]).finally(
                () => {
                    clearTimeout(timer)
                    prompts.forEach((p) => p.cancel())
                }
            )

            if (
                isCallback(callbackResponse) &&
                extractSignaturesFromCallback(callbackResponse).length
            ) {
                const resolvedRequest = await ResolvedSigningRequest.fromPayload(
                    callbackResponse,
                    context.esrOptions
                )
                return {
                    signatures: extractSignaturesFromCallback(callbackResponse),
                    resolved: resolvedRequest,
                }
            }

            throw new Error(t('error.not_completed', {default: 'The request was not completed.'}))
        } finally {
            revertTheme()
        }
    }
}

/**
 * The `tacklebox:` deep link that opens the wallet app with a signing request.
 *
 * TackleBox registers the `tacklebox:` scheme (and claims `esr:` only when no
 * other wallet has it), so plugin-fired links use its own scheme - on machines
 * where Anchor owns `esr:`, a plain esr link would open the wrong wallet. The
 * payload is the request body without the scheme, which the wallet turns back
 * into an `esr://` URI.
 */
export function tackleboxDeepLink(request: SigningRequest): string {
    const encoded = request.encode(true, false, 'esr:')
    return `tacklebox://request/${encoded.slice('esr:'.length)}`
}

function openDeepLink(url: string) {
    try {
        if (typeof window !== 'undefined' && window.location) {
            window.location.href = url
        }
    } catch (error) {
        // Leaving the prompt's launch link as the way in.
    }
}

/**
 * Whether the dapp is running on a known mobile device (where a QR code is of
 * no use). protocol-esr's isKnownMobile assumes a browser environment, so
 * guard it for SSR and node.
 */
function onMobileDevice(): boolean {
    return typeof navigator !== 'undefined' && isKnownMobile()
}

/**
 * Best-effort clipboard write; resolves true when the text was copied.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            await navigator.clipboard.writeText(text)
            return true
        }
    } catch (error) {
        // Permission denied or insecure context; try the legacy path below.
    }
    try {
        if (typeof document !== 'undefined' && document.body) {
            const element = document.createElement('textarea')
            element.value = text
            element.setAttribute('readonly', '')
            element.style.position = 'absolute'
            element.style.left = '-9999px'
            document.body.appendChild(element)
            element.select()
            const copied = document.execCommand('copy')
            document.body.removeChild(element)
            return copied
        }
    } catch (error) {
        // Nothing else to fall back to.
    }
    return false
}

export {applyModalTheme, tackleboxModalStyles} from './theme'
