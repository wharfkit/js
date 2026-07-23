<script lang="ts">
    import Header from '../components/Header.svelte'
    import WalletCard from '../components/WalletCard.svelte'
    import Spinner from '../components/Spinner.svelte'
    import {uiState} from '../stores/state.svelte.js'
    import {themeState} from '../stores/theme.svelte.js'

    interface Props {
        onclose?: () => void
        onselect?: (index: number) => void
    }

    let {onclose, onselect}: Props = $props()

    let wallets = $derived(uiState.loginContext?.walletPlugins ?? [])
    let title = $derived(uiState.appName ? `Connect to ${uiState.appName}` : 'Connect Wallet')
    let origin = $derived(typeof window !== 'undefined' ? window.location.host : '')

    function walletLogo(metadata: {logo?: unknown} | undefined): string | undefined {
        const logo = metadata?.logo as
            | {getVariant?: (v: 'light' | 'dark') => string | undefined}
            | undefined
        if (!logo) return undefined
        const variant = themeState.resolved()
        const opposite = variant === 'dark' ? 'light' : 'dark'
        return logo.getVariant?.(variant) ?? logo.getVariant?.(opposite) ?? String(logo)
    }
</script>

<Header {title} subtitle="Select a wallet to continue" {onclose} />

{#if wallets.length === 0}
    <div class="loading">
        <Spinner />
        <p>Loading wallets...</p>
    </div>
{:else}
    <div class="wallet-list">
        {#each wallets as wallet, i}
            <WalletCard
                name={wallet.metadata?.name ?? `Wallet ${i + 1}`}
                logo={walletLogo(wallet.metadata)}
                onclick={() => onselect?.(i)}
            />
        {/each}
    </div>
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
