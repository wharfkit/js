<script lang="ts">
    import Header from '../components/Header.svelte'
    import Button from '../components/Button.svelte'
    import {uiState} from '../stores/state.svelte.js'

    interface Props {
        onclose?: () => void
        onapprove?: () => void
    }

    let {onclose, onapprove}: Props = $props()

    interface PermissionGroup {
        contract: string
        actions: string[]
        isAllActions: boolean
    }

    const FUND_MOVING = new Set(['transfer', 'withdraw', 'transferfrom'])
    function isFundMoving(action: string): boolean {
        return FUND_MOVING.has(action.toLowerCase())
    }

    let groups = $derived<PermissionGroup[]>(
        uiState.skWhitelist.map((entry) => ({
            contract: entry.contract,
            actions: entry.actions && entry.actions.length > 0 ? entry.actions : [],
            isAllActions: !entry.actions || entry.actions.length === 0,
        }))
    )

    let permissionCount = $derived(
        groups.reduce((sum, g) => sum + (g.isAllActions ? 1 : g.actions.length), 0)
    )
    let contractCount = $derived(groups.length)
    let hasAllActions = $derived(groups.some((g) => g.isAllActions))
    let shouldAutoExpand = $derived(hasAllActions || permissionCount > 8 || contractCount > 2)
    let useGrouping = $derived(permissionCount > 3)

    let title = $derived(
        uiState.skAppName
            ? `Allow ${uiState.skAppName} to act for you?`
            : 'Allow this app to act for you?'
    )

    let showDetails = $state(false)
    let showAbout = $state(false)
    let initialExpandApplied = false

    $effect(() => {
        if (shouldAutoExpand && !initialExpandApplied) {
            showDetails = true
            initialExpandApplied = true
        }
    })
</script>

