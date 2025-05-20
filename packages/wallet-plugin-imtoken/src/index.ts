import {
    AbstractWalletPlugin,
    LoginContext,
    LogoutContext,
    ResolvedSigningRequest,
    TransactContext,
    WalletPlugin,
    WalletPluginConfig,
    WalletPluginMetadata,
} from '@wharfkit/session'

export class WalletPluginIMToken extends AbstractWalletPlugin implements WalletPlugin {
    id = 'imtoken'

    translations = {}

    /**
     * The logic configuration for the wallet plugin.
     */
    readonly config: WalletPluginConfig = {
        // Should the user interface display a chain selector?
        requiresChainSelect: true,

        // Should the user interface display a permission selector?
        requiresPermissionSelect: false,
    }

    constructor() {
        super()
    }

    private async loadScatterProtocol() {
        let protocolScatter
        if (typeof window !== 'undefined') {
            protocolScatter = await import('@wharfkit/protocol-scatter')
        }

        if (!protocolScatter) {
            throw new Error('Scatter protocol is not available in this environment')
        }

        return protocolScatter
    }

    /**
     * The metadata for the wallet plugin to be displayed in the user interface.
     */
    readonly metadata: WalletPluginMetadata = WalletPluginMetadata.from({
        name: 'imToken',
        description: '',
        logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTMiIGhlaWdodD0iOTMiIHZpZXdCb3g9IjAgMCA5MyA5MyIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzIwMzVfMzk1KSI+CjxtYXNrIGlkPSJtYXNrMF8yMDM1XzM5NSIgc3R5bGU9Im1hc2stdHlwZTpsdW1pbmFuY2UiIG1hc2tVbml0cz0idXNlclNwYWNlT25Vc2UiIHg9IjAiIHk9IjAiIHdpZHRoPSI5MyIgaGVpZ2h0PSI5MyI+CjxwYXRoIGQ9Ik05MyAwSDBWOTNIOTNWMFoiIGZpbGw9IndoaXRlIi8+CjwvbWFzaz4KPGcgbWFzaz0idXJsKCNtYXNrMF8yMDM1XzM5NSkiPgo8bWFzayBpZD0ibWFzazFfMjAzNV8zOTUiIHN0eWxlPSJtYXNrLXR5cGU6bHVtaW5hbmNlIiBtYXNrVW5pdHM9InVzZXJTcGFjZU9uVXNlIiB4PSIwIiB5PSIwIiB3aWR0aD0iOTMiIGhlaWdodD0iOTMiPgo8cGF0aCBkPSJNOTIuODc2OCAwSDAuMDU4MTA1NVY5M0g5Mi44NzY4VjBaIiBmaWxsPSJ3aGl0ZSIvPgo8L21hc2s+CjxnIG1hc2s9InVybCgjbWFzazFfMjAzNV8zOTUpIj4KPHBhdGggZD0iTTcyLjEwNSAwSDIwLjk4MjJDOS40NjgyMiAwIDAuMTM0Mjc3IDkuMzUyMTkgMC4xMzQyNzcgMjAuODg4N1Y3Mi4xMTEzQzAuMTM0Mjc3IDgzLjY0NzkgOS40NjgyMiA5MyAyMC45ODIyIDkzSDcyLjEwNUM4My42MTkxIDkzIDkyLjk1MyA4My42NDc5IDkyLjk1MyA3Mi4xMTEzVjIwLjg4ODdDOTIuOTUzIDkuMzUyMTkgODMuNjE5MSAwIDcyLjEwNSAwWiIgZmlsbD0idXJsKCNwYWludDBfbGluZWFyXzIwMzVfMzk1KSIvPgo8cGF0aCBkPSJNNzUuNjc1MyAyOC43NTI0Qzc3LjYwNTYgNTQuOTQ3OSA2MC44IDY3LjMyOTEgNDUuNzM0MSA2OC42NDk0QzMxLjcyNzQgNjkuODc2OCAxOC41NDMgNjEuMjUzNCAxNy4zODYzIDQ4LjAwNDFDMTYuNDMyMiAzNy4wNTgxIDIzLjE4NDMgMzIuMzk3OSAyOC40ODkzIDMxLjkzMzVDMzMuOTQ1NCAzMS40NTQxIDM4LjUzMDcgMzUuMjI0MyAzOC45Mjg1IDM5Ljc4OTFDMzkuMzExNSA0NC4xNzc3IDM2LjU3ODQgNDYuMTc1NCAzNC42Nzc3IDQ2LjM0MTZDMzMuMTc0NCA0Ni40NzM2IDMxLjI4MzIgNDUuNTU5MyAzMS4xMTI1IDQzLjU5NTlDMzAuOTY2IDQxLjkwODggMzEuNjA1NCA0MS42NzkxIDMxLjQ0OTEgMzkuODg2OEMzMS4xNzEgMzYuNjk2MSAyOC4zOTQxIDM2LjMyNDUgMjYuODczOCAzNi40NTY1QzI1LjAzMzkgMzYuNjE4IDIxLjY5NTcgMzguNzY5NSAyMi4xNjQyIDQ0LjEyODhDMjIuNjM1MiA0OS41MzQ2IDI3LjgwODMgNTMuODA2MSAzNC41ODk3IDUzLjIxMkM0MS45MDc5IDUyLjU3MTMgNDcuMDAzIDQ2Ljg2MjQgNDcuMzg2MiAzOC44NTUxQzQ3LjM4MjYgMzguNDMxIDQ3LjQ3MTggMzguMDExMiA0Ny42NDczIDM3LjYyNTJMNDcuNjQ5NiAzNy42MTU2QzQ3LjcyODUgMzcuNDQ3NyA0Ny44MjA4IDM3LjI4NjYgNDcuOTI1NCAzNy4xMzM5QzQ4LjA4MTYgMzYuODk5MiA0OC4yODE4IDM2LjY0IDQ4LjU0MDMgMzYuMzU2M0M0OC41NDI4IDM2LjM0OSA0OC41NDI4IDM2LjM0OSA0OC41NDc3IDM2LjM0OUM0OC43MzU1IDM2LjEzNjMgNDguOTYyNSAzNS45MDY1IDQ5LjIxODcgMzUuNjU5NUM1Mi40MTU1IDMyLjYzNzUgNjMuOTI4MiAyNS41MTA1IDc0LjgxNjMgMjcuNzY3MkM3NS4wNDY2IDI3LjgxNjYgNzUuMjU0NSAyNy45MzkyIDc1LjQwOTMgMjguMTE2OUM3NS41NjQxIDI4LjI5NDUgNzUuNjU3MyAyOC41MTc0IDc1LjY3NTMgMjguNzUyNFoiIGZpbGw9IndoaXRlIi8+CjwvZz4KPC9nPgo8L2c+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXJfMjAzNV8zOTUiIHgxPSI5Mi44OTc1IiB5MT0iMTUuNzE1NCIgeDI9IjMuMjE5OTciIHkyPSI1MC42NTA0IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiMwQ0M1RkYiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMDA3RkZGIi8+CjwvbGluZWFyR3JhZGllbnQ+CjxjbGlwUGF0aCBpZD0iY2xpcDBfMjAzNV8zOTUiPgo8cmVjdCB3aWR0aD0iOTMiIGhlaWdodD0iOTMiIGZpbGw9IndoaXRlIi8+CjwvY2xpcFBhdGg+CjwvZGVmcz4KPC9zdmc+Cg==',
        homepage: 'https://token.im',
        download: 'https://token.im/download',
    })

    /**
     * Performs the wallet logic required to login and return the chain and permission level to use.
     *
     * @param context LogoutContext
     * @returns Promise<WalletPluginLoginResponse>
     */
    async login(context: LoginContext) {
        const protocolScatter = await this.loadScatterProtocol()
        return protocolScatter.handleLogin(context)
    }

    /**
     * Performs the wallet logic required to logout.
     *
     * @param context: LogoutContext
     * @returns Promise<void>
     */

    async logout(context: LogoutContext): Promise<void> {
        const protocolScatter = await this.loadScatterProtocol()
        return protocolScatter.handleLogout(context)
    }

    /**
     * Performs the wallet logic required to sign a transaction and return the signature.
     *
     * @param chain ChainDefinition
     * @param resolved ResolvedSigningRequest
     * @returns Promise<Signature>
     */
    async sign(resolved: ResolvedSigningRequest, context: TransactContext) {
        const protocolScatter = await this.loadScatterProtocol()

        return protocolScatter.handleSignatureRequest(resolved, context)
    }
}
