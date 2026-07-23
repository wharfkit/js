import SessionKit, {Chains, getPluginTranslations} from '@wharfkit/session'
import {WalletPluginAnchor} from '@wharfkit/wallet-plugin-anchor'
import {WalletPluginWebAuthenticator} from '@wharfkit/wallet-plugin-web-authenticator'
import {WalletPluginMetaMask} from '@wharfkit/wallet-plugin-metamask'
import {WalletPluginPrivateKey} from '@wharfkit/wallet-plugin-privatekey'
import {TransactPluginResourceProvider} from '@wharfkit/transact-plugin-resource-provider'
import {WebUI} from '../src/index'

const logEl = document.getElementById('log')!

function log(msg: string, type?: 'success' | 'error') {
    const entry = document.createElement('div')
    entry.className = `log-entry${type ? ` ${type}` : ''}`
    entry.textContent = `${new Date().toLocaleTimeString()} ${msg}`
    logEl.appendChild(entry)
    logEl.scrollTop = logEl.scrollHeight
}

const webUI = new WebUI({
    logging: true,
    theme: 'auto',
})

// Register real plugin catalogs (as SessionKit does) so the mock prompts below localize.
const anchorPlugin = new WalletPluginAnchor()
const resourceProviderPlugin = new TransactPluginResourceProvider()
for (const plugin of [anchorPlugin, resourceProviderPlugin]) {
    webUI.addTranslations(getPluginTranslations(plugin))
}

const sessionKit = new SessionKit(
    {
        appName: 'WebUI Dev',
        chains: [Chains.Jungle4],
        ui: webUI,
        walletPlugins: [
            anchorPlugin,
            new WalletPluginWebAuthenticator({
                urls: {
                    '73e4385a2708e6d7048834fbc1079f2fabb17b3c125b146af438971e90716c4d':
                        'http://jungle4-account.unicove.com',
                },
            }),
            new WalletPluginMetaMask(),
            new WalletPluginPrivateKey('5Jtoxgny5tT7NiNFp1MLogviuPJ9NniWjnU4wKzaX4t7pL4kJ8s'),
        ],
    },
    {
        sessionKey: {
            whitelist: [
                {
                    contract: 'eosio.token',
                    actions: ['transfer'],
                },
            ],
        },
    }
)

let session: Awaited<ReturnType<typeof sessionKit.login>>['session'] | null = null

const skLoggedOut = document.getElementById('sk-logged-out')!
const skLoggedIn = document.getElementById('sk-logged-in')!
const skSessionInfo = document.getElementById('sk-session-info')!
const skKeyStatus = document.getElementById('sk-key-status')!
const btnSetupKey = document.getElementById('btn-sk-setup-key')!
const btnRemoveKey = document.getElementById('btn-sk-remove-key')!

async function updateSessionUI() {
    if (session) {
        skLoggedOut.style.display = 'none'
        skLoggedIn.style.display = ''
        skSessionInfo.textContent = `${session.actor}@${session.permission} on ${session.chain.name}`

        const hasKey = session.hasSessionKey()
        if (hasKey) {
            skKeyStatus.textContent = 'Session key active'
            skKeyStatus.className = 'sk-status active'
            btnSetupKey.style.display = 'none'
            btnRemoveKey.style.display = ''
        } else {
            skKeyStatus.textContent = ''
            skKeyStatus.className = 'sk-status'
            btnSetupKey.style.display = ''
            btnRemoveKey.style.display = 'none'
        }
    } else {
        skLoggedOut.style.display = ''
        skLoggedIn.style.display = 'none'
        skSessionInfo.textContent = ''
        skKeyStatus.textContent = ''
        skKeyStatus.className = 'sk-status'
    }
}

// ---------------------------------------------------------------------------
//  SessionKit (Real Plugins)
// ---------------------------------------------------------------------------

document.getElementById('btn-sk-login')!.addEventListener('click', async () => {
    log('SessionKit: Starting login...')
    try {
        const result = await sessionKit.login()
        session = result.session
        updateSessionUI()
        log(
            `Logged in as ${session.actor}@${session.permission} on ${session.chain.name}`,
            'success'
        )
    } catch (e: any) {
        log(`Login failed: ${e.message}`, 'error')
    }
})

document.getElementById('btn-sk-transact')!.addEventListener('click', async () => {
    if (!session) return
    log('SessionKit: Starting transact...')
    try {
        const result = await session.transact({
            action: {
                account: 'eosio.token',
                name: 'transfer',
                authorization: [session.permissionLevel],
                data: {
                    from: session.actor,
                    to: 'teamgreymass',
                    quantity: '0.0001 EOS',
                    memo: 'web-ui dev test',
                },
            },
        })
        log(`Transaction complete: ${result.response?.transaction_id}`, 'success')
    } catch (e: any) {
        log(`Transaction failed: ${e.message}`, 'error')
    }
})

document.getElementById('btn-sk-logout')!.addEventListener('click', async () => {
    if (!session) return
    log('SessionKit: Logging out...')
    try {
        await sessionKit.logout(session)
        session = null
        updateSessionUI()
        log('Logged out', 'success')
    } catch (e: any) {
        log(`Logout failed: ${e.message}`, 'error')
    }
})

