<script lang="ts">
    interface Props {
        label: string
        caption?: string
        logo?: string
        icon?: boolean
        onclick?: () => void
    }

    let {label, caption, logo, icon = true, onclick}: Props = $props()
</script>

<button class="select-card" {onclick}>
    {#if logo}
        <img src={logo} alt="" class="select-logo" />
    {:else if icon}
        <div class="select-logo-placeholder" aria-hidden="true">
            {label.charAt(0).toUpperCase()}
        </div>
    {/if}
    <span class="select-text">
        <span class="select-label">{label}</span>
        {#if caption}
            <span class="select-caption">{caption}</span>
        {/if}
    </span>
</button>

<style>
    .select-card {
        display: flex;
        align-items: center;
        gap: 14px;
        width: 100%;
        padding: 14px 16px;
        border: 1px solid var(--web-ui-border);
        border-radius: var(--web-ui-radius-sm);
        background: transparent;
        color: var(--web-ui-text);
        font-family: var(--web-ui-font);
        font-size: 15px;
        font-weight: 500;
        letter-spacing: -0.005em;
        cursor: pointer;
        transition:
            background 150ms var(--web-ui-ease),
            border-color 150ms var(--web-ui-ease);
        text-align: left;
        box-sizing: border-box;
    }

    .select-card:hover {
        background: var(--web-ui-surface);
        border-color: var(--web-ui-text-secondary);
    }

    .select-card:focus-visible {
        outline: 2px solid var(--web-ui-ring);
        outline-offset: 2px;
    }

    .select-card:active {
        transform: scale(0.995);
    }

    .select-logo {
        width: 32px;
        height: 32px;
        border-radius: var(--web-ui-radius-xs);
        object-fit: contain;
        flex-shrink: 0;
    }

    .select-logo-placeholder {
        width: 32px;
        height: 32px;
        border-radius: var(--web-ui-radius-xs);
        background: var(--web-ui-surface);
        border: 1px solid var(--web-ui-border);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 500;
        font-size: 14px;
        color: var(--web-ui-text-secondary);
        flex-shrink: 0;
    }

    .select-text {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .select-label {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .select-caption {
        font-size: 12px;
        font-weight: 400;
        color: var(--web-ui-text-secondary);
    }
</style>
