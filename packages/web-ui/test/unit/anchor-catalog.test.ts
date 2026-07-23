import {WalletPluginAnchor} from '@wharfkit/wallet-plugin-anchor'
import {expect, test} from 'vitest'

import {WebUI} from '../../src/web-ui'

function prefixed(plugin: {id: string; translations?: Record<string, any>}) {
    const out: Record<string, any> = {}
    for (const [lang, data] of Object.entries(plugin.translations ?? {})) {
        out[lang] = {[plugin.id]: data}
    }
    return out
}

// installed @wharfkit/wallet-plugin-anchor ships empty ko/zh-Hant catalogs; zh-Hans is populated
test('anchor plugin strings resolve in zh-Hans', () => {
    const plugin = new WalletPluginAnchor()
    const ui = new WebUI({locale: 'zh-Hans'})
    ui.addTranslations(prefixed(plugin))

    const t = ui.getTranslate(plugin.id)
    const body = t('transact.body', {
        default: 'Please open your Anchor Wallet on "{{channelName}}" to review…',
        channelName: 'iPhone',
    })

    expect(body).not.toContain('{{channelName}}')
    expect(body).toContain('iPhone')
    expect(body).not.toBe('Please open your Anchor Wallet on "iPhone" to review…')
})
