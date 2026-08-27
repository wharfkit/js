<script lang="ts">
    import type {ChainDefinition} from '@wharfkit/common'
    import SelectCard from '../SelectCard.svelte'
    import {themeState} from '../../stores/theme.svelte.js'
    import {logoSource} from '../../../lib/logo.js'

    interface Props {
        chains: ChainDefinition[]
        onselect?: (chain: ChainDefinition) => void
    }

    let {chains, onselect}: Props = $props()
</script>

<div class="chain-list">
    {#each chains as chain}
        <SelectCard
            label={chain.name}
            logo={logoSource(chain.getLogo(), themeState.resolved())}
            onclick={() => onselect?.(chain)}
        />
    {/each}
</div>

<style>
    .chain-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
</style>
