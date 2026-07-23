import {expect, test} from 'vitest'

import {humanizeError} from '../../src/lib/errors'

test('empty and nullish errors get a safe generic message', () => {
    expect(humanizeError(undefined).message).toBe('Something went wrong.')
    expect(humanizeError(new Error('')).message).toBe('Something went wrong.')
})

test('eosio assertion messages are surfaced and capitalized', () => {
    const result = humanizeError(new Error('assertion failure with message: overdrawn balance'))
    expect(result.message).toBe('Overdrawn balance')
    expect(result.details).toContain('assertion failure')
})

test('network failures map to a calm, actionable message', () => {
    const result = humanizeError(new Error('Network request failed: unable to reach API endpoint'))
    expect(result.message).toBe("Couldn't reach the network. Check your connection and try again.")
    expect(result.details).toContain('unable to reach')
})

test('cancellation is not framed as a failure', () => {
    expect(humanizeError(new Error('User rejected the request')).message).toBe(
        'The request was cancelled.'
    )
})

test('short unknown messages pass through with no details', () => {
    const result = humanizeError(new Error('Unexpected token'))
    expect(result.message).toBe('Unexpected token')
    expect(result.details).toBe('')
})

test('long opaque messages fall back to generic copy and keep raw details', () => {
    const raw = 'x'.repeat(200)
    const result = humanizeError(new Error(raw))
    expect(result.message).toBe('The transaction could not be completed.')
    expect(result.details).toBe(raw)
})
