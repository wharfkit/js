import {afterEach, expect, test, vi} from 'vitest'

import {WebUI} from '../../src/web-ui'

afterEach(() => {
    vi.unstubAllGlobals()
})

const anchorKo = {ko: {anchor: {transact: {body: '請開啟 {{channelName}}'}}}}

test('locale option is normalized, unsupported explicit tags fall back to the source locale', () => {
    vi.stubGlobal('navigator', undefined)
    expect(new WebUI({locale: 'ko-KR'}).getLocale()).toBe('ko')
    expect(new WebUI({locale: 'zh-TW'}).getLocale()).toBe('zh-Hant')
    expect(new WebUI({locale: 'de'}).getLocale()).toBe('en')
    expect(new WebUI().getLocale()).toBe('en')
})

test('an explicit unsupported tag resolves to the source locale, never navigator detection', () => {
    vi.stubGlobal('navigator', {languages: ['ko-KR'], language: 'ko-KR'})
    expect(new WebUI({locale: 'de'}).getLocale()).toBe('en')
    expect(new WebUI().getLocale()).toBe('ko')
})

test('getTranslate resolves plugin strings at the active locale', () => {
    const ui = new WebUI({locale: 'ko'})
    ui.addTranslations(anchorKo)
    const t = ui.getTranslate('anchor')
    expect(t('transact.body', {default: 'Open {{channelName}}', channelName: 'iPhone'})).toBe(
        '請開啟 iPhone'
    )
})

test('untranslated locales fall back to the inline default', () => {
    const ui = new WebUI({locale: 'tr'})
    ui.addTranslations(anchorKo)
    const t = ui.getTranslate('anchor')
    expect(t('transact.body', {default: 'Open {{channelName}}', channelName: 'iPhone'})).toBe(
        'Open iPhone'
    )
})

test('setLocale changes subsequent resolutions', () => {
    const ui = new WebUI({locale: 'tr'})
    ui.addTranslations(anchorKo)
    const t = ui.getTranslate('anchor')
    expect(t('transact.body', {default: 'Open {{channelName}}', channelName: 'iPhone'})).toBe(
        'Open iPhone'
    )

    ui.setLocale('ko')
    expect(ui.getLocale()).toBe('ko')
    expect(t('transact.body', {default: 'Open {{channelName}}', channelName: 'iPhone'})).toBe(
        '請開啟 iPhone'
    )

    ui.setLocale('nonsense')
    expect(ui.getLocale()).toBe('en')
})

test('translate without a namespace still works', () => {
    const ui = new WebUI({locale: 'ko'})
    ui.addTranslations({ko: {cancel: '취소'}})
    expect(ui.translate('cancel', {default: 'Cancel'})).toBe('취소')
})
