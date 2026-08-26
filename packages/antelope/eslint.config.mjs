import esx from 'eslint-plugin-es-x'

import base from '../../eslint.base.mjs'

export default [
    ...base,
    {
        plugins: {'es-x': esx},
        rules: {
            'es-x/no-optional-chaining': 'error',
            'es-x/no-class-fields': 'off',
            'es-x/no-export-ns-from': 'off',
        },
    },
]
