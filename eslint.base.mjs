import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended'

export default tseslint.config(
    {
        ignores: ['**/lib/**', '**/node_modules/**', '**/coverage/**', '**/docs_build/**'],
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    eslintPluginPrettier,
    {
        rules: {
            'prettier/prettier': 'warn',
            'no-console': 'warn',
            'sort-imports': ['warn', {ignoreCase: true, ignoreDeclarationSort: true}],
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-namespace': 'off',
            '@typescript-eslint/no-non-null-assertion': 'off',
            '@typescript-eslint/no-empty-function': 'warn',
            '@typescript-eslint/no-this-alias': 'off',
            'no-inner-declarations': 'off',
            'preserve-caught-error': 'off',
        },
    }
)
