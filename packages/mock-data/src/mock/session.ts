import {PermissionLevel} from '@greymass/eosio'

import {
    Session,
    SessionArgs,
    SessionKit,
    SessionKitOptions,
    SessionOptions,
} from '@wharfkit/session'

import {mockChainDefinition, mockChainDefinitions, mockPermissionLevel} from './config'
import {mockFetch} from './fetch'
import {makeWallet} from './wallet'
import {MockStorage} from './storage'
import {MockUserInterface} from './userinterface'

const wallet = makeWallet()

export const mockSessionKitOptions: SessionKitOptions = {
    appName: 'unittest',
    chains: mockChainDefinitions,
    ui: new MockUserInterface(),
    walletPlugins: [wallet],
    fetch: mockFetch, // Required for unit tests
    storage: new MockStorage(),
}

export const mockSessionKit = new SessionKit(mockSessionKitOptions)

export const mockSessionArgs: SessionArgs = {
    chain: mockChainDefinition,
    permissionLevel: PermissionLevel.from(mockPermissionLevel),
    walletPlugin: wallet,
}

export const mockSessionOptions: SessionOptions = {
    broadcast: false, // Disable broadcasting by default for tests, enable when required.
    fetch: mockFetch, // Required for unit tests
}

export const mockSession = new Session(mockSessionArgs, mockSessionOptions)
