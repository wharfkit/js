export type LoginStep =
    | 'loading'
    | 'wallet'
    | 'chain'
    | 'permission-select'
    | 'account-entry'
    | 'permission-choice'
    | 'done'

export interface LoginRequirements {
    requiresChainSelect: boolean
    requiresPermissionSelect: boolean
    requiresPermissionEntry?: boolean
}

export interface LoginStepState {
    hasContext: boolean
    walletCount: number
    hasWallet: boolean
    chainCount: number
    hasChain: boolean
    hasAccount: boolean
    hasPermission: boolean
    requirements: LoginRequirements
}

export function resolveLoginStep(state: LoginStepState): LoginStep {
    if (!state.hasContext) return 'loading'
    if (!state.hasWallet) return state.walletCount === 0 ? 'loading' : 'wallet'
    const {requiresChainSelect, requiresPermissionSelect, requiresPermissionEntry} =
        state.requirements
    if (!state.hasChain && requiresChainSelect && state.chainCount > 1) return 'chain'
    // Listing the permissions on a key needs an endpoint, so entry stands in when no chain resolved.
    if (!state.hasPermission && requiresPermissionSelect && state.hasChain) {
        return 'permission-select'
    }
    if (!state.hasPermission && requiresPermissionEntry) {
        return state.hasAccount ? 'permission-choice' : 'account-entry'
    }
    return 'done'
}

export type LookupFailure = 'not-found' | 'unreachable'

// Antelope's APIError carries the response it failed on; a transport failure rejects without one.
export function classifyLookupFailure(error: unknown): LookupFailure {
    if (typeof error === 'object' && error !== null && 'response' in error) {
        return 'not-found'
    }
    return 'unreachable'
}
