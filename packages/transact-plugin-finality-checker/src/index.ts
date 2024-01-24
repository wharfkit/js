import {
    API,
    AbstractTransactPlugin,
    Checksum256,
    TransactContext,
    TransactHookResponseType,
    TransactHookTypes,
    TransactResult,
    Transaction,
} from '@wharfkit/session'

/** Import JSON localization strings */
import defaultTranslations from './translations.json'

const START_CHECKING_FINALITY_AFTER = 180000 // 3 minutes

interface TransactPluginFinalityCheckerOptions {
    logging?: boolean
}

export class TransactPluginFinalityChecker extends AbstractTransactPlugin {
    logging: boolean

    /** A unique ID for this plugin */
    id = 'transact-plugin-finality-checker'

    /** Optional - The translation strings to use for the plugin */
    translations = defaultTranslations

    constructor({
        logging,
    }: TransactPluginFinalityCheckerOptions = {}) {
        super()

        this.logging = logging || false
    }

    /**
     * Register the hooks required for this plugin to function
     *
     * @param context The TransactContext of the transaction being performed
     */
    register(context: TransactContext): void {
        // Register any desired afterBroadcast hooks
        context.addHook(
            TransactHookTypes.afterBroadcast,
            (
                result: TransactResult,
                context: TransactContext
            ): Promise<TransactHookResponseType> => {
                if (!context.ui) {
                    throw new Error('UI not available')
                }

                const {resolved} = result

                const t = context.ui.getTranslate(this.id)

                if (!resolved) {
                    throw Error(
                        t('resolved_request_not_returned', {
                            default:
                                'Resolved Request not returned on afterBroadcast hook. This value is needed for the Finality Callback plugin to work.',
                        })
                    )
                }

                const expectedFinalityTime = new Date(
                    Date.now() + START_CHECKING_FINALITY_AFTER
                )

                // Prompt the user with the link to view the transaction
                context.ui.prompt({
                    title: t('reversible.title', {
                        default: 'Transaction is not yet final',
                    }),
                    body: t('reversible.body', {
                        default:
                            'Your transaction has been broadcasted to the network, but is still reversible.',
                    }),
                    elements: [
                        {
                            type: 'countdown',
                            data: {
                                label: t('reversible.countdown-label', {
                                    default: 'Finality expected in:',
                                }),
                                end: expectedFinalityTime.toISOString(),
                            },
                        },
                    ],
                })

                return new Promise(resolve => {
                    setTimeout(async () => {
                        this.log('Checking transaction finality')
                        waitForFinality(resolved.transaction.id, context)
                            .then(() => {
                                this.log('Transaction finality reached')
                                context.ui?.prompt({
                                    title: t('title-final', {
                                        default: 'Transaction is final',
                                    }),
                                    body: t('body-final', {
                                        default:
                                            'Your transaction has been broadcasted to the network and is now irrevirsible.',
                                    }),
                                    elements: [
                                        {
                                            type: 'close',
                                        },
                                    ],
                                })
                            })
                            .catch((error) => {
                                this.log('Error while checking transaction finality', error)
                            })
                    }, START_CHECKING_FINALITY_AFTER)
                })
            }
        )
    }

    log(...args: any[]) {
        if (!this.logging) {
            return
        }
        // eslint-disable-next-line no-console
        console.log('TransactPluginFinalityChecker, LOG:', ...args)
    }
}

let retries = 0

async function waitForFinality(
    transactionId: Checksum256,
    context: TransactContext
): Promise<API.v1.GetTransactionStatusResponse> {
    return new Promise((resolve, reject) => {
        context.client.v1.chain
            .get_transaction_status(transactionId)
            .then((response) => {
                if (response.state === 'IRREVERSIBLE') {
                    return resolve(response)
                }

                setTimeout(() => {
                    waitForFinality(transactionId, context).then(resolve).catch(reject)
                }, 5000)
            })
            .catch((error) => {
                if (error.response && error.response.status === 404 && retries < 3) {
                    retries++

                    setTimeout(() => {
                        waitForFinality(transactionId, context).then(resolve).catch(reject)
                    }, 5000)
                } else if (error.response.status === 500) {
                    reject(
                        `This API node cannot be used with the finality checker plugin. Full Error: ${error}`
                    )
                } else {
                    reject(error)
                }
            })
    })
}
