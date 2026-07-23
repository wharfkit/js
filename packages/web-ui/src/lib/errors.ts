export interface HumanError {
    message: string
    details: string
}

function capitalize(s: string): string {
    return s.length > 0 ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

// Maps a raw SDK/chain error to calm copy; keeps the original as `details`.
export function humanizeError(error: unknown): HumanError {
    const raw = error instanceof Error ? error.message : String(error ?? '')
    if (!raw.trim()) return {message: 'Something went wrong.', details: ''}

    const lower = raw.toLowerCase()
    const withDetails = (message: string): HumanError => ({message, details: raw})

    const assertMatch = raw.match(/assertion failure with message:\s*(.+)/i)
    if (assertMatch) return withDetails(capitalize(assertMatch[1].trim()))

    if (lower.includes('cancel') || lower.includes('rejected') || lower.includes('declined')) {
        return withDetails('The request was cancelled.')
    }
    if (
        lower.includes('failed to fetch') ||
        lower.includes('networkerror') ||
        lower.includes('network request failed') ||
        lower.includes('timeout') ||
        lower.includes('timed out') ||
        lower.includes('econnrefused') ||
        lower.includes('enotfound')
    ) {
        return withDetails("Couldn't reach the network. Check your connection and try again.")
    }
    if (lower.includes('expired') || lower.includes('expiration')) {
        return withDetails('The transaction expired before it completed. Please try again.')
    }
    if (
        lower.includes('insufficient ram') ||
        lower.includes('billed') ||
        lower.includes('cpu usage') ||
        lower.includes('net usage') ||
        lower.includes('resources')
    ) {
        return withDetails(
            'Your account needs more network resources (CPU, NET, or RAM) to complete this.'
        )
    }
    if (lower.includes('overdrawn') || lower.includes('insufficient funds')) {
        return withDetails('Insufficient balance to complete this transaction.')
    }

    if (raw.length <= 120) return {message: raw, details: ''}
    return {message: 'The transaction could not be completed.', details: raw}
}
