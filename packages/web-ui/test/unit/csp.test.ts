import {readFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {expect, test} from 'vitest'

const libDir = resolve(process.cwd(), 'lib')
const bundles = ['web-ui.m.js', 'web-ui.cjs'].map((name) => ({
    name,
    code: readFileSync(resolve(libDir, name), 'utf8'),
}))

// The lookbehind spares `removeAttribute('style')` — the style attribute is a separate, permitted directive.
test('no bundle ever creates a style element', () => {
    for (const {name, code} of bundles) {
        expect(code, `${name} creates a <style> element`).not.toMatch(
            /(?<!Attribute)\(\s*['"]style['"]\s*\)/
        )
    }
})

test('styles are adopted as constructed stylesheets', () => {
    for (const {name, code} of bundles) {
        expect(code, `${name} never adopts a stylesheet`).toContain('adoptedStyleSheets')
    }
})

// Components mount lazily, so cover an eager one (Modal) and two that only appear mid-flow.
const componentSelectors = [
    /\.web-ui-overlay\.svelte-/,
    /\.qr-container\.svelte-/,
    /\.spinner\.svelte-/,
]

test('component styles are inlined as CSS text', () => {
    for (const {name, code} of bundles) {
        for (const selector of componentSelectors) {
            expect(code, `${name} is missing component CSS: ${selector}`).toMatch(selector)
        }
        expect(code, `${name} is missing the theme sheet`).toContain('--web-ui-bg')
    }
})
