<script lang="ts">
    import type {ChainDefinition} from '@wharfkit/common'
    import type {UserInterfaceLoginResponse} from '@wharfkit/session'
    import Header from '../components/Header.svelte'
    import SelectCard from '../components/SelectCard.svelte'
    import Spinner from '../components/Spinner.svelte'
    import AccountEntry from '../components/login/AccountEntry.svelte'
    import ChainSelect from '../components/login/ChainSelect.svelte'
    import PermissionChoice from '../components/login/PermissionChoice.svelte'
    import PermissionSelect from '../components/login/PermissionSelect.svelte'
    import {uiState} from '../stores/state.svelte.js'
    import {themeState} from '../stores/theme.svelte.js'
    import {logoSource} from '../../lib/logo.js'
    import type {LoginStep, LookupFailure} from '../../lib/login-steps.js'
    import {resolveLoginStep} from '../../lib/login-steps.js'

    interface Props {
        onclose?: () => void
        oncomplete?: (response: UserInterfaceLoginResponse) => void
    }

    let {onclose, oncomplete}: Props = $props()

    let walletPluginIndex = $state<number | undefined>(undefined)
    let selectedChain = $state<ChainDefinition | undefined>(undefined)
    let accountInput = $state('')
    let enteredAccount = $state<string | undefined>(undefined)
    let lookupFailure = $state<{kind: LookupFailure; account: string} | undefined>(undefined)
    let selectedPermission = $state<string | undefined>(undefined)
    let completed = false
    let seeded = false

    let context = $derived(uiState.loginContext)
    let wallets = $derived(context?.walletPlugins ?? [])
    let walletPlugin = $derived(
        walletPluginIndex === undefined ? undefined : wallets[walletPluginIndex]
    )

    // The kit only folds a plugin's config into uiRequirements when it can predetermine the plugin.
    let requirements = $derived({
        ...(context?.uiRequirements ?? {
            requiresChainSelect: false,
            requiresPermissionSelect: false,
            requiresPermissionEntry: false,
            requiresWalletSelect: true,
        }),
        ...(walletPlugin?.config ?? {}),
    })

    let availableChains = $derived.by(() => {
        const all = context?.chains ?? []
        const supported = walletPlugin?.config.supportedChains
        if (!supported || supported.length === 0) return all
        return all.filter((chain) => supported.includes(String(chain.id)))
    })

    let chain = $derived.by(() => {
        if (selectedChain) return selectedChain
        if (context?.chain) return context.chain
        if (availableChains.length === 1) return availableChains[0]
        return undefined
    })

    let permissionLevel = $derived(
        selectedPermission ??
            (context?.permissionLevel ? String(context.permissionLevel) : undefined)
    )

    let step = $derived<LoginStep>(
        resolveLoginStep({
            hasContext: Boolean(context),
            walletCount: wallets.length,
            hasWallet: walletPluginIndex !== undefined,
            chainCount: availableChains.length,
            hasChain: Boolean(chain),
            hasAccount: Boolean(enteredAccount),
            hasPermission: Boolean(permissionLevel),
            requirements,
        })
    )

    let title = $derived.by(() => {
        switch (step) {
            case 'chain':
                return 'Select a blockchain'
            case 'permission-select':
                return 'Select an account'
            case 'account-entry':
                return 'Enter your account'
            case 'permission-choice':
                return 'Select a permission'
            default:
                return uiState.appName ? `Connect to ${uiState.appName}` : 'Connect Wallet'
        }
    })

    let subtitle = $derived.by(() => {
        switch (step) {
            case 'chain':
                return `Choose the blockchain to use with ${walletPlugin?.metadata?.name ?? 'this wallet'}`
            case 'permission-select':
                return 'These accounts can be signed for by this wallet'
            case 'account-entry':
                return 'Name the account this wallet signs for'
            case 'permission-choice':
                return `Choose the permission on ${enteredAccount} to sign with`
            case 'done':
                return 'Continue in your wallet'
            default:
                return 'Select a wallet to continue'
        }
    })

    // Both messages open on a literal word: wuchale skips script strings that start with a value.
    let lookupMessage = $derived.by(() => {
        if (!lookupFailure || !chain) return ''
        if (lookupFailure.kind === 'not-found') {
            return `No account named ${lookupFailure.account} exists on ${chain.name}. Check the spelling and try again.`
        }
        return `Could not reach ${chain.name}, so the name ${lookupFailure.account} was not checked. Try again.`
    })

    let origin = $derived(typeof window !== 'undefined' ? window.location.host : '')

    // A wallet chosen by the kit is already reflected on the context, so start past the wallet step.
    $effect(() => {
        if (seeded || !context) return
        seeded = true
        if (context.walletPluginIndex !== undefined) {
            walletPluginIndex = context.walletPluginIndex
        }
    })

    $effect(() => {
        if (step !== 'done' || completed || walletPluginIndex === undefined) return
        completed = true
        const response: UserInterfaceLoginResponse = {walletPluginIndex}
        if (chain) response.chainId = chain.id
        if (permissionLevel) response.permissionLevel = permissionLevel
        oncomplete?.(response)
    })

    // Back from the permission choice keeps the typed name so only the permission gets re-picked.
    function back() {
        if (step === 'permission-choice') {
            enteredAccount = undefined
            return
        }
        walletPluginIndex = undefined
        selectedChain = undefined
        accountInput = ''
        enteredAccount = undefined
        lookupFailure = undefined
        selectedPermission = undefined
    }

    function submitAccount(account: string) {
        lookupFailure = undefined
        enteredAccount = account
    }

    // A failed lookup is not its own step: it returns to the entry with the name kept for editing.
    function reportLookupFailure(kind: LookupFailure) {
        lookupFailure = {kind, account: enteredAccount ?? accountInput}
        enteredAccount = undefined
    }

    let onback = $derived.by(() => {
        if (step === 'permission-choice') return back
        if (step === 'loading' || step === 'wallet' || step === 'done') return undefined
        return wallets.length > 1 ? back : undefined
    })
