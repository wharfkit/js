import {beforeEach, expect, test} from 'vitest'

import {WebUI} from '../../src/web-ui'
import {uiState} from '../../src/ui/stores/state.svelte'

beforeEach(() => {
    uiState.reset()
    uiState.minimal = false
})

test('minimal defaults to off and is settable via options', () => {
    expect(new WebUI().getMinimal()).toBe(false)
    expect(new WebUI({minimal: true}).getMinimal()).toBe(true)
})

test('minimal suppresses the transact view', async () => {
    const ui = new WebUI({minimal: true})
    await ui.onTransact()
    expect(uiState.view).toBe('idle')
    expect(uiState.active).toBe(false)
})

test('minimal suppresses the error view', async () => {
    const ui = new WebUI({minimal: true})
    await ui.onError(new Error('overdrawn balance'))
    expect(uiState.view).toBe('idle')
    expect(uiState.active).toBe(false)
})

test('minimal suppresses optional prompts but renders required ones', () => {
    const ui = new WebUI({minimal: true})
    ui.prompt({title: 'Optional', optional: true})
    expect(uiState.active).toBe(false)

    ui.prompt({title: 'Required'})
    expect(uiState.active).toBe(true)
    expect(uiState.view).toBe('prompt')
    expect(uiState.promptTitle).toBe('Required')
})

test('minimal still renders session key consent', async () => {
    const ui = new WebUI({minimal: true})
    ui.onSessionKeyConsent({appName: 'Unicove', whitelist: []})
    expect(uiState.view).toBe('sk-consent')
    expect(uiState.active).toBe(true)
})

test('non-minimal renders the transact and error views', async () => {
    const ui = new WebUI()
    await ui.onTransact()
    expect(uiState.view).toBe('transact')
    expect(uiState.active).toBe(true)

    await ui.onError(new Error('overdrawn balance'))
    expect(uiState.view).toBe('error')
})
