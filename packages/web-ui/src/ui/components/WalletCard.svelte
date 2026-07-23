<script lang="ts">
    interface Props {
        name: string
        logo?: string
        onclick?: () => void
    }

    let {name, logo, onclick}: Props = $props()
</script>

<button class="wallet-card" {onclick}>
    {#if logo}
        <img src={logo} alt="" class="wallet-logo" />
    {:else}
        <div class="wallet-logo-placeholder" aria-hidden="true">
            {name.charAt(0).toUpperCase()}
        </div>
    {/if}
    <span class="wallet-name">{name}</span>
</button>

<style>
    .wallet-card {
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

    .wallet-card:hover {
        background: var(--web-ui-surface);
        border-color: var(--web-ui-text-secondary);
    }

    .wallet-card:focus-visible {
        outline: 2px solid var(--web-ui-ring);
        outline-offset: 2px;
    }

    .wallet-card:active {
        transform: scale(0.995);
    }

    .wallet-logo {
        width: 32px;
        height: 32px;
        border-radius: var(--web-ui-radius-xs);
        object-fit: contain;
        flex-shrink: 0;
    }

    .wallet-logo-placeholder {
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

    .wallet-name {
        flex: 1;
    }
</style>
