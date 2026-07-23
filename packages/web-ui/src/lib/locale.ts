export const supportedLocales = ['en', 'ko', 'zh-Hans', 'zh-Hant', 'tr'] as const

export type SupportedLocale = (typeof supportedLocales)[number]

export const sourceLocale: SupportedLocale = 'en'

const zhVariants: Record<string, SupportedLocale> = {
    'zh-cn': 'zh-Hans',
    'zh-sg': 'zh-Hans',
    'zh-hans': 'zh-Hans',
    'zh-tw': 'zh-Hant',
    'zh-hk': 'zh-Hant',
    'zh-hant': 'zh-Hant',
}

export function normalizeLocale(tag: string | null | undefined): SupportedLocale | undefined {
    if (!tag) return undefined
    const lower = tag.trim().toLowerCase()
    if (!lower) return undefined

    if (lower === 'zh' || lower.startsWith('zh-')) {
        const [, subtag] = lower.split('-')
        return zhVariants[`zh-${subtag}`] ?? 'zh-Hans'
    }

    const base = lower.split('-')[0]
    return supportedLocales.find((locale) => locale.toLowerCase() === base)
}

export function detectLocale(): SupportedLocale {
    if (typeof navigator === 'undefined') return sourceLocale
    const tags = navigator.languages?.length ? navigator.languages : [navigator.language]
    for (const tag of tags) {
        const match = normalizeLocale(tag)
        if (match) return match
    }
    return sourceLocale
}
