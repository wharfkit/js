import {
    AbstractTransactPlugin,
    Cancelable,
    ChainDefinition,
    Checksum256Type,
    PromptResponse,
    SigningRequest,
    TransactContext,
    TransactHookTypes,
    TransactResult,
} from '@wharfkit/session'

export class TransactPluginExplorerLink extends AbstractTransactPlugin {
    register(context: TransactContext): void {
        context.addHook(
            TransactHookTypes.afterBroadcast,
            async (
                request: SigningRequest,
                context: TransactContext,
                result: TransactResult | undefined
            ) => {
                if (context.ui) {
                    // Ensure we have the data to build the link
                    if (!result) {
                        throw new Error('Unable to generate explorer link, no result.')
                    }
                    if (!result.chain) {
                        throw new Error('Unable to generate explorer link, no chain definition.')
                    }
                    if (!result.chain) {
                        throw new Error(
                            'Unable to generate explorer link, chain definition doesnt defined an explorer.'
                        )
                    }
                    if (!result.resolved) {
                        throw new Error(
                            'Unable to generate explorer link, no resolved transaction.'
                        )
                    }
                    // Update the status bar
                    context.ui.status('Transaction Complete')
                    // Prompt the user with the link to view the transaction
                    const prompt: Cancelable<PromptResponse> = context.ui.prompt({
                        title: 'Transaction Complete',
                        body: 'Click the button below to view the transaction in a block explorer.',
                        elements: [
                            {
                                type: 'link',
                                data: {
                                    button: true,
                                    label: 'Visit Explorer',
                                    href: this.getExplorerLink(
                                        result.chain,
                                        result.resolved.transaction.id
                                    ),
                                },
                            },
                            {
                                type: 'close',
                                label: 'Visit Explorer',
                            },
                        ],
                    })
                    return prompt.then(async () => {
                        return new Promise((r) => r()) as Promise<void>
                    })
                }
            }
        )
    }
    getExplorerLink(chain: ChainDefinition, transaction: Checksum256Type): string {
        if (!chain.explorer) {
            throw new Error('Unable to generate explorer link, no explorer defined.')
        }
        return chain.explorer?.url(String(transaction))
    }
}
