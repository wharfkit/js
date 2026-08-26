import {assert} from 'chai'
import {API, Name, PermissionLevel, PrivateKey, Serializer} from '@wharfkit/antelope'

import {
    AbstractWalletPlugin,
    actionMatchesPermission,
    Session,
    SessionKeyConflictResponse,
    SessionKeyManager,
    SessionKeyMismatchResponse,
    SessionKeyWalletPlugin,
    SessionKit,
} from '$lib'
import {abi as systemAbi} from '../../src/sessionkey/systemcontract'

import {
    makeWallet,
    mockChainDefinition,
    mockFetch,
    mockPermissionLevel,
    mockSessionKitArgs,
    MockStorage,
    MockUserInterface,
} from '@wharfkit/mock-data'

class FullSessionKeyUI extends MockUserInterface {
    consent = true
    conflict: SessionKeyConflictResponse = 'add'
    mismatch: SessionKeyMismatchResponse = 'update'
    removeConfirm = true
    async onSessionKeyConsent(): Promise<boolean> {
        return this.consent
    }
    async onSessionKeyConflict(): Promise<SessionKeyConflictResponse> {
        return this.conflict
    }
    async onSessionKeyMismatch(): Promise<SessionKeyMismatchResponse> {
        return this.mismatch
    }
    async onSessionKeyRemove(): Promise<boolean> {
        return this.removeConfirm
    }
}

class NoConsentUI extends MockUserInterface {
    async onSessionKeyConflict(): Promise<SessionKeyConflictResponse> {
        return 'add'
    }
    async onSessionKeyMismatch(): Promise<SessionKeyMismatchResponse> {
        return 'update'
    }
    async onSessionKeyRemove(): Promise<boolean> {
        return true
    }
}

const skConfig = {
    permission: 'sessionkey',
    whitelist: [{contract: 'eosio.token', actions: ['transfer']}],
}

function makePermission(
    keys: string[],
    links: {account: string; action?: string}[] = []
): API.v1.AccountPermission {
    return API.v1.AccountPermission.from({
        perm_name: 'sessionkey',
        parent: 'active',
        required_auth: {
            threshold: 1,
            keys: keys.map((key) => ({key, weight: 1})),
            accounts: [],
            waits: [],
        },
        linked_actions: links.map((l) => ({account: l.account, action: l.action})),
    })
}

function decode(action: any, type: string): any {
    return Serializer.decode({data: action.data, type, abi: systemAbi})
}

async function captureTransacts(fn: () => Promise<any>): Promise<any[]> {
    const captured: any[] = []
    const original = Session.prototype.transact
    ;(Session.prototype as any).transact = async function (args: any) {
        captured.push(args)
        return {}
    }
    try {
        await fn()
    } finally {
        ;(Session.prototype as any).transact = original
    }
    return captured
}

function makeManager(
    overrides: Record<string, any> = {},
    ui = new FullSessionKeyUI()
): SessionKeyManager {
    return new SessionKeyManager({...skConfig, ...overrides}, ui)
}

function makePrimarySession(manager: SessionKeyManager, ui = new FullSessionKeyUI()): Session {
    return new Session(
        {
            chain: mockChainDefinition,
            permissionLevel: PermissionLevel.from(mockPermissionLevel),
            walletPlugin: makeWallet(),
        },
        {fetch: mockFetch, ui, sessionKeyManager: manager, appName: 'unittest'}
    )
}

