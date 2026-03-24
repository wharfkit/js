import eslintConfigPrettier from 'eslint-config-prettier'
import esx from 'eslint-plugin-es-x'
import prettierPlugin from 'eslint-plugin-prettier'
import tseslint from '@typescript-eslint/eslint-plugin'

const tsRecommended = tseslint.configs['flat/recommended'].map((config) => ({
    ...config,
    files: ['src/**/*.ts'],
}))

export default [
    {
        ignores: ['lib/*', 'node_modules/**'],
    },
    ...tsRecommended,
    {
        files: ['src/**/*.ts'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
        },
        plugins: {
            'es-x': esx,
            prettier: prettierPlugin,
        },
        rules: {
            ...eslintConfigPrettier.rules,
            ...esx.configs['flat/no-new-in-es2020'].rules,
            'prettier/prettier': 'warn',
            'no-console': 'warn',
            'sort-imports': [
                'warn',
                {
                    ignoreCase: true,
                    ignoreDeclarationSort: true,
                },
            ],
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-namespace': 'off',
            '@typescript-eslint/no-non-null-assertion': 'off',
            '@typescript-eslint/no-empty-function': 'warn',
            '@typescript-eslint/no-this-alias': 'off',
            'no-inner-declarations': 'off',
            'es-x/no-optional-chaining': 'error',
            'es-x/no-class-fields': 'off',
            'es-x/no-export-ns-from': 'off',
        },
    },
]
