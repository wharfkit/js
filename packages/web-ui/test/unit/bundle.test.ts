import {readFileSync, readdirSync} from 'node:fs'
import {resolve} from 'node:path'
import {expect, test} from 'vitest'

const libDir = resolve(process.cwd(), 'lib')

test('lib contains exactly the three published artifacts', () => {
    expect(readdirSync(libDir).sort()).toEqual(['web-ui.cjs', 'web-ui.d.ts', 'web-ui.m.js'])
})

// "Permission Request" compiled per-locale, so a dropped catalog (not just a dropped bundle) is caught.
const permissionRequestByLocale: Record<string, string> = {
    en: 'Permission Request',
    ko: '권한 요청',
    'zh-Hans': '权限请求',
    'zh-Hant': '權限請求',
    tr: 'İzin İsteği',
}

test('catalogs are inlined, not code-split', () => {
    const esm = readFileSync(resolve(libDir, 'web-ui.m.js'), 'utf8')
    expect(esm).not.toMatch(/\bimport\(/)
    for (const [locale, text] of Object.entries(permissionRequestByLocale)) {
        expect(esm, `missing ${locale} catalog string`).toContain(text)
    }
})