btnSetupKey.addEventListener('click', async () => {
    if (!session) return
    log('Setting up session key...')
    try {
        const result = await session.setupSessionKey()
        log(`Session key created: ${result.permission}`, 'success')
        updateSessionUI()
    } catch (e: any) {
        log(`Session key setup failed: ${e.message}`, 'error')
    }
})

btnRemoveKey.addEventListener('click', async () => {
    if (!session) return
    log('Removing session key...')
    try {
        await session.removeSessionKey()
        log('Session key removed', 'success')
        updateSessionUI()
    } catch (e: any) {
        log(`Session key removal failed: ${e.message}`, 'error')
    }
})

// ---------------------------------------------------------------------------
//  Mock Flows (Direct WebUI API)
// ---------------------------------------------------------------------------

const mockWalletPlugins = [
    {
        id: 'anchor',
        metadata: {
            name: 'Anchor',
            description: 'Anchor Wallet',
            logo: undefined,
        },
    },
    {
        id: 'web-authenticator',
        metadata: {
            name: 'Web Authenticator',
            description: 'Web Authenticator',
            logo: undefined,
        },
    },
    {
        id: 'metamask',
        metadata: {
            name: 'MetaMask',
            description: 'MetaMask Wallet',
            logo: undefined,
        },
    },
]

document.getElementById('btn-mock-login')!.addEventListener('click', async () => {
    log('Mock: Starting login flow...')
    try {
        const result = await webUI.login({
            walletPlugins: mockWalletPlugins,
            chains: [],
        } as any)
        log(`Login result: wallet index ${result.walletPluginIndex}`, 'success')
    } catch (e: any) {
        log(`Login cancelled: ${e.message}`, 'error')
    }
})

document.getElementById('btn-mock-transact')!.addEventListener('click', async () => {
    log('Mock: Starting transact flow...')
    await webUI.onTransact()

    setTimeout(async () => {
        await webUI.onSign()
        log('Signing...')
    }, 1000)

    setTimeout(async () => {
        await webUI.onSignComplete()
        await webUI.onBroadcast()
        log('Broadcasting...')
    }, 3000)

    setTimeout(async () => {
        await webUI.onBroadcastComplete()
    }, 4000)

    setTimeout(async () => {
        await webUI.onTransactComplete()
        log('Transaction complete', 'success')
    }, 5000)
})

document.getElementById('btn-mock-error')!.addEventListener('click', async () => {
    log('Mock: Triggering error...')
    await webUI.onError(new Error('Network request failed: unable to reach API endpoint'))
})

// ---------------------------------------------------------------------------
//  Mock Prompts
// ---------------------------------------------------------------------------

document.getElementById('btn-prompt-fee')!.addEventListener('click', () => {
    log('Prompt: Resource fee...')
    const t = webUI.getTranslate(resourceProviderPlugin.id)
    const result = webUI.prompt({
        title: t('fee.title', {default: 'Accept Transaction Fee?'}),
        body: t('fee.body', {
            default:
                'Additional resources ({{resource}}) are required for your account to perform this transaction. Would you like to automatically purchase these resources and proceed?',
            resource: 'CPU/NET',
        }),
        elements: [
            {
                type: 'asset',
                data: {
                    label: t('fee.cost', {default: 'Cost of {{resource}}', resource: 'CPU/NET'}),
                    value: '0.0102 WAX',
                },
            },
            {
                type: 'accept',
            },
        ],
    })
    result.then(
        () => log('Fee accepted', 'success'),
        (e: any) => log(`Fee declined: ${e.message}`, 'error')
    )
})

document.getElementById('btn-prompt-finality')!.addEventListener('click', () => {
    log('Prompt: Finality...')
    const end = new Date(Date.now() + 180 * 1000).toISOString()
    const result = webUI.prompt({
        title: 'Transaction is not yet final',
        body: 'Your transaction has been broadcasted to the network, but is still reversible.',
        elements: [
            {
                type: 'countdown',
                data: {
                    label: 'Finality expected in:',
                    end,
                },
            },
        ],
    })
    result.then(
        () => log('Finality acknowledged', 'success'),
        (e: any) => log(`Finality dismissed: ${e.message}`, 'error')
    )
})

document.getElementById('btn-prompt-anchor')!.addEventListener('click', () => {
    log('Prompt: Anchor sign (same device)...')
    const t = webUI.getTranslate(anchorPlugin.id)
    const end = new Date(Date.now() + 120 * 1000).toISOString()
    const result = webUI.prompt({
        title: t('transact.title', {default: 'Complete using Anchor'}),
        body: t('transact.body', {
            default:
                'Please open your Anchor Wallet on "{{channelName}}" to review and approve this transaction.',
            channelName: 'MacBook Pro',
        }),
        elements: [
            {
                type: 'countdown',
                data: {
                    label: t('transact.await', {default: 'Waiting for response from Anchor'}),
                    end,
                },
            },
            {
                type: 'link',
                data: {
                    button: true,
                    variant: 'primary',
                    label: t('transact.link', {default: 'Trigger Manually'}),
                    href: 'esr://example',
                },
            },
        ],
    })
    result.then(
        () => log('Anchor sign completed', 'success'),
        (e: any) => log(`Anchor sign cancelled: ${e.message}`, 'error')
    )
})

