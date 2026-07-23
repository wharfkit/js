export type WebUITheme = 'light' | 'dark' | 'auto'

export interface WebUIAppearance {
    accent?: string
    accentHover?: string
    accentText?: string
    background?: string
    surface?: string
    text?: string
    textSecondary?: string
    error?: string
    success?: string
    border?: string
    borderRadius?: number
    fontFamily?: string
    backdropColor?: string
}

export interface WebUIOptions {
    theme?: WebUITheme
    appearance?: WebUIAppearance
    appName?: string
    appLogo?: string
    closeOnOverlayClick?: boolean
    closeOnEscape?: boolean
    zIndex?: number
    logging?: boolean
}

export const defaultOptions: Required<
    Pick<WebUIOptions, 'theme' | 'closeOnOverlayClick' | 'closeOnEscape' | 'zIndex' | 'logging'>
> = {
    theme: 'auto',
    closeOnOverlayClick: true,
    closeOnEscape: true,
    zIndex: 999999,
    logging: false,
}

export type WebUIView =
    | 'idle'
    | 'login'
    | 'transact'
    | 'prompt'
    | 'error'
    | 'sk-consent'
    | 'sk-conflict'
    | 'sk-mismatch'
    | 'sk-remove'

export type TransactStage =
    | 'preparing'
    | 'signing'
    | 'signed'
    | 'broadcasting'
    | 'confirming'
    | 'complete'
