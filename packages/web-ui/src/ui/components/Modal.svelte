<script lang="ts">
    import {uiState} from '../stores/state.svelte.js'

    interface Props {
        onclose?: () => void
        closeOnOverlayClick?: boolean
        closeOnEscape?: boolean
        children: import('svelte').Snippet
    }

    let {onclose, closeOnOverlayClick = true, closeOnEscape = true, children}: Props = $props()

    let isMobile = $state(false)
    let visible = $state(false)
    let modalEl: HTMLDivElement | undefined = $state()

    const FOCUSABLE_SELECTOR =
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

    function checkMobile() {
        isMobile = window.innerWidth < 640
    }

    function getFocusable(): HTMLElement[] {
        if (!modalEl) return []
        return Array.from(modalEl.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    }

    $effect(() => {
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    })

    $effect(() => {
        if (uiState.active) {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    visible = true
                })
            })
        } else {
            visible = false
        }
    })

    $effect(() => {
        if (!uiState.active) return

        const previouslyFocused = document.activeElement as HTMLElement | null

        requestAnimationFrame(() => {
            // Focus the dialog, not focusable[0] (the close button) — else Enter cancels the flow.
            modalEl?.focus()
        })

        const onKeydown = (e: KeyboardEvent) => {
            // @wc-ignore
            if (e.key === 'Escape' && closeOnEscape) {
                e.preventDefault()
                onclose?.()
                return
            }
            // @wc-ignore
            if (e.key !== 'Tab') return
            const focusable = getFocusable()
            if (focusable.length === 0) {
                e.preventDefault()
                return
            }
            const root = modalEl?.getRootNode() as ShadowRoot | Document
            const active = root?.activeElement as HTMLElement | null
            const first = focusable[0]
            const last = focusable[focusable.length - 1]
            if (e.shiftKey && (active === first || !modalEl?.contains(active))) {
                e.preventDefault()
                last.focus()
            } else if (!e.shiftKey && (active === last || !modalEl?.contains(active))) {
                e.preventDefault()
                first.focus()
            }
        }

        window.addEventListener('keydown', onKeydown, true)
        return () => {
            window.removeEventListener('keydown', onKeydown, true)
            previouslyFocused?.focus?.()
        }
    })

    function handleBackdropClick(e: MouseEvent) {
        if (closeOnOverlayClick && e.target === e.currentTarget) {
            onclose?.()
        }
    }
</script>

{#if uiState.active}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div
        class="web-ui-overlay"
        class:visible
        class:mobile={isMobile}
        onclick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="web-ui-modal-title"
        tabindex="-1"
    >
        <div class="web-ui-modal" class:mobile={isMobile} bind:this={modalEl} tabindex="-1">
            {#if isMobile}
                <div class="drag-handle"><span></span></div>
            {/if}
            {@render children()}
        </div>
    </div>
{/if}

<style>
    .web-ui-overlay {
        position: fixed;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--web-ui-backdrop);
        opacity: 0;
        transition: opacity 200ms ease-out;
        z-index: 1;
    }

    .web-ui-overlay.visible {
        opacity: 1;
    }

    .web-ui-overlay.mobile {
        align-items: flex-end;
    }

    .web-ui-modal {
        background: var(--web-ui-bg);
        border-radius: var(--web-ui-radius);
        box-shadow: var(--web-ui-shadow);
        width: 100%;
        max-width: 400px;
        max-height: 85vh;
        overflow-y: auto;
        font-family: var(--web-ui-font);
        color: var(--web-ui-text);
        padding: 24px;
        transform: scale(0.95) translateY(10px);
        transition: transform 200ms ease-out;
    }

    .web-ui-overlay.visible .web-ui-modal {
        transform: scale(1) translateY(0);
    }

    .web-ui-modal.mobile {
        max-width: 100%;
        max-height: 90vh;
        border-radius: 16px 16px 0 0;
        padding: 12px 24px 24px;
        transform: translateY(100%);
    }

    .web-ui-overlay.visible .web-ui-modal.mobile {
        transform: translateY(0);
    }

    .drag-handle {
        display: flex;
        justify-content: center;
        padding: 4px 0 16px;
    }

    .drag-handle span {
        display: block;
        width: 36px;
        height: 4px;
        border-radius: 2px;
        background: var(--web-ui-border);
    }

    @media (prefers-reduced-motion: reduce) {
        .web-ui-overlay,
        .web-ui-modal {
            transition: none;
        }
    }
</style>
