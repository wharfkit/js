import {mount, unmount} from 'svelte'
import {cancelable} from '@wharfkit/common'
import type {Cancelable, LocaleDefinitions} from '@wharfkit/common'
import type {
    CreateAccountContext,
    LoginContext,
    PromptArgs,
    PromptResponse,
    SessionKeyConflictArgs,
    SessionKeyConflictResponse,
    SessionKeyConsentArgs,
    SessionKeyMismatchArgs,
    SessionKeyMismatchResponse,
    SessionKeyRemoveArgs,
    UserInterface,
    UserInterfaceAccountCreationResponse,
    UserInterfaceLoginResponse,
    UserInterfaceTranslateFunction,
    UserInterfaceTranslateOptions,
} from '@wharfkit/session'

import App from './ui/App.svelte'
import {humanizeError} from './lib/errors.js'
import {uiState} from './ui/stores/state.svelte.js'
import {themeState} from './ui/stores/theme.svelte.js'
import type {WebUIOptions} from './types.js'
import {defaultOptions} from './types.js'
import tokensCSS from './ui/styles/tokens.css?inline'

type Pending<T = unknown> = {
    resolve: (value: T) => void
    reject: (reason?: unknown) => void
    cancelValue?: T
}

export class WebUI implements UserInterface {
    static version = '__ver'

    private options: Required<
        Pick<
            WebUIOptions,
            'theme' | 'closeOnOverlayClick' | 'closeOnEscape' | 'zIndex' | 'logging' | 'minimal'
        >
    > &
        WebUIOptions
    private element: HTMLElement | undefined
    private shadow: ShadowRoot | undefined
    private app: Record<string, any> | undefined
    private initialized = false

    private pending: Pending | null = null
    private hideTimer: ReturnType<typeof setTimeout> | null = null
    private domReadyHandler: (() => void) | null = null

    constructor(options: WebUIOptions = {}) {
        this.options = {...defaultOptions, ...options}

        if (options.theme) themeState.theme = options.theme
        if (options.appearance) themeState.appearance = options.appearance
        if (options.appName) uiState.appName = options.appName
        uiState.minimal = this.options.minimal

        if (typeof document !== 'undefined') {
            this.initialize()
        }
    }

    private initialize() {
        if (this.initialized) return

        this.element = document.createElement('div')
        this.element.id = 'web-ui'
        this.element.style.cssText = `position:fixed;inset:0;z-index:${this.options.zIndex};pointer-events:none;display:none;`

        this.shadow = this.element.attachShadow({mode: 'open'})

        const style = document.createElement('style')
        style.textContent = tokensCSS
        this.shadow.appendChild(style)

        const appTarget = document.createElement('div')
        this.shadow.appendChild(appTarget)

        themeState.applyToHost(this.shadow.host as HTMLElement)

        this.app = mount(App, {
            target: appTarget,
            props: {
                closeOnOverlayClick: this.options.closeOnOverlayClick,
                closeOnEscape: this.options.closeOnEscape,
                oncancel: () => this.handleCancel(),
                onloginselect: (index: number) => this.resolvePending({walletPluginIndex: index}),
                onpromptconfirm: () => this.resolvePending({}, true),
                onskconsentapprove: () => this.resolvePending(true, true),
                onskconflictselect: (choice: SessionKeyConflictResponse) =>
                    this.resolvePending(choice, true),
                onskmismatchselect: (choice: SessionKeyMismatchResponse) =>
                    this.resolvePending(choice, true),
                onskremoveconfirm: () => this.resolvePending(true, true),
                ontransactdone: () => this.handleTransactDone(),
            },
        })

        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            this.appendElement()
        } else {
            this.domReadyHandler = () => this.appendElement()
            document.addEventListener('DOMContentLoaded', this.domReadyHandler)
        }

