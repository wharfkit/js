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

export class AccountCreationPluginWhalesplainer
    extends AbstractAccountCreationPlugin
    implements AccountCreationPlugin
{
    /**
     * The logic configuration for the wallet plugin.
     */
    readonly config: AccountCreationPluginConfig = {
        // Should the user interface display a chain selector?
        requiresChainSelect: true,

        // Optionally specify if this plugin only works with specific blockchains.
        // supportedChains: ['73e4385a2708e6d7048834fbc1079f2fabb17b3c125b146af438971e90716c4d']
    }
    /**
     * The metadata for the wallet plugin to be displayed in the user interface.
     */
    readonly metadata: AccountCreationPluginMetadata = AccountCreationPluginMetadata.from({
        name: 'Account Creation Plugin Template',
        description: 'A template that can be used to build account creation plugins!',
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
        const accountCreator = new AccountCreator({
            supportedChains: context.chain
                ? [context.chain.id]
                : context.chains.map((chain) => chain.id),
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
