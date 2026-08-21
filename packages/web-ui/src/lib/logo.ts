interface LogoLike {
    getVariant?: (variant: 'light' | 'dark') => string | undefined
}

// Falls back to the opposite variant so a single-variant logo still renders.
export function logoSource(
    logo: LogoLike | string | undefined,
    variant: 'light' | 'dark'
): string | undefined {
    if (!logo) return undefined
    if (typeof logo === 'string') return logo
    const opposite = variant === 'dark' ? 'light' : 'dark'
    return logo.getVariant?.(variant) ?? logo.getVariant?.(opposite) ?? String(logo)
}