        this.initialized = true
    }

    private appendElement() {
        if (!this.element) return
        const existing = document.getElementById('web-ui')
        if (existing) existing.remove()
        document.body.appendChild(this.element)
    }

    private clearTimers() {
        if (this.hideTimer !== null) {
            clearTimeout(this.hideTimer)
            this.hideTimer = null
        }
    }

    private handleTransactDone() {
        this.clearTimers()
        this.hide()
        uiState.reset()
    }

    private show() {
        this.clearTimers()
        if (this.element) {
            this.element.style.display = 'block'
            this.element.style.pointerEvents = 'auto'
        }
        uiState.active = true
    }

    private hide() {
        uiState.active = false
        this.hideTimer = setTimeout(() => {
            this.hideTimer = null
            if (this.element) {
                this.element.style.display = 'none'
                this.element.style.pointerEvents = 'none'
            }
        }, 200)
    }

    private log(...args: any[]) {
        if (this.options.logging) {
            // eslint-disable-next-line no-console
            console.log('[WebUI]', ...args)
        }
    }

    private setPending<T>(cancelValue?: T): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            this.pending = {
                resolve: resolve as Pending['resolve'],
                reject: reject as Pending['reject'],
                cancelValue: cancelValue as Pending['cancelValue'],
            }
        })
    }

    private resolvePending<T>(value: T, hide = false) {
        const pending = this.pending
        if (!pending) return
        this.pending = null
        pending.resolve(value as unknown)
        if (hide) this.hide()
    }

    private handleCancel() {
        this.log('User cancelled')
        this.hide()
        const pending = this.pending
        if (!pending) return
        this.pending = null
        if (pending.cancelValue !== undefined) {
            pending.resolve(pending.cancelValue)
        } else {
            pending.reject(new Error('User cancelled'))
        }
    }

    async login(context: LoginContext): Promise<UserInterfaceLoginResponse> {
        this.log('login', context)
        uiState.loginContext = context
        if (context.appName) uiState.appName = context.appName
        uiState.view = 'login'
        this.show()
        const response = await this.setPending<UserInterfaceLoginResponse>()
        if (uiState.minimal) {
            this.hide()
        }
        return response
    }

    async onError(error: Error): Promise<void> {
        this.log('onError', error)
        if (uiState.minimal) {
            this.hide()
            uiState.reset()
            return
        }
        const {message, details} = humanizeError(error)
        uiState.view = 'error'
        uiState.errorMessage = message
        uiState.errorDetails = details
        this.show()
    }

    async onAccountCreate(
        _context: CreateAccountContext
    ): Promise<UserInterfaceAccountCreationResponse> {
        this.log('onAccountCreate')
        return {}
    }

    async onAccountCreateComplete(): Promise<void> {
        this.log('onAccountCreateComplete')
    }

    async onLogin(): Promise<void> {
        this.log('onLogin')
    }

    async onLoginComplete(): Promise<void> {
        this.log('onLoginComplete')
        this.hide()
        uiState.reset()
    }

    async onTransact(): Promise<void> {
        this.log('onTransact')
        if (!uiState.minimal) {
            uiState.view = 'transact'
            uiState.transactStage = 'preparing'
            uiState.transactStartTime = Date.now()
            this.show()
        }
    }

    async onTransactComplete(): Promise<void> {
        this.log('onTransactComplete')
        if (!uiState.minimal) {
            // Non-minimal: hold the success state until the user taps Done.
            uiState.transactStage = 'complete'
        } else {
            this.hide()
            uiState.reset()
        }
    }

    async onSign(): Promise<void> {
        this.log('onSign')
        uiState.transactStage = 'signing'
    }

    async onSignComplete(): Promise<void> {
        this.log('onSignComplete')
        uiState.transactStage = 'signed'
    }

    async onBroadcast(): Promise<void> {
        this.log('onBroadcast')
        uiState.transactStage = 'broadcasting'
    }

    async onBroadcastComplete(): Promise<void> {
        this.log('onBroadcastComplete')
        uiState.transactStage = 'confirming'
    }

    prompt(args: PromptArgs): Cancelable<PromptResponse> {
        this.log('prompt', args)
        // Minimal mode leaves optional prompts to the host app; required ones still render.
        if (!uiState.minimal || !args.optional) {
            uiState.view = 'prompt'
            uiState.promptTitle = args.title || 'Confirm'
            uiState.promptBody = args.body || ''
            uiState.promptElements = args.elements || []
            this.show()
        }

        return cancelable(this.setPending<PromptResponse>(), () => {
            this.handleCancel()
        })
    }

    async onSessionKeyConsent(args: SessionKeyConsentArgs): Promise<boolean> {
        this.log('onSessionKeyConsent', args)
        uiState.view = 'sk-consent'
        uiState.skAppName = args.appName
        uiState.skWhitelist = args.whitelist
        this.show()
        return this.setPending<boolean>(false)
    }

    async onSessionKeyConflict(args: SessionKeyConflictArgs): Promise<SessionKeyConflictResponse> {
        this.log('onSessionKeyConflict', args)
        uiState.view = 'sk-conflict'
        uiState.skAppName = args.appName
        uiState.skExistingKeyCount = args.existingKeyCount
        this.show()
        return this.setPending<SessionKeyConflictResponse>('cancel')
    }

    async onSessionKeyMismatch(args: SessionKeyMismatchArgs): Promise<SessionKeyMismatchResponse> {
        this.log('onSessionKeyMismatch', args)
        uiState.view = 'sk-mismatch'
        uiState.skAppName = args.appName
        uiState.skAdded = args.added
        uiState.skRemoved = args.removed
        this.show()
        return this.setPending<SessionKeyMismatchResponse>('dismiss')
    }

    async onSessionKeyRemove(args: SessionKeyRemoveArgs): Promise<boolean> {
        this.log('onSessionKeyRemove', args)
        uiState.view = 'sk-remove'
        uiState.skAppName = args.appName
        this.show()
        return this.setPending<boolean>(false)
    }

    status(message: string): void {
        this.log('status', message)
    }

    translate(key: string, options?: UserInterfaceTranslateOptions, _namespace?: string): string {
        return options?.default ?? key
    }

    getTranslate(namespace?: string): UserInterfaceTranslateFunction {
        return (key, options) => this.translate(key, options, namespace)
    }

    addTranslations(_translations: LocaleDefinitions): void {
        this.log('addTranslations')
    }

    getMinimal(): boolean {
        return uiState.minimal
    }

    setMinimal(minimal: boolean): void {
        uiState.minimal = minimal
    }

    setSession(accountName: string, chainName: string, chainLogo?: string): void {
        uiState.accountName = accountName
        uiState.chainName = chainName
        uiState.chainLogo = chainLogo ?? ''
    }

    destroy() {
        this.clearTimers()
        if (this.domReadyHandler) {
            document.removeEventListener('DOMContentLoaded', this.domReadyHandler)
            this.domReadyHandler = null
        }
        if (this.pending) {
            this.pending.reject(new Error('WebUI destroyed'))
            this.pending = null
        }
        if (this.app) {
            unmount(this.app)
            this.app = undefined
        }
        if (this.element) {
            this.element.remove()
            this.element = undefined
        }
        this.shadow = undefined
        this.initialized = false
    }
}
