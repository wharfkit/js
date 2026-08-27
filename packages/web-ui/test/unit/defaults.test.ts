import {expect, test} from 'vitest'

import {defaultOptions} from '../../src/types'

test('defaultOptions provides sane renderer defaults', () => {
    expect(defaultOptions.theme).toBe('auto')
    expect(defaultOptions.closeOnOverlayClick).toBe(true)
    expect(defaultOptions.closeOnEscape).toBe(true)
    expect(defaultOptions.logging).toBe(false)
    expect(defaultOptions.zIndex).toBeGreaterThan(0)
})
