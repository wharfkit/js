import {
    ABIDef,
    AbstractWalletPlugin,
    ActionType,
    LoginContext,
    ResolvedSigningRequest,
    Serializer,
    TransactContext,
    TransactHookTypes,
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

        // Should the user interface require input for the permission?
        requiresPermissionEntry: true,
    }
    /**
     * The metadata for the wallet plugin to be displayed in the user interface.
     */
    readonly metadata: WalletPluginMetadata = {
        name: 'cleos',
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
    async sign(
        resolved: ResolvedSigningRequest,
        context: TransactContext
    ): Promise<WalletPluginSignResponse> {
        if (!context.ui) {
            throw new Error('The cleos wallet plugin requires a UI to be provided.')
        }
        // During the signing process, add a hook to display the cleos command to the user
        context.addHook(TransactHookTypes.afterSign, async () => {
            // Decode the transaction to be human readable
            const actions: ActionType[] = []
            for (const action of resolved.transaction.actions) {
                const abi: ABIDef = await context.abiProvider.getAbi(action.account)
                actions.push({
                    ...action,
                    data: Serializer.objectify(action.decodeData(abi)),
                })
            }
            const decoded = {
                ...resolved.transaction,
                actions,
            }
            // Create the cleos command that will be used to sign the transaction
            const command = `cleos -u ${context.chain.url} push transaction '${JSON.stringify(
                decoded,
                null,
                4
            )}'`
            // Prompt the user with the command to sign the transaction
            await context.ui?.prompt({
                title: 'Sign with cleos',
                body: 'Copy the command to sign the transaction using cleos.',
                elements: [
                    {
                        type: 'textarea',
                        data: {
                            content: command,
                        },
                    },
                    {
                        type: 'button',
                        data: {
                            label: 'Copy to clipboard',
                            onclick: () => navigator.clipboard.writeText(command),
                        },
                    },
                ],
            })
        })
        // Return no signatures, as the cleos command will be used to sign the transaction
        return {
            signatures: [],
        }
    }
}
