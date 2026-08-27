<script lang="ts">
    import Header from '../components/Header.svelte'
    import Button from '../components/Button.svelte'
    import {uiState} from '../stores/state.svelte.js'

    interface Props {
        onclose?: () => void
        onconfirm?: () => void
    }

    let {onclose, onconfirm}: Props = $props()
</script>

<Header title="Permission Request" {onclose} />

<div class="sk-body">
    <div class="sk-app-name">{uiState.skAppName}</div>
    <p class="sk-description">has active permissions on this device.</p>

    <div class="sk-info-note">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="var(--web-ui-text-secondary)" stroke-width="1.5" />
            <path
                d="M8 7v4M8 5.5v.5"
                stroke="var(--web-ui-text-secondary)"
                stroke-width="1.5"
                stroke-linecap="round"
            />
        </svg>
        <span>Your wallet will ask you to sign a transaction to remove this permission.</span>
    </div>
</div>

<div class="actions">
    <Button variant="secondary" onclick={onclose}>Log Out Only</Button>
    <Button onclick={onconfirm}>Remove and Log Out</Button>
</div>

<style>
    .sk-body {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .sk-app-name {
        font-size: 16px;
        font-weight: 600;
        color: var(--web-ui-text);
        font-family: var(--web-ui-font);
    }

    .sk-description {
        margin: 0;
        font-size: 15px;
        line-height: 1.5;
        color: var(--web-ui-text-secondary);
        font-family: var(--web-ui-font);
    }

    .sk-info-note {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        font-size: 13px;
        color: var(--web-ui-text-secondary);
        font-family: var(--web-ui-font);
        line-height: 1.5;
        padding: 12px 14px;
        background: var(--web-ui-surface);
        border-radius: var(--web-ui-radius-sm);
    }

    .sk-info-note svg {
        flex-shrink: 0;
        margin-top: 1px;
    }

    .actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        padding-top: 8px;
    }
</style>
