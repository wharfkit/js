/**
 * The TackleBox look for the session modal: deep-void navy, cyan light lines,
 * restrained glow - matching the wallet's own ImGui theme.
 *
 * The Wharfkit web renderer keeps its styles inside a closed shadow root, but
 * exposes the root (`ui.shadow`) and its host element (`ui.element`) as public
 * fields. We inject one stylesheet into the shadow root, scoped behind a
 * `data-tacklebox` attribute on the host, and only set that attribute while a
 * TackleBox prompt is on screen - other wallets' prompts keep the stock look.
 * Everything is feature-detected: with a different UserInterface the theme
 * simply does not apply.
 */

const STYLE_ID = 'wallet-plugin-tacklebox-theme'
const HOST_ATTRIBUTE = 'data-tacklebox'

// TackleBox palette (src/ui/theme.hpp in the wallet).
const VOID = '#04070c'
const BG = '#070b14'
const PANEL = '#0a121f'
const PANEL_HI = '#0e1828'
const INSET = '#060d18'
const HAIRLINE = '#14273b'
const HAIR_HI = '#25567c'
const CYAN = '#00e0ff'
const CYAN_DIM = '#0e7a96'
const ICE = '#d9f2ff'
const STEEL = '#7a96ac'
const SLATE = '#455c72'
const DANGER = '#ff3d5f'

export const tackleboxModalStyles = `
:host([${HOST_ATTRIBUTE}]) dialog {
    color-scheme: dark;

    /* Brand hooks the renderer derives accents from. */
    --wharf-blue: ${CYAN};
    --reef-turquoise: ${CYAN};
    --seafoam-mint: ${CYAN};
    --swell-mist: ${PANEL_HI};

    /* Primary scale: navy voids and panels. */
    --color-primary-50: ${ICE};
    --color-primary-100: #c3e4f7;
    --color-primary-200: #9cc0d6;
    --color-primary-300: ${STEEL};
    --color-primary-400: #5f7e97;
    --color-primary-500: ${SLATE};
    --color-primary-600: #2e4459;
    --color-primary-700: ${VOID};
    --color-primary-800: ${PANEL_HI};
    --color-primary-900: ${INSET};
    --color-primary-990: ${PANEL};

    /* Secondary scale: the cyan line-light. */
    --color-secondary-200: ${CYAN};
    --color-secondary-300: ${CYAN};
    --color-secondary-400: #33e7ff;
    --color-secondary-500: rgba(0, 224, 255, 0.16);

    --color-custom-2: rgba(0, 224, 255, 0.28);
    --color-custom-3: ${CYAN_DIM};
    --color-custom-4: #0c1b2e;
    --color-custom-6: ${HAIR_HI};
    --color-custom-8: ${PANEL_HI};
    --color-neutral-300: ${STEEL};

    /* Body and header. */
    --body-background-color: ${PANEL};
    --body-text-color: ${ICE};
    --body-text-color-variant: ${STEEL};
    --header-background-color: ${VOID};
    --header-text-color: ${ICE};
    --header-button-background: ${VOID};
    --header-button-outline: ${HAIRLINE};

    /* Buttons: dark wells behind cyan hairlines. */
    --button-text-color: ${ICE};
    --button-text-color-active: ${CYAN};
    --button-outline: inset 0 0 0 1px rgba(0, 224, 255, 0.38);
    --button-outline-active: inset 0 0 0 2px ${CYAN};
    --button-primary-background: rgba(0, 224, 255, 0.16);
    --button-primary-background-hover: rgba(0, 224, 255, 0.26);
    --button-primary-background-active: rgba(0, 224, 255, 0.32);
    --button-primary-outline-hover: inset 0 0 0 1px ${CYAN};
    --button-secondary-background: ${PANEL_HI};
    --button-secondary-background-hover: ${PANEL_HI};
    --button-secondary-background-active: ${INSET};
    --button-secondary-outline-hover: inset 0 0 0 1px ${HAIR_HI};
    --button-outlined-background-active: ${PANEL_HI};
    --button-outlined-outline: inset 0 0 0 1px ${HAIRLINE};
    --button-outlined-outline-hover: inset 0 0 0 1px ${HAIR_HI};
    --button-tertiary-color: ${STEEL};

    /* Inputs and text wells. */
    --input-placeholder-color: ${SLATE};
    --input-background-focus: #0c1b2e;
    --input-border-color: ${HAIRLINE};
    --input-border-color-hover: ${HAIR_HI};
    --input-border-color-focus: ${CYAN};
    --text-area-background: ${INSET};
    --text-area-text-color: ${ICE};

    /* Details. */
    --qr-border-color: inset 0 0 0 1px rgba(0, 224, 255, 0.35);
    --checkbox-stroke: ${CYAN};
    --checkbox-fill: ${CYAN_DIM};
    --error-color: ${DANGER};
    --list-item-background-color-hover: ${PANEL_HI};
    --list-item-text-color-hover: #33e7ff;
    --list-divider-color: rgba(20, 39, 59, 0.6);
    --loading-circle-color: ${CYAN};
    --loading-circle-track-color: rgba(0, 224, 255, 0.08);
    --wave-foreground-color: ${PANEL};
    --wave-midground-color: ${PANEL_HI};
    --wave-background-color: ${HAIRLINE};

    /* The card itself: hard navy edge, restrained cyan glow. */
    background: linear-gradient(180deg, ${PANEL} 0%, ${BG} 100%);
    border: 1px solid ${HAIR_HI};
    box-shadow: 0 0 0 1px rgba(0, 224, 255, 0.1), 0 0 28px rgba(0, 224, 255, 0.1),
        0 28px 80px rgba(0, 0, 0, 0.65);
}
`

// Balanced apply/revert across overlapping prompts.
let themeDepth = 0

/**
 * Skin the web renderer's modal with the TackleBox theme while a TackleBox
 * prompt is up. Returns a revert function; both directions are no-ops when the
 * UserInterface is not the Wharfkit web renderer.
 */
export function applyModalTheme(ui: unknown): () => void {
    try {
        const renderer = ui as {shadow?: ShadowRoot; element?: Element}
        const shadow = renderer?.shadow
        const host = renderer?.element
        if (!shadow || !host || typeof host.setAttribute !== 'function') {
            return () => undefined
        }
        if (!shadow.getElementById || !shadow.getElementById(STYLE_ID)) {
            const style = document.createElement('style')
            style.id = STYLE_ID
            style.textContent = tackleboxModalStyles
            shadow.appendChild(style)
        }
        host.setAttribute(HOST_ATTRIBUTE, '')
        themeDepth++
        let reverted = false
        return () => {
            if (reverted) return
            reverted = true
            themeDepth = Math.max(0, themeDepth - 1)
            if (themeDepth === 0) {
                try {
                    host.removeAttribute(HOST_ATTRIBUTE)
                } catch (error) {
                    // Never let styling interfere with the session flow.
                }
            }
        }
    } catch (error) {
        return () => undefined
    }
}
