import {afterEach, expect, test, vi} from 'vitest'

import {detectLocale, normalizeLocale, sourceLocale, supportedLocales} from '../../src/lib/locale'

afterEach(() => {
    vi.unstubAllGlobals()
})

test('exact ids pass through', () => {
    for (const locale of supportedLocales) {
        expect(normalizeLocale(locale)).toBe(locale)
    }
})

test('case and region are folded away', () => {
    expect(normalizeLocale('EN')).toBe('en')
    expect(normalizeLocale('en-US')).toBe('en')
    expect(normalizeLocale('ko-KR')).toBe('ko')
    expect(normalizeLocale('tr-TR')).toBe('tr')
    expect(normalizeLocale('  ko  ')).toBe('ko')
})

test('chinese variants map to script-specific ids', () => {
    expect(normalizeLocale('zh')).toBe('zh-Hans')
    expect(normalizeLocale('zh-cn')).toBe('zh-Hans')
    expect(normalizeLocale('zh-SG')).toBe('zh-Hans')
    expect(normalizeLocale('zh-Hans')).toBe('zh-Hans')
    expect(normalizeLocale('zh-Hans-CN')).toBe('zh-Hans')
    expect(normalizeLocale('zh-tw')).toBe('zh-Hant')
    expect(normalizeLocale('zh-HK')).toBe('zh-Hant')
    expect(normalizeLocale('zh-Hant')).toBe('zh-Hant')
    expect(normalizeLocale('zh-Hant-TW')).toBe('zh-Hant')
})

test('unknown chinese subtags default to simplified', () => {
    expect(normalizeLocale('zh-mo')).toBe('zh-Hans')
})

test('unsupported and empty input returns undefined', () => {
    expect(normalizeLocale('de')).toBeUndefined()
    expect(normalizeLocale('')).toBeUndefined()
    expect(normalizeLocale('   ')).toBeUndefined()
    expect(normalizeLocale(null)).toBeUndefined()
    expect(normalizeLocale(undefined)).toBeUndefined()
})

test('detectLocale falls back to the source locale without a navigator', () => {
    vi.stubGlobal('navigator', undefined)
    expect(detectLocale()).toBe(sourceLocale)
})

test('detectLocale matches a supported language from navigator.languages', () => {
    vi.stubGlobal('navigator', {languages: ['fr-FR', 'ko-KR'], language: 'fr-FR'})
    expect(detectLocale()).toBe('ko')
})

test('detectLocale falls back to the source locale when nothing matches', () => {
    vi.stubGlobal('navigator', {languages: ['fr-FR', 'de-DE'], language: 'fr-FR'})
    expect(detectLocale()).toBe(sourceLocale)
})
