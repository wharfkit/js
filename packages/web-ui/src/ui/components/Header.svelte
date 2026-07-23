<script lang="ts">
    interface Props {
        title: string
        subtitle?: string
        onclose?: () => void
    }

    let {title, subtitle, onclose}: Props = $props()
</script>

<div class="header">
    <div class="header-text">
        <h2 id="web-ui-modal-title">{title}</h2>
        {#if subtitle}
            <p class="subtitle">{subtitle}</p>
        {/if}
    </div>
    {#if onclose}
        <button class="close-btn" onclick={onclose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                    d="M15 5L5 15M5 5l10 10"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                />
            </svg>
        </button>
    {/if}
</div>

<style>
    .header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 20px;
    }

    .header-text {
        flex: 1;
        min-width: 0;
    }

    h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        letter-spacing: -0.01em;
        color: var(--web-ui-text);
        font-family: var(--web-ui-font);
        line-height: 1.25;
    }

    .subtitle {
        margin: 6px 0 0;
        font-size: 13px;
        font-weight: 500;
        color: var(--web-ui-text-secondary);
        font-family: var(--web-ui-font);
        line-height: 1.45;
    }

    .close-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border: none;
        border-radius: var(--web-ui-radius-sm);
        background: var(--web-ui-surface);
        color: var(--web-ui-text-secondary);
        cursor: pointer;
        transition:
            background 150ms ease,
            color 150ms ease;
        padding: 0;
        flex-shrink: 0;
    }

    .close-btn:hover {
        background: var(--web-ui-border);
        color: var(--web-ui-text);
    }

    .close-btn:focus-visible {
        outline: 2px solid var(--web-ui-ring);
        outline-offset: 2px;
    }

    @media (max-width: 640px) {
        .close-btn {
            width: 44px;
            height: 44px;
        }
    }
</style>
