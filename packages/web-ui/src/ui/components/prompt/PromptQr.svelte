<script lang="ts">
    import generateQr from '../../../lib/qrcode/index.js'

    interface Props {
        data: string
    }

    let {data}: Props = $props()

    let qrSvg = $state('')
    let failed = $state(false)

    $effect(() => {
        if (!data) return
        try {
            const svg = generateQr(data)
            qrSvg = svg || ''
            failed = !svg
        } catch {
            qrSvg = ''
            failed = true
        }
    })
</script>

{#if qrSvg}
    <div class="qr">
        <div class="qr-container">
            {@html qrSvg}
        </div>
    </div>
{:else if failed}
    <p class="qr-fallback">QR code unavailable. Use the link below to continue.</p>
{/if}

<style>
    .qr {
        display: flex;
        justify-content: center;
        padding: 4px 0;
    }

    .qr-container {
        background: #ffffff;
        border-radius: 8px;
        padding: 12px;
        display: flex;
        width: 100%;
        max-width: 240px;
    }

    .qr-container :global(svg) {
        width: 100%;
        height: auto;
    }

    .qr-fallback {
        margin: 0;
        text-align: center;
        font-size: 13px;
        color: var(--web-ui-text-secondary);
        font-family: var(--web-ui-font);
        padding: 8px 0;
    }
</style>
