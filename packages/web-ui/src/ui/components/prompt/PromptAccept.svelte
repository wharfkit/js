<script lang="ts">
    import Button from '../Button.svelte'

    interface Props {
        oncomplete?: () => void
        oncancel?: () => void
    }

    let {oncomplete, oncancel}: Props = $props()
</script>

<div class="accept">
    <Button variant="secondary" onclick={oncancel}>Decline</Button>
    <Button onclick={oncomplete}>Accept</Button>
</div>

<style>
    .accept {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
    }
</style>