document.getElementById('btn-prompt-anchor-qr')!.addEventListener('click', () => {
    log('Prompt: Anchor sign (another device)...')
    const t = webUI.getTranslate(anchorPlugin.id)
    const end = new Date(Date.now() + 120 * 1000).toISOString()
    const result = webUI.prompt({
        title: t('login.title', {default: 'Connect with Anchor'}),
        body: t('login.body', {
            default:
                'Scan with Anchor on your mobile device or click the button below to open on this device.',
        }),
        elements: [
            {
                type: 'qr',
                data: 'esr://gmNgZGBY1mTC_MoglIGBIVzX5uxZRqAQGMGBEENiGRkBAA',
            },
            {
                type: 'countdown',
                data: {
                    label: t('transact.await', {default: 'Waiting for response from Anchor'}),
                    end,
                },
            },
            {
                type: 'link',
                data: {
                    button: false,
                    label: t('login.link', {default: 'Launch Anchor'}),
                    href: 'esr://example',
                },
            },
        ],
    })
    result.then(
        () => log('Anchor QR sign completed', 'success'),
        (e: any) => log(`Anchor QR sign cancelled: ${e.message}`, 'error')
    )
})

// ---------------------------------------------------------------------------
//  Mock Session Keys
// ---------------------------------------------------------------------------

document.getElementById('btn-sk-consent')!.addEventListener('click', async () => {
    log('Session Key: Consent (specific actions)...')
    const result = await webUI.onSessionKeyConsent({
        appName: 'Alcor Exchange',
        whitelist: [
            {
                contract: 'eosio.token',
                actions: ['transfer', 'open'],
            },
            {
                contract: 'alcordexmain',
                actions: ['buyreceipt', 'sellreceipt', 'cancelorder'],
            },
        ],
    })
    log(`Consent result: ${result ? 'approved' : 'denied'}`, result ? 'success' : 'error')
})

document.getElementById('btn-sk-consent-all')!.addEventListener('click', async () => {
    log('Session Key: Consent (all actions)...')
    const result = await webUI.onSessionKeyConsent({
        appName: 'My Game',
        whitelist: [
            {
                contract: 'eosio.token',
                actions: ['transfer'],
            },
            {
                contract: 'mygamecontrc',
            },
        ],
    })
    log(`Consent result: ${result ? 'approved' : 'denied'}`, result ? 'success' : 'error')
})

document.getElementById('btn-sk-conflict')!.addEventListener('click', async () => {
    log('Session Key: Conflict...')
    const result = await webUI.onSessionKeyConflict({
        appName: 'Alcor Exchange',
        existingKeyCount: 2,
    })
    log(`Conflict result: ${result}`, result !== 'cancel' ? 'success' : 'error')
})

document.getElementById('btn-sk-mismatch')!.addEventListener('click', async () => {
    log('Session Key: Mismatch...')
    const result = await webUI.onSessionKeyMismatch({
        appName: 'Alcor Exchange',
        added: [
            {
                contract: 'alcordexmain',
                actions: ['cancelorder', 'claimrefund'],
            },
        ],
        removed: [
            {
                contract: 'eosio.token',
                actions: ['open'],
            },
        ],
    })
    log(`Mismatch result: ${result}`, result === 'update' ? 'success' : 'error')
})

document.getElementById('btn-sk-remove')!.addEventListener('click', async () => {
    log('Session Key: Remove...')
    const result = await webUI.onSessionKeyRemove({
        appName: 'Alcor Exchange',
    })
    log(
        `Remove result: ${result ? 'remove and log out' : 'log out only'}`,
        result ? 'success' : 'error'
    )
})

// ---------------------------------------------------------------------------
//  Theme
// ---------------------------------------------------------------------------

document.getElementById('btn-light')!.addEventListener('click', () => {
    log('Theme: light')
    ;(webUI as any).shadow?.host?.setAttribute('data-theme', 'light')
})

document.getElementById('btn-dark')!.addEventListener('click', () => {
    log('Theme: dark')
    ;(webUI as any).shadow?.host?.setAttribute('data-theme', 'dark')
})

document.getElementById('btn-auto')!.addEventListener('click', () => {
    log('Theme: auto')
    ;(webUI as any).shadow?.host?.removeAttribute('data-theme')
})

const localeSelect = document.getElementById('locale-select') as HTMLSelectElement
localeSelect.value = webUI.getLocale()
localeSelect.addEventListener('change', () => {
    webUI.setLocale(localeSelect.value)
    log(`Locale: ${webUI.getLocale()} (open a flow after switching to see plugin strings)`)
})

sessionKit.restore().then((restored) => {
    if (restored) {
        session = restored
        updateSessionUI()
        log(`Restored session: ${session.actor}@${session.permission}`, 'success')
    }
})

log('WebUI initialized with SessionKit')
