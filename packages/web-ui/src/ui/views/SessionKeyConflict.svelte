<script lang="ts">
    import Header from '../components/Header.svelte'
    import Button from '../components/Button.svelte'
    import {uiState} from '../stores/state.svelte.js'

    interface Props {
        onclose?: () => void
        onselect?: (choice: 'add' | 'replace' | 'cancel') => void
    }

    let {onclose, onselect}: Props = $props()

    let choice = $state<'add' | 'replace'>('add')

    let deviceText = $derived(
        uiState.skExistingKeyCount === 1
            ? 'another device'
            : `${uiState.skExistingKeyCount} other devices`
    )
</script>

<Header title="Permission Request" {onclose} />

<div class="sk-body">
    <div class="sk-app-name">{uiState.skAppName}</div>
    <p class="sk-description">
        already has permissions on <strong>{deviceText}</strong>.
    </p>

    <div class="options">
        <label class:selected={choice === 'add'}>
            <input type="radio" bind:group={choice} value="add" />
            <div class="option-content">
                <span class="option-title">Add this device</span>
                <span class="option-subtitle">All devices will continue to work</span>
            </div>
        </label>
        <label class:selected={choice === 'replace'}>
            <input type="radio" bind:group={choice} value="replace" />
            <div class="option-content">
                <span class="option-title">Only use this device</span>
                <span class="option-subtitle">Other devices will stop working</span>
            </div>
        </label>
    </div>

    <div class="sk-info-note">
        This only affects {uiState.skAppName}. Your wallet still works everywhere.
    </div>
</div>

<div class="actions">
    <Button variant="secondary" onclick={() => onselect?.('cancel')}>Cancel</Button>
    <Button onclick={() => onselect?.(choice)}>Continue</Button>
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

    .options {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    label {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 14px;
        background: transparent;
        border: 1px solid var(--web-ui-border);
        border-radius: var(--web-ui-radius-sm);
        cursor: pointer;
        transition:
            border-color 150ms var(--web-ui-ease),
            background 150ms var(--web-ui-ease);
    }

    label.selected {
        border-color: var(--web-ui-accent);
        background: color-mix(in oklch, var(--web-ui-accent) 6%, transparent);
    }

    label:not(.selected):hover {
        border-color: var(--web-ui-text-secondary);
        background: var(--web-ui-surface);
    }

    input[type='radio'] {
        margin-top: 2px;
        accent-color: var(--web-ui-accent);
    }

    .option-content {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .option-title {
        font-weight: 500;
        font-size: 14px;
        color: var(--web-ui-text);
        font-family: var(--web-ui-font);
    }

    .option-subtitle {
        font-size: 12px;
        color: var(--web-ui-text-secondary);
        font-family: var(--web-ui-font);
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
