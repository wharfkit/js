import type {WebUIAppearance, WebUITheme} from '../../types.js'

class ThemeState {
    theme = $state<WebUITheme>('auto')
    appearance = $state<WebUIAppearance>({})

    resolved(): 'light' | 'dark' {
        if (this.theme === 'light' || this.theme === 'dark') return this.theme
        if (typeof window !== 'undefined' && window.matchMedia) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        }
        return 'light'
    }

    applyToHost(host: HTMLElement) {
        if (this.theme !== 'auto') {
            host.setAttribute('data-theme', this.theme)
        } else {
            host.removeAttribute('data-theme')
        }

        const a = this.appearance
        if (a.accent) {
            // A custom accent must carry its dependents, or hover/text/ring stay default.
            host.style.setProperty('--web-ui-accent', a.accent)
            host.style.setProperty(
                '--web-ui-accent-hover',
                a.accentHover ?? `color-mix(in oklch, ${a.accent} 85%, var(--web-ui-surface))`
            )
            host.style.setProperty('--web-ui-accent-text', a.accentText ?? 'var(--web-ui-bg)')
            host.style.setProperty('--web-ui-ring', a.accent)
        }
        if (a.background) host.style.setProperty('--web-ui-bg', a.background)
        if (a.surface) host.style.setProperty('--web-ui-surface', a.surface)
        if (a.text) host.style.setProperty('--web-ui-text', a.text)
        if (a.textSecondary) host.style.setProperty('--web-ui-text-secondary', a.textSecondary)
        if (a.error) host.style.setProperty('--web-ui-error', a.error)
        if (a.success) host.style.setProperty('--web-ui-success', a.success)
        if (a.border) host.style.setProperty('--web-ui-border', a.border)
        if (a.borderRadius != null) host.style.setProperty('--web-ui-radius', `${a.borderRadius}px`)
        if (a.fontFamily) host.style.setProperty('--web-ui-font', a.fontFamily)
        if (a.backdropColor) host.style.setProperty('--web-ui-backdrop', a.backdropColor)
    }
}

export const themeState = new ThemeState()
