import {describe, expect, test} from 'vitest'

import {classifyLookupFailure, resolveLoginStep} from '../../src/lib/login-steps.js'
import type {LoginRequirements, LoginStepState} from '../../src/lib/login-steps.js'
import {isValidName} from '../../src/lib/name.js'

// Mirrors the config each wallet plugin publishes, merged over LoginContext.uiRequirements.
const anchor: LoginRequirements = {
    requiresChainSelect: false,
    requiresPermissionSelect: false,
    requiresPermissionEntry: false,
}
const cleos: LoginRequirements = {
    requiresChainSelect: true,
    requiresPermissionSelect: false,
    requiresPermissionEntry: true,
}
const privateKey: LoginRequirements = {
    requiresChainSelect: true,
    requiresPermissionSelect: true,
    requiresPermissionEntry: false,
}

function state(overrides: Partial<LoginStepState> = {}): LoginStepState {
    return {
        hasContext: true,
        walletCount: 3,
        hasWallet: false,
        chainCount: 4,
        hasChain: false,
        hasAccount: false,
        hasPermission: false,
        requirements: anchor,
        ...overrides,
    }
}

describe('resolveLoginStep', () => {
    test('waits while the context or the wallet list is missing', () => {
        expect(resolveLoginStep(state({hasContext: false}))).toBe('loading')
        expect(resolveLoginStep(state({walletCount: 0}))).toBe('loading')
    })

    test('asks for a wallet first', () => {
        expect(resolveLoginStep(state())).toBe('wallet')
    })

    test('a wallet needing nothing else completes immediately', () => {
        expect(resolveLoginStep(state({hasWallet: true}))).toBe('done')
    })

    test('cleos collects a chain, an account, and then a permission', () => {
        const cleosState = state({hasWallet: true, requirements: cleos})
        expect(resolveLoginStep(cleosState)).toBe('chain')
        const onChain = {...cleosState, hasChain: true}
        expect(resolveLoginStep(onChain)).toBe('account-entry')
        expect(resolveLoginStep({...onChain, hasAccount: true})).toBe('permission-choice')
        expect(resolveLoginStep({...onChain, hasAccount: true, hasPermission: true})).toBe('done')
    })

    // A failed lookup clears the account rather than becoming a step of its own.
    test('a failed lookup returns to the account entry', () => {
        const chosen = state({
            hasWallet: true,
            requirements: cleos,
            hasChain: true,
            hasAccount: true,
        })
        expect(resolveLoginStep(chosen)).toBe('permission-choice')
        expect(resolveLoginStep({...chosen, hasAccount: false})).toBe('account-entry')
    })

    test('going back from the permission choice returns to the account entry', () => {
        const chosen = state({
            hasWallet: true,
            requirements: cleos,
            chainCount: 1,
            hasChain: true,
            hasAccount: true,
        })
        expect(resolveLoginStep({...chosen, hasAccount: false})).toBe('account-entry')
    })

    test('a single available chain skips the chain step', () => {
        const single = state({hasWallet: true, requirements: cleos, chainCount: 1, hasChain: true})
        expect(resolveLoginStep(single)).toBe('account-entry')
    })

    test('an account entered without a chain still reaches the permission step', () => {
        const noChain = state({
            hasWallet: true,
            requirements: cleos,
            chainCount: 4,
            hasChain: false,
            hasAccount: true,
        })
        expect(
            resolveLoginStep({...noChain, requirements: {...cleos, requiresChainSelect: false}})
        ).toBe('permission-choice')
    })

    test('a permission already on the context skips both permission steps', () => {
        const resolved = {hasWallet: true, hasChain: true, hasPermission: true}
        expect(resolveLoginStep(state({...resolved, requirements: cleos}))).toBe('done')
        expect(resolveLoginStep(state({...resolved, requirements: privateKey}))).toBe('done')
    })

    test('permission select needs a chain to look accounts up on', () => {
        const selecting = state({hasWallet: true, requirements: privateKey, chainCount: 1})
        expect(resolveLoginStep({...selecting, hasChain: true})).toBe('permission-select')
        expect(resolveLoginStep(selecting)).toBe('done')
    })

    test('entry stands in when a select-style wallet has no chain', () => {
        const both: LoginRequirements = {
            requiresChainSelect: false,
            requiresPermissionSelect: true,
            requiresPermissionEntry: true,
        }
        expect(resolveLoginStep(state({hasWallet: true, requirements: both}))).toBe('account-entry')
    })
})

describe('classifyLookupFailure', () => {
    test('an API response means the chain answered and the account is not there', () => {
        const apiError = Object.assign(new Error('Account not found at /v1/chain/get_account'), {
            response: {status: 500, headers: {}, text: ''},
        })
        expect(classifyLookupFailure(apiError)).toBe('not-found')
    })

    test('a rejection without a response means the endpoint was never reached', () => {
        expect(classifyLookupFailure(new TypeError('Failed to fetch'))).toBe('unreachable')
        expect(classifyLookupFailure('boom')).toBe('unreachable')
        expect(classifyLookupFailure(undefined)).toBe('unreachable')
    })
})

describe('isValidName', () => {
    test('accepts account names', () => {
        for (const name of ['teamgreymass', 'a', 'eosio.token', 'wharf1', 'active', 'owner']) {
            expect(isValidName(name), name).toBe(true)
        }
    })

    test('rejects anything an Antelope name cannot hold', () => {
        for (const name of [
            '',
            'Teamgreymass',
            'team_greymass',
            'account6',
            '.leading',
            'trailing.',
            'thirteenchars',
        ]) {
            expect(isValidName(name), name).toBe(false)
        }
    })
})
