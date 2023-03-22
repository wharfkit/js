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

import defaultTranslations from './translations'

export class TransactPluginExplorerLink extends AbstractTransactPlugin {
    id = 'transact-plugin-explorer-link'
    translations = defaultTranslations
    register(context: TransactContext): void {
        context.addHook(
            TransactHookTypes.afterBroadcast,
            async (
                request: SigningRequest,
                context: TransactContext,
                result: TransactResult | undefined
            ) => {
                if (context.ui) {
                    // Retrieve translation helper from the UI, passing the app ID
                    const t = context.ui.getTranslate(this.id)

                    // Ensure we have the data to build the link
                    if (!result) {
                        throw new Error(
                            t('no-result', {
                                default: 'Unable to generate explorer link, no result.',
                            })
                        )
                    }

                    // Ensure we have a chain defined to base a link off
                    if (!result.chain) {
                        throw new Error(
                            t('no-chain', {
                                default: 'Unable to generate explorer link, no chain definition.',
                            })
                        )
                    }

                    // Ensure the chain has an explorer defined on it
                    if (!result.chain.explorer) {
                        throw new Error(
                            t('no-explorer', {
                                default:
                                    'Unable to generate explorer link, chain definition doesnt defined an explorer.',
                            })
                        )
                    }

                    // Ensure we have a resolved transaction
                    if (!result.resolved) {
                        throw new Error(
                            t('no-resolved', {
                                default:
                                    'Unable to generate explorer link, no resolved transaction.',
                            })
                        )
                    }

                    // Update the status bar
                    context.ui.status(t('complete', {default: 'Transaction Complete'}))

                    // Prompt the user with the link to view the transaction
                    const prompt: Cancelable<PromptResponse> = context.ui.prompt({
                        title: t('complete', {
                            default: 'Transaction Complete',
                        }),
                        body: t('click', {
                            default:
                                'Click the button below to view the transaction in a block explorer.',
                        }),
                        elements: [
                            {
                                type: 'link',
                                data: {
                                    button: true,
                                    label: t('visit', {
                                        default: 'Visit Explorer',
                                    }),
                                    href: this.getExplorerLink(
                                        context,
                                        result.chain,
                                        result.resolved.transaction.id
                                    ),
                                },
                            },
                            {
                                type: 'close',
                            },
                        ],
                    })

                    // Return a dummy promise to block progress
                    return prompt.then(async () => {
                        return new Promise((r) => r()) as Promise<void>
                    })
                }
            }
        )
    }
    getExplorerLink(
        context: TransactContext,
        chain: ChainDefinition,
        transaction: Checksum256Type
    ): string {
        if (!context.ui) {
            throw new Error('Unable to generate explorer link, no ui.')
        }
        if (!chain.explorer) {
            // Retrieve translation helper from the UI, passing the app ID
            const t = context.ui.getTranslate(this.id)
            throw new Error(
                t('no-explorer', {
                    default:
                        'Unable to generate explorer link, chain definition doesnt defined an explorer.',
                })
            )
        }
        return chain.explorer?.url(String(transaction))
    }
}
