import esx from 'eslint-plugin-es-x'
import tsparser from '@typescript-eslint/parser'

// no-optional-chaining has no oxlint equivalent and guards the es6 CJS bundle target
export default [
    {ignores: ['**/lib/**', '**/node_modules/**', '**/coverage/**', '**/docs_build/**']},
    {linterOptions: {reportUnusedDisableDirectives: 'off'}},
    {
        files: ['**/*.ts'],
        languageOptions: {parser: tsparser},
        plugins: {'es-x': esx},
        rules: {'es-x/no-optional-chaining': 'error'},
    },
]
