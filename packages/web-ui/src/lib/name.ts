// Antelope names: a-z, 1-5 and separating dots, 12 characters at most, no leading or trailing dot.
const NAME_PATTERN = /^[a-z1-5](?:[a-z1-5.]{0,10}[a-z1-5])?$/

export function isValidName(value: string): boolean {
    return NAME_PATTERN.test(value)
}
