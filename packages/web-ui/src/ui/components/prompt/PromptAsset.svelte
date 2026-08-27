<script lang="ts">
    interface Props {
        data: {label?: string; value?: string}
    }

    let {data}: Props = $props()
</script>

<div class="asset">
    <p class="value">{data.value ?? ''}</p>
    <p class="label">{data.label ?? ''}</p>
</div>

<style>
    .asset {
        text-align: center;
        padding: 8px 0;
    }

    .value {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        line-height: 1.4;
        color: var(--web-ui-text);
        font-family: var(--web-ui-font);
    }

    .label {
        margin: 2px 0 0;
        font-size: 13px;
        font-weight: 400;
        color: var(--web-ui-text-secondary);
        font-family: var(--web-ui-font);
    }
</style>
