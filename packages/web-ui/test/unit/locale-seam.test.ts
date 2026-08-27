import {expect, test} from 'vitest'

import {WebUI} from '../../src/web-ui'
import {humanizeError} from '../../src/lib/errors'
import {getRuntime} from '../../src/locales/main.loader.svelte.js'

// Regression: WebUI.applyLocale() must drive every wuchale adapter, not just one.
// Deleting either call strands half the UI in the previous locale with no test failing.

test('WebUI setLocale drives the js (errors) loader', () => {
    const ui = new WebUI({locale: 'en'})
    expect(humanizeError(new Error('user cancelled')).message).toBe('The request was cancelled.')
    ui.setLocale('ko')
    expect(humanizeError(new Error('user cancelled')).message).toBe('요청이 취소되었습니다.')
})

test('WebUI setLocale drives the main (svelte) loader', () => {
    const catalogs = {en: {c: ['EN']}, ko: {c: ['KO']}}
    const ui = new WebUI({locale: 'en'})
    expect(getRuntime(catalogs)(0)).toBe('EN')
    ui.setLocale('ko')
    expect(getRuntime(catalogs)(0)).toBe('KO')
})
