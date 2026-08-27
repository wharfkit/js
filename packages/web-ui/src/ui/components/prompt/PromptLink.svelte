<script lang="ts">
    import Button from '../Button.svelte'

    interface Props {
        data: {href?: string; label?: string; button?: boolean; variant?: string}
    }

    let {data}: Props = $props()
</script>

{#if data.href}
    {#if data.button !== false}
        <Button
            href={data.href}
            target="_blank"
            block
            variant={data.variant === 'primary' ? 'primary' : 'secondary'}
        >
            {data.label ?? 'Open Link'}
        </Button>
    {:else}
        <a class="text-link" href={data.href} target="_blank" rel="noreferrer">
            {data.label ?? 'Open Link'}
        </a>
    {/if}
{/if}

<style>
    .text-link {
        display: inline-flex;
        align-items: center;
        align-self: center;
        min-height: 44px;
        font-family: var(--web-ui-font);
        font-size: 14px;
        font-weight: 500;
        color: var(--web-ui-accent);
        text-decoration: underline;
        text-underline-offset: 2px;
        padding: 4px 12px;
        border-radius: var(--web-ui-radius-xs);
    }

    .text-link:focus-visible {
        outline: 2px solid var(--web-ui-ring);
        outline-offset: 2px;
    }
</style>
