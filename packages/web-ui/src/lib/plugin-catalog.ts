import type {LocaleDefinitions} from '@wharfkit/common'
import type {UserInterfaceTranslateOptions} from '@wharfkit/session'

import type {SupportedLocale} from './locale.js'
import {normalizeLocale, sourceLocale} from './locale.js'

type CatalogNode = Record<string, unknown>

const PLACEHOLDER = /\{\{\s*([\w.]+)\s*\}\}/g

function isPlainObject(value: unknown): value is CatalogNode {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function deepMerge(target: CatalogNode, source: CatalogNode): CatalogNode {
    for (const [key, value] of Object.entries(source)) {
        const existing = target[key]
        if (isPlainObject(value) && isPlainObject(existing)) {
            deepMerge(existing, value)
        } else if (isPlainObject(value)) {
            target[key] = deepMerge({}, value)
        } else {
            target[key] = value
        }
    }
    return target
}

export function interpolate(template: string, params?: Record<string, unknown>): string {
    if (!params) return template
    return template.replace(PLACEHOLDER, (match, name: string) => {
        if (name === 'default') return match
        const value = params[name]
        return value === undefined || value === null ? match : String(value)
    })
}

export class PluginCatalog {
    private locales: Partial<Record<SupportedLocale, CatalogNode>> = {}

    merge(defs: LocaleDefinitions): void {
        if (!isPlainObject(defs)) return
        for (const [tag, data] of Object.entries(defs)) {
            const locale = normalizeLocale(tag)
            if (!locale || !isPlainObject(data)) continue
            const existing = this.locales[locale] ?? {}
            this.locales[locale] = deepMerge(existing, data)
        }
    }

    translate(
        locale: SupportedLocale,
        key: string,
        options?: UserInterfaceTranslateOptions,
        namespace?: string
    ): string {
        const path = namespace ? `${namespace}.${key}` : key
        const found = this.lookup(locale, path) ?? this.lookup(sourceLocale, path)
        return interpolate(found ?? options?.default ?? path, options)
    }

    private lookup(locale: SupportedLocale, path: string): string | undefined {
        let node: unknown = this.locales[locale]
        for (const segment of path.split('.')) {
            if (!isPlainObject(node)) return undefined
            node = node[segment]
        }
        return typeof node === 'string' ? node : undefined
    }
}
