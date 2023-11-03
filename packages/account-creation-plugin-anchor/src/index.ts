import {
    AbstractAccountCreationPlugin,
    AccountCreationPlugin,
    AccountCreationPluginConfig,
    chainIdsToIndices,
    Chains,
    CreateAccountContext,
    CreateAccountResponse,
} from '@wharfkit/session'
import {AccountCreationPluginMetadata} from '@wharfkit/session'
import {AccountCreator} from './account-creator'

interface AccountCreationPluginWhalesplainerConfig extends AccountCreationPluginConfig {
    serviceUrl?: string
}

export class AccountCreationPluginWhalesplainer extends AbstractAccountCreationPlugin implements AccountCreationPlugin {
    readonly config: AccountCreationPluginWhalesplainerConfig
    constructor(options?: AccountCreationPluginWhalesplainerConfig) {
        super()

        this.config = {
            serviceUrl: options?.serviceUrl,
            requiresChainSelect: options?.requiresChainSelect || true,
            supportedChains: options?.supportedChains || [Chains.EOS, Chains.Telos, Chains.WAX, Chains.FIO],
        }
    }
    /**
     * The metadata for the wallet plugin to be displayed in the user interface.
     */
    readonly metadata: AccountCreationPluginMetadata = AccountCreationPluginMetadata.from({
        name: 'Account Creation Plugin Whalesplainer',
        description: 'Create accounts through Whalesplainer!',
        logo: 'base_64_encoded_image',
        homepage: 'https://someplace.com',
    })
    /**
     * A unique string identifier for this wallet plugin.
     *
     * It's recommended this is all lower case, no spaces, and only URL-friendly special characters (dashes, underscores, etc)
     */
    get id(): string {
        return 'account-plugin'
    }

    /**
     * The name of the wallet plugin to be displayed in the user interface.
     */
    get name(): string {
        return 'Account Creation Plugin'
    }

    /**
     * Performs the account creationg logic required to create the account.
     *
     * @param options CreateAccountContext
     * @returns Promise<CreateAccountResponse>
     */
    async create(context: CreateAccountContext): Promise<CreateAccountResponse> {
        console.log({context})
        const accountCreator = new AccountCreator({
            supportedChains: context.chain
                ? [context.chain.id]
                : (context.chains || this.config.supportedChains || []).map((chain) => chain.id),
            scope: 'wallet',
        })

        // Open a popup window prompting the user to create an account.
        const {error: errorMessage, cid, sa} = await accountCreator.createAccount()

        if (errorMessage) {
            const error = new Error(errorMessage)
            context.ui.onError(error)

            throw error
        }

        if (!cid) {
            const error = new Error('No chain ID was returned by the account creation service.')
            context.ui.onError(error)

            throw error
        }

        const chainIndex = chainIdsToIndices.get(String(cid))

        if (!chainIndex) {
            const error = new Error(
                `The chain ID "${cid}" is not supported by this account creation plugin.`
            )
            context.ui.onError(error)

            throw error
        }

        return {
            chain: Chains[chainIndex],
            accountName: sa,
        }
    }
}
