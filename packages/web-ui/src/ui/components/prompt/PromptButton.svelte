<script lang="ts">
    import Button from '../Button.svelte'

    interface Props {
        data: {label?: string; onClick?: () => void; variant?: 'primary' | 'secondary'}
    }

    let {data}: Props = $props()
</script>

<div class="prompt-button">
    <Button variant={data.variant ?? 'secondary'} onclick={data.onClick}>
        {data.label ?? 'OK'}
    </Button>
</div>

<style>
    .prompt-button {
        display: flex;
        justify-content: center;
    }
</style>
