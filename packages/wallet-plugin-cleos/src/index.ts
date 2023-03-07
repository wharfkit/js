import {
    AbstractWalletPlugin,
    LoginContext,
    WalletPlugin,
    WalletPluginConfig,
    WalletPluginLoginResponse,
    WalletPluginMetadata,
    WalletPluginSignResponse,
} from '@wharfkit/session'

export class WalletPluginCleos extends AbstractWalletPlugin implements WalletPlugin {
    /**
     * The logic configuration for the wallet plugin.
     */
    readonly config: WalletPluginConfig = {
        // Should the user interface display a chain selector?
        requiresChainSelect: true,

        // Should the user interface display a permission selector?
        requiresPermissionSelect: false,
    }
    /**
     * The metadata for the wallet plugin to be displayed in the user interface.
     */
    readonly metadata: WalletPluginMetadata = {
        name: 'Wallet Plugin Template',
        description: 'Copy and paste the transactions to sign in cleos.',
        logo: 'base_64_encoded_image',
        homepage: 'https://github.com/antelopeio/leap',
        download: 'https://github.com/antelopeio/leap',
    }
    /**
     * A unique string identifier for this wallet plugin.
     *
     * It's recommended this is all lower case, no spaces, and only URL-friendly special characters (dashes, underscores, etc)
     */
    get id(): string {
        return 'wallet-plugin-cleos'
    }
    /**
     * Performs the wallet logic required to login and return the chain and permission level to use.
     *
     * @param options WalletPluginLoginOptions
     * @returns Promise<WalletPluginLoginResponse>
     */
    async login(context: LoginContext): Promise<WalletPluginLoginResponse> {
        if (!context.chain) {
            throw new Error('The cleos wallet plugin requires a chain to be selected.')
        }
        if (!context.permissionLevel) {
            throw new Error('The cleos wallet plugin requires a permissionLevel to be specified.')
        }
        return {
            chain: context.chain.id,
            permissionLevel: context.permissionLevel,
        }
    }
    /**
     * Performs the wallet logic required to sign a transaction and return the signature.
     *
     * @param chain ChainDefinition
     * @param resolved ResolvedSigningRequest
     * @returns Promise<Signature>
     */
    async sign(): Promise<WalletPluginSignResponse> {
        return {
            signatures: [],
        }
    }
}
