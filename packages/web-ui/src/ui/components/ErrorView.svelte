<script lang="ts">
    import Header from './Header.svelte'
    import Button from './Button.svelte'

    interface Props {
        message: string
        details?: string
        onclose?: () => void
        onretry?: () => void
    }

    let {message, details = '', onclose, onretry}: Props = $props()

    let showDetails = $state(false)
</script>

<Header title="Error" {onclose} />

<div class="error-content">
    <div class="error-icon">
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
            <circle cx="28" cy="28" r="28" fill="var(--web-ui-error)" opacity="0.08" />
            <circle cx="28" cy="28" r="20" fill="var(--web-ui-error)" opacity="0.08" />
            <path
                d="M28 20v12M28 36v2"
                stroke="var(--web-ui-error)"
                stroke-width="2.5"
                stroke-linecap="round"
            />
        </svg>
    </div>

    <p class="error-message">{message}</p>

    {#if details}
        <button
            class="details-toggle"
            onclick={() => (showDetails = !showDetails)}
            aria-expanded={showDetails}
        >
            {showDetails ? 'Hide technical details' : 'Show technical details'}
        </button>
        {#if showDetails}
            <p class="error-details">{details}</p>
        {/if}
    {/if}
</div>

<div class="actions">
    <Button variant="secondary" onclick={onclose}>Close</Button>
    {#if onretry}
        <Button onclick={onretry}>Retry</Button>
    {/if}
</div>

<style>
    .error-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        padding: 8px 0 24px;
    }

    .error-icon {
        display: flex;
    }

    .error-message {
        margin: 0;
        font-size: 15px;
        font-weight: 500;
        color: var(--web-ui-text);
        text-align: center;
        font-family: var(--web-ui-font);
        line-height: 1.4;
    }

    .details-toggle {
        display: inline-flex;
        align-items: center;
        align-self: center;
        min-height: 44px;
        padding: 4px 8px;
        background: none;
        border: none;
        font-family: var(--web-ui-font);
        font-size: 13px;
        font-weight: 500;
        color: var(--web-ui-text-secondary);
        cursor: pointer;
        text-decoration: underline;
        text-underline-offset: 2px;
    }

    .details-toggle:hover {
        color: var(--web-ui-text);
    }

    .details-toggle:focus-visible {
        outline: 2px solid var(--web-ui-ring);
        outline-offset: 2px;
        border-radius: var(--web-ui-radius-xs);
    }

    .error-details {
        margin: 0;
        font-size: 13px;
        color: var(--web-ui-text-secondary);
        text-align: center;
        font-family: var(--web-ui-font);
        word-break: break-word;
        line-height: 1.5;
        background: var(--web-ui-surface);
        padding: 10px 14px;
        border-radius: var(--web-ui-radius-xs);
        width: 100%;
    }

    .actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
    }
</style>
