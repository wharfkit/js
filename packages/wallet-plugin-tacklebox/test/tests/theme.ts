import {assert} from 'chai'

import {applyModalTheme, tackleboxModalStyles} from '$lib'

function makeFakeRenderer() {
    const styles: any[] = []
    const attributes = new Map<string, string>()
    return {
        styles,
        attributes,
        ui: {
            shadow: {
                getElementById: (id: string) => styles.find((s) => s.id === id) || null,
                appendChild: (node: any) => styles.push(node),
            },
            element: {
                setAttribute: (key: string, value: string) => attributes.set(key, value),
                removeAttribute: (key: string) => attributes.delete(key),
            },
        },
    }
}

suite('modal theme', function () {
    setup(function () {
        ;(global as any).document = {
            createElement: () => ({id: '', textContent: ''}),
        }
    })

    teardown(function () {
        delete (global as any).document
    })

    test('styles carry the TackleBox palette, scoped to the host attribute', function () {
        assert.include(tackleboxModalStyles, ':host([data-tacklebox]) dialog')
        assert.include(tackleboxModalStyles, '#00e0ff', 'cyan light lines')
        assert.include(tackleboxModalStyles, '#04070c', 'void navy')
        assert.notInclude(tackleboxModalStyles, '.svelte-', 'no build-hashed selectors')
    })

    test('applies the theme to the web renderer while a prompt is up', function () {
        const fake = makeFakeRenderer()
        const revert = applyModalTheme(fake.ui)

        assert.isTrue(fake.attributes.has('data-tacklebox'))
        assert.equal(fake.styles.length, 1)
        assert.equal(fake.styles[0].id, 'wallet-plugin-tacklebox-theme')
        assert.include(fake.styles[0].textContent, '--body-background-color')

        revert()
        assert.isFalse(fake.attributes.has('data-tacklebox'))
    })

    test('injects the stylesheet only once across prompts', function () {
        const fake = makeFakeRenderer()
        applyModalTheme(fake.ui)()
        applyModalTheme(fake.ui)()
        assert.equal(fake.styles.length, 1)
    })

    test('keeps the attribute while any overlapping prompt is active', function () {
        const fake = makeFakeRenderer()
        const revertLogin = applyModalTheme(fake.ui)
        const revertSign = applyModalTheme(fake.ui)

        revertLogin()
        assert.isTrue(fake.attributes.has('data-tacklebox'), 'second prompt still active')
        revertSign()
        assert.isFalse(fake.attributes.has('data-tacklebox'))

        // A stale double-revert must not strip a newly applied theme.
        const revertAgain = applyModalTheme(fake.ui)
        revertSign()
        assert.isTrue(fake.attributes.has('data-tacklebox'))
        revertAgain()
    })

    test('degrades to a no-op for other user interfaces', function () {
        assert.doesNotThrow(() => applyModalTheme({})())
        assert.doesNotThrow(() => applyModalTheme(undefined)())
        assert.doesNotThrow(() => applyModalTheme({shadow: {}, element: {}})())
    })
})
