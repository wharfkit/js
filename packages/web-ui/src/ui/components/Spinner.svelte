<script lang="ts">
    interface Props {
        size?: number
    }

    let {size = 32}: Props = $props()
</script>

<div class="spinner" style="width: {size}px; height: {size}px;">
    <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="var(--web-ui-border)" stroke-width="3" />
        <path
            d="M12 2a10 10 0 019.8 8"
            stroke="var(--web-ui-accent)"
            stroke-width="3"
            stroke-linecap="round"
        />
    </svg>
</div>

<style>
    .spinner {
        display: inline-flex;
        animation: spin 1s linear infinite;
    }

    .spinner svg {
        width: 100%;
        height: 100%;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .spinner {
            animation-duration: 2s;
        }
    }
</style>