function makeSessionKeySession(opts: {
    privateKey: PrivateKey
    fetchPermission?: any
    whitelist?: {contract: string; actions?: string[]}[]
}): {session: Session; primaryWallet: any} {
    const ui = new FullSessionKeyUI()
    const primaryWallet = makeWallet()
    const whitelist = opts.whitelist ?? skConfig.whitelist
    const skWallet = new SessionKeyWalletPlugin({
        primaryWallet,
        privateKey: opts.privateKey,
        permission: Name.from('sessionkey'),
        whitelist: whitelist.map((w) => ({
            contract: Name.from(w.contract),
            actions: w.actions?.map((a) => Name.from(a)),
        })),
    })
    const manager = new SessionKeyManager(
        {...skConfig, whitelist, fetchPermission: opts.fetchPermission},
        ui
    )
    const session = new Session(
        {
            chain: mockChainDefinition,
            permissionLevel: PermissionLevel.from(mockPermissionLevel),
            walletPlugin: skWallet,
        },
        {fetch: mockFetch, ui, sessionKeyManager: manager, appName: 'unittest'}
    )
    return {session, primaryWallet}
}

suite('sessionkey', function () {
    suite('construction guard', function () {
        test('throws when UserInterface lacks session-key hooks', function () {
            assert.throws(
                () =>
                    new SessionKit(
                        {...mockSessionKitArgs, ui: new MockUserInterface()},
                        {fetch: mockFetch, storage: new MockStorage(), sessionKey: skConfig}
                    ),
                /onSessionKeyConflict/
            )
        })
        test('succeeds with a full session-key UserInterface', function () {
            const kit = new SessionKit(
                {...mockSessionKitArgs, ui: new FullSessionKeyUI()},
                {fetch: mockFetch, storage: new MockStorage(), sessionKey: skConfig}
            )
            assert.instanceOf(kit, SessionKit)
        })
        test('skipConsent does not require onSessionKeyConsent', function () {
            const kit = new SessionKit(
                {...mockSessionKitArgs, ui: new NoConsentUI()},
                {
                    fetch: mockFetch,
                    storage: new MockStorage(),
                    sessionKey: {...skConfig, skipConsent: true},
                }
            )
            assert.instanceOf(kit, SessionKit)
        })
        test('skipConsent still requires conflict/mismatch/remove', function () {
            assert.throws(
                () =>
                    new SessionKit(
                        {...mockSessionKitArgs, ui: new MockUserInterface()},
                        {
                            fetch: mockFetch,
                            storage: new MockStorage(),
                            sessionKey: {...skConfig, skipConsent: true},
                        }
                    ),
                /onSessionKeyConflict/
            )
        })
    })

    suite('setup', function () {
        test('new permission creates one key and links whitelist', async function () {
            const manager = makeManager({fetchPermission: async () => undefined})
            const session = makePrimarySession(manager)
            const captured = await captureTransacts(() => manager.setup(session))
            const names = captured[0].actions.map((a: any) => String(a.name))
            assert.deepEqual(names, ['updateauth', 'linkauth'])
            const ua = decode(captured[0].actions[0], 'updateauth')
            assert.lengthOf(ua.auth.keys, 1)
            assert.isTrue(session.hasSessionKey())
        })
        test('existing permission + add appends the new key', async function () {
            const existing = String(PrivateKey.generate('K1').toPublic())
            const perm = makePermission([existing], [{account: 'eosio.token', action: 'transfer'}])
            const manager = makeManager({fetchPermission: async () => perm})
            const session = makePrimarySession(manager)
            const captured = await captureTransacts(() => manager.setup(session, async () => 'add'))
            const ua = decode(captured[0].actions[0], 'updateauth')
            assert.lengthOf(ua.auth.keys, 2)
        })
        test('existing permission + replace keeps only the new key', async function () {
            const existing = String(PrivateKey.generate('K1').toPublic())
            const perm = makePermission([existing], [{account: 'eosio.token', action: 'transfer'}])
            const manager = makeManager({fetchPermission: async () => perm})
            const session = makePrimarySession(manager)
            const captured = await captureTransacts(() =>
                manager.setup(session, async () => 'replace')
            )
            const ua = decode(captured[0].actions[0], 'updateauth')
            assert.lengthOf(ua.auth.keys, 1)
            assert.notEqual(String(ua.auth.keys[0].key), existing)
        })
        test('existing permission without a conflict handler throws', async function () {
            const existing = String(PrivateKey.generate('K1').toPublic())
            const perm = makePermission([existing])
            const manager = makeManager({fetchPermission: async () => perm})
            const session = makePrimarySession(manager)
            let threw = false
            try {
                await manager.setup(session)
            } catch (error: any) {
                threw = true
                assert.match(error.message, /conflict resolution handler/)
            }
            assert.isTrue(threw)
        })
        test('unlinks on-chain links no longer in the whitelist', async function () {
            const existing = String(PrivateKey.generate('K1').toPublic())
            const perm = makePermission(
                [existing],
                [
                    {account: 'eosio.token', action: 'transfer'},
                    {account: 'eosio', action: 'voteproducer'},
                ]
            )
            const manager = makeManager({fetchPermission: async () => perm})
            const session = makePrimarySession(manager)
            const captured = await captureTransacts(() =>
                manager.setup(session, async () => 'replace')
            )
            const unlink = captured[0].actions.find((a: any) => String(a.name) === 'unlinkauth')
            assert.isDefined(unlink)
            const decoded = decode(unlink, 'unlinkauth')
            assert.equal(String(decoded.code), 'eosio')
            assert.equal(String(decoded.type), 'voteproducer')
        })
    })

    suite('remove', function () {
        test('keeps other keys when removing (uses remainingKeys)', async function () {
            const skPriv = PrivateKey.generate('K1')
            const ourKey = String(skPriv.toPublic())
            const otherKey = String(PrivateKey.generate('K1').toPublic())
            const perm = makePermission(
                [ourKey, otherKey],
                [{account: 'eosio.token', action: 'transfer'}]
            )
            const {session, primaryWallet} = makeSessionKeySession({
                privateKey: skPriv,
                fetchPermission: async () => perm,
            })
            const captured = await captureTransacts(() => session.removeSessionKey())
            const names = captured[0].actions.map((a: any) => String(a.name))
            assert.deepEqual(names, ['updateauth'])
            const ua = decode(captured[0].actions[0], 'updateauth')
            const keys = ua.auth.keys.map((k: any) => String(k.key))
            assert.notInclude(keys, ourKey)
            assert.deepEqual(keys, [otherKey])
            assert.strictEqual(session.walletPlugin, primaryWallet)
        })
        test('unlinks and deletes the permission when removing the last key', async function () {
            const skPriv = PrivateKey.generate('K1')
            const ourKey = String(skPriv.toPublic())
            const perm = makePermission([ourKey], [{account: 'eosio.token', action: 'transfer'}])
            const {session} = makeSessionKeySession({
                privateKey: skPriv,
                fetchPermission: async () => perm,
            })
            const captured = await captureTransacts(() => session.removeSessionKey())
            const names = captured[0].actions.map((a: any) => String(a.name))
            assert.deepEqual(names, ['unlinkauth', 'deleteauth'])
        })
    })

    suite('logout', function () {
        test('logout(SerializedSession) loads wallet data before logout', async function () {
            const recorded: Record<string, any> = {}
            class RecordingWallet extends AbstractWalletPlugin {
                get id() {
                    return 'recording'
                }
                async login(): Promise<any> {
                    throw new Error('n/a')
                }
                async sign(): Promise<any> {
                    throw new Error('n/a')
                }
                async logout(): Promise<void> {
                    recorded.data = this.data
                }
            }
            const storage = new MockStorage()
            const kit = new SessionKit(
                {
                    ...mockSessionKitArgs,
                    ui: new MockUserInterface(),
                    walletPlugins: [new RecordingWallet()],
                },
                {fetch: mockFetch, storage}
            )
            const serialized = {
                chain: String(mockChainDefinition.id),
                actor: 'wharfkit1111',
                permission: 'test',
                walletPlugin: {id: 'recording', data: {secret: 'xyz'}},
            }
            await kit.logout(serialized as any)
            assert.equal(recorded.data.secret, 'xyz')
        })
        test('logout() clears storage even when a wallet logout throws', async function () {
            class ThrowLogoutWallet extends AbstractWalletPlugin {
                get id() {
                    return 'throw-logout'
                }
                async login(): Promise<any> {
                    throw new Error('n/a')
                }
                async sign(): Promise<any> {
                    throw new Error('n/a')
                }
                async logout(): Promise<void> {
                    throw new Error('boom')
                }
            }
            const storage = new MockStorage()
            const sessions = [
                {
                    chain: String(mockChainDefinition.id),
                    actor: 'wharfkit1111',
                    permission: 'test',
                    walletPlugin: {id: 'throw-logout', data: {}},
                    default: true,
                },
                {
                    chain: String(mockChainDefinition.id),
                    actor: 'wharfkit1112',
                    permission: 'test',
                    walletPlugin: {id: 'throw-logout', data: {}},
                },
            ]
            await storage.write('sessions', JSON.stringify(sessions))
            await storage.write('session', JSON.stringify(sessions[0]))
            const kit = new SessionKit(
                {
                    ...mockSessionKitArgs,
                    ui: new MockUserInterface(),
                    walletPlugins: [new ThrowLogoutWallet()],
                },
                {fetch: mockFetch, storage}
            )
            await kit.logout()
            assert.isNotOk(await storage.read('session'))
            assert.isNotOk(await storage.read('sessions'))
        })
    })

    suite('wallet clone', function () {
        test('clone produces an isolated instance preserving config', function () {
            class ConfigWallet extends AbstractWalletPlugin {
                constructor(public endpoint = 'https://a') {
                    super()
                }
                get id() {
                    return 'config-wallet'
                }
                async login(): Promise<any> {
                    throw new Error('n/a')
                }
                async sign(): Promise<any> {
                    throw new Error('n/a')
                }
            }
            const w = new ConfigWallet('https://custom')
            w.data = {foo: 'bar'}
            w.metadata.publicKey = 'PUB_orig'
            const c = w.clone() as ConfigWallet
            assert.notStrictEqual(c, w)
            assert.equal(c.endpoint, 'https://custom')
            assert.notStrictEqual(c.metadata, w.metadata)
            assert.equal(c.metadata.publicKey, 'PUB_orig')
            c.metadata.publicKey = 'PUB_changed'
            assert.equal(w.metadata.publicKey, 'PUB_orig')
            c.data = {foo: 'baz'}
            assert.equal(w.data.foo, 'bar')
        })
    })

    suite('restoreAll isolation', function () {
        test('each restored session gets its own wallet instance', async function () {
            const storage = new MockStorage()
            const kit = new SessionKit(
                {...mockSessionKitArgs, ui: new MockUserInterface()},
                {fetch: mockFetch, storage}
            )
            await kit.login({
                chain: mockChainDefinition.id,
                permissionLevel: PermissionLevel.from('mock1@interface'),
            })
            await kit.login({
                chain: mockChainDefinition.id,
                permissionLevel: PermissionLevel.from('mock2@interface'),
            })
            const sessions = await kit.restoreAll()
            assert.lengthOf(sessions, 2)
            assert.notStrictEqual(sessions[0].walletPlugin, sessions[1].walletPlugin)
            const registered = kit.getWalletPlugin(sessions[0].walletPlugin.id)
            assert.notStrictEqual(sessions[0].walletPlugin, registered)
        })
    })

    suite('auth guard', function () {
        test('actionMatchesPermission returns false for an action without authorization', function () {
            const action = {account: 'eosio.token', name: 'transfer', data: {}}
            assert.isFalse(
                actionMatchesPermission(action as any, PermissionLevel.from(mockPermissionLevel))
            )
        })
        test('willUseSessionKey does not throw for an action without authorization', function () {
            const {session} = makeSessionKeySession({privateKey: PrivateKey.generate('K1')})
            const result = session.willUseSessionKey({
                action: {account: 'eosio.token', name: 'transfer', data: {}},
            } as any)
            assert.isFalse(result)
        })
    })
})
