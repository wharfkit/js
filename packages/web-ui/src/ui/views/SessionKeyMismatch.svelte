<script lang="ts">
    import Header from '../components/Header.svelte'
    import Button from '../components/Button.svelte'
    import {uiState} from '../stores/state.svelte.js'
    import type {SessionKeyWhitelistItem} from '@wharfkit/session'

    interface Props {
        onclose?: () => void
        onselect?: (choice: 'update' | 'dismiss') => void
    }

    let {onclose, onselect}: Props = $props()

    function getPermissionItems(entries: SessionKeyWhitelistItem[]): string[] {
        const items: string[] = []
        for (const entry of entries) {
            if (entry.actions && entry.actions.length > 0) {
                for (const action of entry.actions) {
                    items.push(`${action} (${entry.contract})`)
                }
            } else {
                items.push(`All actions (${entry.contract})`)
            }
        }
        return items
    }

    let addedItems = $derived(getPermissionItems(uiState.skAdded))
    let removedItems = $derived(getPermissionItems(uiState.skRemoved))
</script>

<Header title="Permission Request" {onclose} />

<div class="sk-body">
    <div class="sk-app-name">{uiState.skAppName}</div>
    <p class="sk-description">needs updated permissions.</p>

    {#if uiState.skAdded.length > 0}
        <div class="sk-section">
            <div class="sk-section-label">New permissions:</div>
            <ul class="sk-permissions-list">
                {#each addedItems as item}
                    <li class="sk-permission-item added">
                        <span class="sk-indicator added">+</span>
                        <span>{item}</span>
                    </li>
                {/each}
            </ul>
        </div>
    {/if}

    {#if uiState.skRemoved.length > 0}
        <div class="sk-section">
            <div class="sk-section-label">Permissions no longer needed:</div>
            <ul class="sk-permissions-list">
                {#each removedItems as item}
                    <li class="sk-permission-item removed">
                        <span class="sk-indicator removed">−</span>
                        <span>{item}</span>
                    </li>
                {/each}
            </ul>
        </div>
    {/if}
</div>

<div class="actions">
    <Button variant="secondary" onclick={() => onselect?.('dismiss')}>Not Now</Button>
    <Button onclick={() => onselect?.('update')}>Update</Button>
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

    .sk-section {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .sk-section-label {
        font-size: 13px;
        font-weight: 500;
        color: var(--web-ui-text-secondary);
        font-family: var(--web-ui-font);
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

    .sk-permission-item.added {
        background: color-mix(in oklch, var(--web-ui-success) 10%, transparent);
    }

    .sk-permission-item.removed {
        background: var(--web-ui-surface);
    }

    .sk-indicator {
        font-weight: 700;
        font-size: 14px;
        width: 16px;
        text-align: center;
        flex-shrink: 0;
    }

    .sk-indicator.added {
        color: var(--web-ui-success);
    }

    .sk-indicator.removed {
        color: var(--web-ui-text-secondary);
    }

    .actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        padding-top: 8px;
    }
</style>
