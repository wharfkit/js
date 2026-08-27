<script lang="ts">
    interface Props {
        variant?: 'primary' | 'secondary'
        onclick?: () => void
        disabled?: boolean
        href?: string
        target?: string
        block?: boolean
        multiline?: boolean
        children: import('svelte').Snippet
    }

    let {
        variant = 'primary',
        onclick,
        disabled = false,
        href,
        target,
        block = false,
        multiline = false,
        children,
    }: Props = $props()
</script>

{#if href}
    <a
        class="btn"
        class:primary={variant === 'primary'}
        class:secondary={variant === 'secondary'}
        class:block
        class:multiline
        {href}
        {target}
        rel="noreferrer"
    >
        {@render children()}
    </a>
{:else}
    <button
        class="btn"
        class:primary={variant === 'primary'}
        class:secondary={variant === 'secondary'}
        class:block
        class:multiline
        {onclick}
        {disabled}
    >
        {@render children()}
    </button>
{/if}

<style>
    .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        height: 44px;
        padding: 0 20px;
        border: none;
        border-radius: var(--web-ui-radius-sm);
        font-family: var(--web-ui-font);
        font-size: 15px;
        font-weight: 500;
        letter-spacing: -0.005em;
        cursor: pointer;
        text-decoration: none;
        transition:
            background 150ms var(--web-ui-ease),
            transform 100ms ease;
        min-width: 0;
        box-sizing: border-box;
    }

    .btn.block {
        width: 100%;
    }

    .btn.multiline {
        height: auto;
        min-height: 44px;
        padding: 16px 20px;
        line-height: 1.45;
        white-space: pre-line;
    }

    .btn:focus-visible {
        outline: 2px solid var(--web-ui-ring);
        outline-offset: 2px;
    }

    .btn:active:not(:disabled) {
        transform: scale(0.98);
    }

    .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .primary {
        background: var(--web-ui-accent);
        color: var(--web-ui-accent-text);
    }

    .primary:hover:not(:disabled) {
        background: var(--web-ui-accent-hover);
    }

    .secondary {
        background: transparent;
        color: var(--web-ui-text);
        border: 1px solid var(--web-ui-border);
    }

    .secondary:hover:not(:disabled) {
        background: var(--web-ui-surface);
    }
</style>
