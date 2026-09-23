import {Asset, Session, SessionKit} from '@wharfkit/session'
import {WebRenderer} from '@wharfkit/web-renderer'
import {WalletPluginTackleBox} from 'wallet-plugin-tacklebox'

// Core token per supported chain, for the self-transfer demo action.
const CORE_TOKEN: Record<string, {contract: string; symbol: string}> = {
    // Jungle4 testnet - the recommended chain for a first run.
    '73e4385a2708e6d7048834fbc1079f2fabb17b3c125b146af438971e90716c4d': {
        contract: 'eosio.token',
        symbol: '4,EOS',
    },
    // EOS / Vaulta
    aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906: {
        contract: 'eosio.token',
        symbol: '4,EOS',
    },
    // WAX
    '1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4': {
        contract: 'eosio.token',
        symbol: '8,WAX',
    },
    // Telos
    '4667b205c6838ef70ff7988f6e8257e8be0e1284a2f59699054a018f743b1d11': {
        contract: 'eosio.token',
        symbol: '4,TLOS',
    },
}

const sessionKit = new SessionKit({
    appName: 'tacklebox-example',
    chains: [
        {
            id: '73e4385a2708e6d7048834fbc1079f2fabb17b3c125b146af438971e90716c4d',
            url: 'https://jungle4.greymass.com',
        },
        {
            id: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
            url: 'https://eos.greymass.com',
        },
        {
            id: '1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4',
            url: 'https://wax.greymass.com',
        },
        {
            id: '4667b205c6838ef70ff7988f6e8257e8be0e1284a2f59699054a018f743b1d11',
            url: 'https://telos.greymass.com',
        },
    ],
    ui: new WebRenderer(),
    walletPlugins: [new WalletPluginTackleBox()],
})

let session: Session | undefined

const el = (id: string) => document.getElementById(id) as HTMLButtonElement
const output = document.getElementById('output') as HTMLPreElement
const status = document.getElementById('status') as HTMLDivElement

function render() {
    if (session) {
        status.textContent = `Logged in as ${session.actor}@${session.permission} (chain ${String(
            session.chain.id
        ).slice(0, 8)}…)`
    } else {
        status.textContent = 'Not logged in.'
    }
    el('login').disabled = Boolean(session)
    el('transfer').disabled = !session
    el('logout').disabled = !session
}

function show(value: unknown) {
    output.textContent =
        value instanceof Error ? `Error: ${value.message}` : JSON.stringify(value, null, 2)
}

el('login').addEventListener('click', async () => {
    try {
        const result = await sessionKit.login()
        session = result.session
        show({connected: String(result.response.permissionLevel)})
    } catch (error) {
        show(error)
    }
    render()
})

el('logout').addEventListener('click', async () => {
    if (session) {
        await sessionKit.logout(session)
        session = undefined
        show('Logged out.')
    }
    render()
})

el('transfer').addEventListener('click', async () => {
    if (!session) return
    const core = CORE_TOKEN[String(session.chain.id)]
    if (!core) {
        show(new Error('No core token configured for this chain'))
        return
    }
    try {
        const result = await session.transact({
            action: {
                account: core.contract,
                name: 'transfer',
                authorization: [session.permissionLevel],
                data: {
                    from: session.actor,
                    to: session.actor,
                    quantity: Asset.fromUnits(1, core.symbol),
                    memo: 'wallet-plugin-tacklebox example',
                },
            },
        })
        show({
            transaction_id: result.resolved?.transaction.id
                ? String(result.resolved.transaction.id)
                : undefined,
            signatures: result.signatures.map(String),
        })
    } catch (error) {
        show(error)
    }
})

sessionKit.restore().then((restored) => {
    if (restored) {
        session = restored
        show('Session restored.')
    }
    render()
})

render()
