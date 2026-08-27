import {
    AbstractUserInterface,
    cancelable,
    Cancelable,
    Checksum256,
    LocaleDefinitions,
    LoginContext,
    LoginOptions,
    PermissionLevel,
    PromptArgs,
    PromptResponse,
    UserInterface,
    UserInterfaceAccountCreationResponse,
    UserInterfaceLoginResponse,
} from '@wharfkit/session'

export class UserInterfaceTEMPLATE extends AbstractUserInterface implements UserInterface {
    /* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

    /** Collect the chain, permission level, and wallet plugin index a login call needs. */
    async login(context: LoginContext): Promise<UserInterfaceLoginResponse> {
        return {
            chainId: context.chain?.id ?? Checksum256.from(context.chains[0].id),
            permissionLevel: context.permissionLevel ?? PermissionLevel.from('teamgreymass@active'),
            walletPluginIndex: 0,
        }
    }

    /** An error has occurred. Present it to the user. */
    async onError(error: Error): Promise<void> {}

    /** An account creation call has started. Return the chain and plugin the user picked. */
    async onAccountCreate(): Promise<UserInterfaceAccountCreationResponse> {
        return {}
    }

    /** The account creation call has finished. Tear down any account creation UI. */
    async onAccountCreateComplete(): Promise<void> {}

    /** A login call has started. Prepare any UI the login flow needs. */
    async onLogin(options?: LoginOptions): Promise<void> {}

    /** The login call has finished. Tear down any login UI. */
    async onLoginComplete(): Promise<void> {}

    /** A transact call has started. Prepare any UI the transact flow needs. */
    async onTransact(): Promise<void> {}

    /** The transact call has finished. Tear down any transact UI. */
    async onTransactComplete(): Promise<void> {}

    /** The transact call has reached the signing step. */
    async onSign(): Promise<void> {}

    /** Signing has finished. */
    async onSignComplete(): Promise<void> {}

    /** The transact call has reached the broadcast step. */
    async onBroadcast(): Promise<void> {}

    /** Broadcasting has finished. */
    async onBroadcastComplete(): Promise<void> {}

    /** Render the prompt in `args` and resolve with the user's choice; the second `cancelable` argument runs on abort. */
    prompt(args: PromptArgs): Cancelable<PromptResponse> {
        return cancelable(
            new Promise<PromptResponse>(() => {
                // Render the PromptElements in `args`, then resolve or reject.
            }),
            (canceled) => {
                throw canceled
            }
        )
    }

    /** A plugin has pushed a text-only status message. Surface it however suits the UI. */
    status(message: string): void {}

    /** Merge localization strings supplied by a plugin into the UI's own definitions. */
    addTranslations(definitions: LocaleDefinitions): void {}
}
