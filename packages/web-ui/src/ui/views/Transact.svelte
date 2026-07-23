<script lang="ts">
    import Header from '../components/Header.svelte'
    import Spinner from '../components/Spinner.svelte'
    import Button from '../components/Button.svelte'
    import {uiState} from '../stores/state.svelte.js'

    interface Props {
        onclose?: () => void
        ondone?: () => void
    }

    let {onclose, ondone}: Props = $props()

    const stageLabels: Record<string, string> = {
        preparing: 'Preparing transaction',
        signing: 'Awaiting signature',
        signed: 'Signed',
        broadcasting: 'Broadcasting',
        confirming: 'Confirming',
        complete: 'Transaction complete',
    }

    let label = $derived(stageLabels[uiState.transactStage] ?? 'Processing')

    let elapsed = $state(0)
    let interval: ReturnType<typeof setInterval> | undefined

    $effect(() => {
        if (uiState.transactStartTime > 0) {
            elapsed = 0
            interval = setInterval(() => {
                elapsed = Math.floor((Date.now() - uiState.transactStartTime) / 1000)
            }, 1000)
        }
        return () => {
            if (interval) clearInterval(interval)
        }
    })

    let isComplete = $derived(uiState.transactStage === 'complete')
</script>

<Header title="Transaction" onclose={isComplete ? undefined : onclose} />

<div class="transact-content">
    {#if isComplete}
        <div class="success-icon">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="30" fill="var(--web-ui-success)" opacity="0.12" />
                <circle cx="32" cy="32" r="22" fill="var(--web-ui-success)" opacity="0.16" />
                <circle
                    cx="32"
                    cy="32"
                    r="22"
                    fill="none"
                    stroke="var(--web-ui-success)"
                    stroke-width="2"
                    opacity="0.5"
                />
                <path
                    d="M23 32l6 6 12-14"
                    stroke="var(--web-ui-success)"
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="checkmark"
                />
            </svg>
        </div>
    {:else}
        <Spinner size={40} />
    {/if}

    <p class="stage-label">{label}</p>

    {#if isComplete}
        {#if uiState.chainName}
            <p class="confirm-sub">Confirmed on {uiState.chainName}</p>
        {/if}
    {:else if uiState.chainName || uiState.accountName || elapsed > 0}
        <div class="session-info">
            {#if uiState.chainName}
                <div class="info-row">
                    <span class="info-label">Network</span>
                    <div class="info-value-row">
                        {#if uiState.chainLogo}
                            <img src={uiState.chainLogo} alt="" class="chain-logo" />
                        {/if}
                        <span class="info-value">{uiState.chainName}</span>
                    </div>
                </div>
            {/if}
            {#if uiState.accountName}
                <div class="info-row">
                    <span class="info-label">Account</span>
                    <span class="info-value mono">{uiState.accountName}</span>
                </div>
            {/if}
            {#if elapsed > 0}
                <div class="info-row">
                    <span class="info-label">Elapsed</span>
                    <span class="info-value">{elapsed}s</span>
                </div>
            {/if}
        </div>
    {/if}
</div>

{#if isComplete}
    <div class="done-actions">
        <Button block onclick={ondone}>Done</Button>
    </div>
{/if}

<style>
    .transact-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        padding: 16px 0 8px;
    }

    .stage-label {
        margin: 0;
        font-size: 16px;
        font-weight: 500;
        color: var(--web-ui-text);
        font-family: var(--web-ui-font);
    }

    .confirm-sub {
        margin: 0;
        font-size: 13px;
        color: var(--web-ui-text-secondary);
        font-family: var(--web-ui-font);
    }

    .done-actions {
        padding-top: 20px;
    }

    .session-info {
        display: flex;
        flex-direction: column;
        gap: 10px;
        width: 100%;
        padding: 14px 16px;
        background: var(--web-ui-surface);
        border-radius: var(--web-ui-radius-sm);
    }

    .info-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
    }

    .info-label {
        font-size: 13px;
        color: var(--web-ui-text-secondary);
        font-family: var(--web-ui-font);
    }

    .info-value-row {
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .info-value {
        font-size: 13px;
        font-weight: 500;
        color: var(--web-ui-text);
        font-family: var(--web-ui-font);
    }

    .info-value.mono {
        font-family: var(--web-ui-font-mono);
        letter-spacing: -0.02em;
    }

    .chain-logo {
        width: 16px;
        height: 16px;
        border-radius: 50%;
    }

    .success-icon .checkmark {
        stroke-dasharray: 30;
        stroke-dashoffset: 30;
        animation: draw 400ms ease-out 100ms forwards;
    }

    @keyframes draw {
        to {
            stroke-dashoffset: 0;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .success-icon .checkmark {
            animation: none;
            stroke-dashoffset: 0;
        }
    }
</style>
