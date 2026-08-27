<script lang="ts">
    interface Props {
        data: {label?: string; end?: string}
    }

    let {data}: Props = $props()

    const CIRCUMFERENCE = 151

    let remaining = $state('')
    let fraction = $state(1)

    function format(ms: number): string {
        if (ms <= 0) return '00:00'
        const s = Math.floor(ms / 1000)
        const m = Math.floor(s / 60)
        const sec = s % 60
        return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    }

    let dashoffset = $derived(CIRCUMFERENCE * (1 - Math.max(0, Math.min(1, fraction))))

    $effect(() => {
        if (!data.end) return
        const deadline = new Date(data.end).getTime()
        // No total is provided, so treat the time left at mount as full.
        const total = Math.max(deadline - Date.now(), 1)
        const update = () => {
            const left = deadline - Date.now()
            remaining = format(left)
            fraction = left / total
        }
        update()
        const interval = setInterval(update, 200)
        return () => clearInterval(interval)
    })
</script>

<div class="countdown">
    <div class="timer-ring">
        <svg width="56" height="56" viewBox="0 0 56 56">
            <circle
                cx="28"
                cy="28"
                r="24"
                fill="none"
                stroke="var(--web-ui-border)"
                stroke-width="2.5"
            />
            <circle
                cx="28"
                cy="28"
                r="24"
                fill="none"
                stroke="var(--web-ui-accent)"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-dasharray={CIRCUMFERENCE}
                stroke-dashoffset={dashoffset}
                class="progress"
            />
        </svg>
        <span class="time">{remaining}</span>
    </div>
    {#if data.label}
        <p class="label">{data.label}</p>
    {/if}
</div>

<style>
    .countdown {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 4px 0;
    }

    .timer-ring {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .progress {
        transform: rotate(-90deg);
        transform-origin: center;
        transition: stroke-dashoffset 200ms linear;
    }

    .time {
        position: absolute;
        font-size: 13px;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        color: var(--web-ui-text);
        font-family: var(--web-ui-font);
    }

    .label {
        margin: 0;
        font-size: 13px;
        font-weight: 500;
        color: var(--web-ui-text-secondary);
        font-family: var(--web-ui-font);
    }

    @media (prefers-reduced-motion: reduce) {
        .progress {
            transition: none;
        }
    }
</style>