{#snippet actionRow(action: string, contract: string | undefined)}
    {#if isFundMoving(action)}
        <li class="sk-permission-item warning">
            <svg class="sk-warn-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                    d="M8 1.5L14.5 13H1.5L8 1.5z"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linejoin="round"
                />
                <path
                    d="M8 6v3M8 11v.5"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                />
            </svg>
            <span>{action} <span class="action-note">Can move tokens from your account</span></span>
        </li>
    {:else}
        <li class="sk-permission-item neutral">
            <span class="sk-bullet">–</span>
            <span
                >{action}{#if contract}
                    <span class="contract-hint">({contract})</span>{/if}</span
            >
        </li>
    {/if}
{/snippet}

<Header {title} {onclose} />

<div class="sk-body">
    <p class="sk-description">
        {uiState.skAppName} can run these actions without asking your wallet each time, until you remove
        it.
    </p>

    <button
        class="sk-summary-badge"
        onclick={() => (showDetails = !showDetails)}
        aria-expanded={showDetails}
    >
        <span class="sk-summary-left">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle
                    cx="8"
                    cy="8"
                    r="7"
                    stroke="var(--web-ui-text-secondary)"
                    stroke-width="1.5"
                />
                <path
                    d="M8 7v4M8 5.5v.5"
                    stroke="var(--web-ui-text-secondary)"
                    stroke-width="1.5"
                    stroke-linecap="round"
                />
            </svg>
            <span>
                {permissionCount} permission{permissionCount !== 1 ? 's' : ''} on {contractCount} contract{contractCount !==
                1
                    ? 's'
                    : ''}
            </span>
        </span>
        <span class="sk-toggle">{showDetails ? 'Hide details' : 'Show details'}</span>
    </button>

    {#if showDetails}
        <div class="sk-details">
            <div class="sk-section-label">
                If approved, {uiState.skAppName} can perform these actions without wallet approval:
            </div>

            {#if useGrouping}
                {#each groups as group}
                    <div class="sk-contract-group">
                        <div class="sk-contract-header">{group.contract}</div>
                        <ul class="sk-permissions-list">
                            {#if group.isAllActions}
                                <li class="sk-permission-item warning">
                                    <svg
                                        class="sk-warn-icon"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 16 16"
                                        fill="none"
                                    >
                                        <path
                                            d="M8 1.5L14.5 13H1.5L8 1.5z"
                                            stroke="currentColor"
                                            stroke-width="1.5"
                                            stroke-linejoin="round"
                                        />
                                        <path
                                            d="M8 6v3M8 11v.5"
                                            stroke="currentColor"
                                            stroke-width="1.5"
                                            stroke-linecap="round"
                                        />
                                    </svg>
                                    <span>Full access, including future actions</span>
                                </li>
                            {:else}
                                {#each group.actions as action}
                                    {@render actionRow(action, undefined)}
                                {/each}
                            {/if}
                        </ul>
                    </div>
                {/each}
            {:else}
                <ul class="sk-permissions-list">
                    {#each groups as group}
                        {#if group.isAllActions}
                            <li class="sk-permission-item warning">
                                <svg
                                    class="sk-warn-icon"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                >
                                    <path
                                        d="M8 1.5L14.5 13H1.5L8 1.5z"
                                        stroke="currentColor"
                                        stroke-width="1.5"
                                        stroke-linejoin="round"
                                    />
                                    <path
                                        d="M8 6v3M8 11v.5"
                                        stroke="currentColor"
                                        stroke-width="1.5"
                                        stroke-linecap="round"
                                    />
                                </svg>
                                <span
                                    >Full access to {group.contract}, including future actions</span
                                >
                            </li>
                        {:else}
                            {#each group.actions as action}
                                {@render actionRow(action, group.contract)}
                            {/each}
                        {/if}
                    {/each}
                </ul>
            {/if}

            <div class="sk-boundary">Any other action will still require wallet approval.</div>
        </div>
    {/if}

    <button
        class="sk-about-toggle"
        onclick={() => (showAbout = !showAbout)}
        aria-expanded={showAbout}
    >
        What's a session key?
    </button>
    {#if showAbout}
        <p class="sk-about">
            A session key lets this app sign the actions listed above for you, using a key stored in
            this browser that you can remove at any time. It can't sign anything else.
        </p>
    {/if}

    <div class="sk-info-note">
        {uiState.skAppName} works without this. You'll just approve each action individually instead.
    </div>
</div>

<div class="actions">
    <Button variant="secondary" onclick={onclose}>Not Now</Button>
    <Button onclick={onapprove}>Allow</Button>
</div>

<style>
    .sk-body {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .sk-description {
        margin: 0;
        font-size: 15px;
        line-height: 1.5;
        color: var(--web-ui-text-secondary);
        font-family: var(--web-ui-font);
    }

    .sk-summary-badge {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 12px 14px;
        background: var(--web-ui-surface);
        border: 1px solid var(--web-ui-border);
        border-radius: var(--web-ui-radius-sm);
        cursor: pointer;
        font-family: var(--web-ui-font);
        font-size: 13px;
        color: var(--web-ui-text-secondary);
        width: 100%;
        box-sizing: border-box;
    }

    .sk-summary-badge:hover {
        border-color: var(--web-ui-accent);
    }

    .sk-summary-badge:focus-visible {
        outline: 2px solid var(--web-ui-ring);
        outline-offset: 2px;
    }

    .sk-summary-left {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .sk-toggle {
        color: var(--web-ui-accent);
        font-weight: 500;
        font-size: 13px;
        white-space: nowrap;
    }

    .sk-details {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .sk-section-label {
        font-size: 13px;
        color: var(--web-ui-text-secondary);
        font-family: var(--web-ui-font);
        line-height: 1.5;
    }

    .sk-contract-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .sk-contract-header {
        font-size: 12px;
        font-weight: 600;
        color: var(--web-ui-text-secondary);
        font-family: var(--web-ui-font-mono);
        letter-spacing: -0.02em;
        text-transform: none;
    }

    .sk-permissions-list {
        display: flex;
        flex-direction: column;
        gap: 4px;
        list-style: none;
        margin: 0;
        padding: 0;
    }

    .sk-permission-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        font-size: 13px;
        font-family: var(--web-ui-font);
        color: var(--web-ui-text);
        border-radius: var(--web-ui-radius-xs);
    }

    .sk-permission-item.neutral {
        background: var(--web-ui-surface);
    }

    .sk-permission-item.warning {
        background: color-mix(in oklch, var(--web-ui-warning) 12%, transparent);
        color: var(--web-ui-text);
    }

    .sk-warn-icon {
        color: var(--web-ui-warning);
        flex-shrink: 0;
    }

    .sk-bullet {
        color: var(--web-ui-text-secondary);
        font-weight: 500;
    }

    .action-note {
        color: var(--web-ui-text-secondary);
        font-size: 0.92em;
    }

    .contract-hint {
        color: var(--web-ui-text-secondary);
        font-size: 0.9em;
    }

    .sk-boundary {
        font-size: 12px;
        color: var(--web-ui-text-secondary);
        font-family: var(--web-ui-font);
        font-style: italic;
        padding: 8px 0 0;
    }

    .sk-about-toggle {
        display: inline-flex;
        align-items: center;
        align-self: flex-start;
        min-height: 44px;
        padding: 4px 0;
        background: none;
        border: none;
        font-family: var(--web-ui-font);
        font-size: 13px;
        font-weight: 500;
        color: var(--web-ui-accent);
        cursor: pointer;
        text-align: left;
    }

    .sk-about-toggle:focus-visible {
        outline: 2px solid var(--web-ui-ring);
        outline-offset: 2px;
        border-radius: var(--web-ui-radius-xs);
    }

    .sk-about {
        margin: 0;
        font-size: 13px;
        line-height: 1.5;
        color: var(--web-ui-text-secondary);
        font-family: var(--web-ui-font);
        padding: 10px 12px;
        background: var(--web-ui-surface);
        border-radius: var(--web-ui-radius-xs);
    }

    .sk-info-note {
        font-size: 12px;
        color: var(--web-ui-text-secondary);
        font-family: var(--web-ui-font);
        line-height: 1.5;
        padding: 8px 12px;
        background: var(--web-ui-surface);
        border-radius: var(--web-ui-radius-xs);
    }

    .actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        padding-top: 8px;
    }
</style>
