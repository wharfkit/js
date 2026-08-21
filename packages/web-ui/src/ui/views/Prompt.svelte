<script lang="ts">
    import type {PromptElement} from '@wharfkit/session'
    import Header from '../components/Header.svelte'
    import Button from '../components/Button.svelte'
    import Spinner from '../components/Spinner.svelte'
    import PromptAsset from '../components/prompt/PromptAsset.svelte'
    import PromptAccept from '../components/prompt/PromptAccept.svelte'
    import PromptCountdown from '../components/prompt/PromptCountdown.svelte'
    import PromptLink from '../components/prompt/PromptLink.svelte'
    import PromptButton from '../components/prompt/PromptButton.svelte'
    import PromptQr from '../components/prompt/PromptQr.svelte'
    import PromptTextarea from '../components/prompt/PromptTextarea.svelte'
    import {uiState} from '../stores/state.svelte.js'

    interface Props {
        title: string
        body?: string
        onclose?: () => void
        onconfirm?: () => void
    }

    let {title, body = '', onclose, onconfirm}: Props = $props()

    let showFooter = $derived(
        uiState.promptElements.length > 0 &&
            !uiState.promptElements.some(
                (el) => el.type === 'accept' || el.type === 'button' || el.type === 'link'
            )
    )
</script>

<Header {title} subtitle={body} {onclose} />

{#if uiState.promptElements.length === 0}
    <div class="waiting">
        <Spinner />
        <p class="waiting-label">Waiting for response…</p>
    </div>
{/if}

<div class="elements">
    {#each uiState.promptElements as element}
        {#if element.type === 'asset'}
            <PromptAsset data={element.data as any} />
        {:else if element.type === 'accept'}
            <PromptAccept oncomplete={onconfirm} oncancel={onclose} />
        {:else if element.type === 'countdown'}
            <PromptCountdown data={element.data as any} />
        {:else if element.type === 'link'}
            <PromptLink data={element.data as any} />
        {:else if element.type === 'button'}
            <PromptButton data={element.data as any} />
        {:else if element.type === 'qr'}
            <PromptQr data={element.data as any} />
        {:else if element.type === 'textarea'}
            <PromptTextarea data={element.data as any} />
        {/if}
    {/each}
</div>

{#if showFooter}
    <div class="actions">
        <Button variant="secondary" onclick={onclose}>Cancel</Button>
        <Button onclick={onconfirm}>Confirm</Button>
    </div>
{/if}

<style>
    .elements {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .waiting {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 16px 0 8px;
    }

    .waiting-label {
        margin: 0;
        font-size: 13px;
        font-weight: 500;
        color: var(--web-ui-text-secondary);
        font-family: var(--web-ui-font);
    }

    .actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        padding-top: 12px;
    }
</style>
