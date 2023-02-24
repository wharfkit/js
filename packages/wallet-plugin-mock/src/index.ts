import {
    AbstractWalletPlugin,
    Checksum256,
    LoginContext,
    PermissionLevel,
    Signature,
    WalletPlugin,
    WalletPluginConfig,
    WalletPluginLoginResponse,
    WalletPluginMetadata,
    WalletPluginSignResponse,
} from '@wharfkit/session'

interface WalletPluginMockOptions {
    config?: WalletPluginConfig
    data?: Record<string, any>
    metadata?: WalletPluginMetadata
    loginResponse?: WalletPluginLoginResponse
    signResponse?: WalletPluginSignResponse
}

export class WalletPluginMock extends AbstractWalletPlugin implements WalletPlugin {
    /**
     * The logic configuration for the wallet plugin.
     */
    readonly config: WalletPluginConfig = {
        // Should the user interface display a chain selector?
        requiresChainSelect: false,

        // Should the user interface display a permission selector?
        requiresPermissionSelect: false,

        // Optionally specify if this plugin only works with specific blockchains.
        // supportedChains: ['73e4385a2708e6d7048834fbc1079f2fabb17b3c125b146af438971e90716c4d']
    }

    /**
     * The metadata for the wallet plugin to be displayed in the user interface.
     */
    readonly metadata: WalletPluginMetadata = {
        name: 'Mock Wallet',
        description: '',
        logo: 'base_64_encoded_image',
        homepage: 'https://github.com/wharfkit/wallet-plugin-mock',
        download: 'https://github.com/wharfkit/wallet-plugin-mock',
    }

    /**
     * A mock WalletPluginLoginResponse to be returned by the login method.
     */
    public loginResponse: WalletPluginLoginResponse = {
        chain: Checksum256.from('73e4385a2708e6d7048834fbc1079f2fabb17b3c125b146af438971e90716c4d'),
        permissionLevel: PermissionLevel.from('wharfkittest@test'),
    }

    /**
     * A mock WalletPluginSignResponse to be returned by the sign method.
     */
    public signResponse: WalletPluginSignResponse = {
        signatures: [
            Signature.from(
                'SIG_K1_KfqBXGdSRnVgZbAXyL9hEYbAvrZjcaxUCenD7Z3aX6yzf6MEyc4Cy3ywToD4j3SKkzSg7L1uvRUirEPHwAwrbg5c9z27Z3'
            ),
        ],
    }

    /**
     * A constructor for the mock wallet that's capable of overriding most of the default values.
     *
     * @param options WalletPluginMockOptions
     */
    constructor(options?: WalletPluginMockOptions) {
        super()
        if (options) {
            if (options.config) {
                this.config = options.config
            }
            if (options.metadata) {
                this.metadata = options.metadata
            }
            if (options.data) {
                this._data = options.data
            }
            if (options.loginResponse) {
                this.loginResponse = options.loginResponse
            }
            if (options.signResponse) {
                this.signResponse = options.signResponse
            }
        }
    }

    /**
     * A unique string identifier for this wallet plugin.
     *
     * It's recommended this is all lower case, no spaces, and only URL-friendly special characters (dashes, underscores, etc)
     */
    get id(): string {
        return 'wallet-plugin-mock'
    }

    /**
     * Performs the wallet logic required to login and return the chain and permission level to use.
     *
     * @param options WalletPluginLoginOptions
     * @returns Promise<WalletPluginLoginResponse>
     */
    async login(context: LoginContext): Promise<WalletPluginLoginResponse> {
        const response = {...this.loginResponse}
        if (context.chain) {
            response.chain = context.chain.id
        }
        if (context.permissionLevel) {
            response.permissionLevel = context.permissionLevel
        }
        return response
    }

    /**
     * Performs the wallet logic required to sign a transaction and return the signature.
     *
     * @param chain ChainDefinition
     * @param resolved ResolvedSigningRequest
     * @returns Promise<Signature>
     */
    async sign(): Promise<WalletPluginSignResponse> {
        return this.signResponse
    }
}