</script>

<Header {title} {subtitle} {onback} {onclose} />

{#if step === 'loading' || step === 'done'}
    <div class="loading">
        <Spinner />
        <p>{step === 'done' ? 'Waiting for your wallet…' : 'Loading wallets…'}</p>
    </div>
{:else if step === 'wallet'}
    <div class="wallet-list">
        {#each wallets as wallet, i}
            <SelectCard
                label={wallet.metadata?.name ?? `Wallet ${i + 1}`}
                logo={logoSource(wallet.metadata?.logo, themeState.resolved())}
                onclick={() => (walletPluginIndex = i)}
            />
        {/each}
    </div>
{:else if step === 'chain'}
    <ChainSelect chains={availableChains} onselect={(value) => (selectedChain = value)} />
{:else if step === 'permission-select' && context && chain && walletPlugin}
    <PermissionSelect
        {context}
        {chain}
        {walletPlugin}
        onselect={(value) => (selectedPermission = value)}
    />
{:else if step === 'account-entry'}
    <AccountEntry bind:value={accountInput} error={lookupMessage} onsubmit={submitAccount} />
{:else if step === 'permission-choice' && context && enteredAccount}
    <PermissionChoice
        {context}
        {chain}
        account={enteredAccount}
        onselect={(value) => (selectedPermission = value)}
        onfail={reportLookupFailure}
    />
{/if}

{#if origin}
    <p class="origin">Requested by {origin}</p>
{/if}

<style>
    .wallet-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        padding: 40px 0;
    }

    .loading p {
        margin: 0;
        font-size: 14px;
        color: var(--web-ui-text-secondary);
        font-family: var(--web-ui-font);
    }

    .origin {
        margin: 14px 0 0;
        text-align: center;
        font-size: 12px;
        color: var(--web-ui-text-secondary);
        font-family: var(--web-ui-font);
    }
</style>
