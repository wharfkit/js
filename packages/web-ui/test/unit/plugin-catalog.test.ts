import {Name} from '@wharfkit/antelope'
import {expect, test} from 'vitest'

import {PluginCatalog, interpolate} from '../../src/lib/plugin-catalog'

test('interpolate substitutes params and coerces values', () => {
    expect(interpolate('Open {{channelName}}', {channelName: 'iPhone'})).toBe('Open iPhone')
    expect(interpolate('Hi {{ name }}', {name: 'a'})).toBe('Hi a')
    expect(interpolate('Signed by {{name}}', {name: Name.from('teamgreymass')})).toBe(
        'Signed by teamgreymass'
    )
})

test('interpolate leaves unmatched placeholders intact', () => {
    expect(interpolate('Open {{channelName}}', {})).toBe('Open {{channelName}}')
    expect(interpolate('Open {{channelName}}')).toBe('Open {{channelName}}')
})

test('translate resolves a namespaced dot path at the active locale', () => {
    const catalog = new PluginCatalog()
    catalog.merge({ko: {anchor: {transact: {body: '請開啟 {{channelName}}'}}}})
    expect(
        catalog.translate('ko', 'transact.body', {default: 'x', channelName: 'iPhone'}, 'anchor')
    ).toBe('請開啟 iPhone')
})

test('translate falls back through en, then default, then the key', () => {
    const catalog = new PluginCatalog()
    catalog.merge({en: {anchor: {login: {title: 'Connect with Anchor'}}}})

    // active locale missing -> plugin's en entry
    expect(catalog.translate('tr', 'login.title', {default: 'ignored'}, 'anchor')).toBe(
        'Connect with Anchor'
    )
    // nothing in any catalog -> options.default
    expect(catalog.translate('tr', 'login.body', {default: 'Scan the code'}, 'anchor')).toBe(
        'Scan the code'
    )
    // no catalog entry and no default -> namespaced key
    expect(catalog.translate('tr', 'login.body', undefined, 'anchor')).toBe('anchor.login.body')
})

test('translate works without a namespace', () => {
    const catalog = new PluginCatalog()
    catalog.merge({ko: {cancel: '취소'}})
    expect(catalog.translate('ko', 'cancel', {default: 'Cancel'})).toBe('취소')
})

test('merge normalizes locale keys and deep-merges, last write winning', () => {
    const catalog = new PluginCatalog()
    catalog.merge({'zh-hans': {anchor: {login: {title: '一'}, transact: {title: '二'}}}})
    catalog.merge({'zh-CN': {anchor: {login: {title: '三'}}}})

    expect(catalog.translate('zh-Hans', 'login.title', undefined, 'anchor')).toBe('三')
    expect(catalog.translate('zh-Hans', 'transact.title', undefined, 'anchor')).toBe('二')
})

test('merge discards unsupported locales and malformed input', () => {
    const catalog = new PluginCatalog()
    catalog.merge({de: {anchor: {login: {title: 'Verbinden'}}}})
    catalog.merge({'': {anchor: {login: {title: 'nope'}}}})
    expect(catalog.translate('en', 'login.title', {default: 'Connect'}, 'anchor')).toBe('Connect')
})

test('a dot path landing on a non-string is ignored', () => {
    const catalog = new PluginCatalog()
    catalog.merge({en: {anchor: {login: {title: 'Connect'}}}})
    expect(catalog.translate('en', 'login', {default: 'fallback'}, 'anchor')).toBe('fallback')
})
