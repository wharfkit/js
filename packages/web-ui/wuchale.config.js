import {adapter as svelte} from '@wuchale/svelte'
import {adapter as js} from 'wuchale/adapter-vanilla'
import {defineConfig} from 'wuchale'
import {codex} from './wuchale/codex.js'

const ai =
    process.env.WUCHALE_AI === 'codex'
        ? codex({
              model: process.env.WUCHALE_CODEX_MODEL ?? '',
              reasoning: process.env.WUCHALE_CODEX_REASONING ?? '',
          })
        : undefined

export default defineConfig({
    locales: ['en', 'ko', 'zh-Hans', 'zh-Hant', 'tr'],
    ai,
    adapters: {
        main: svelte({
            files: ['src/**/*.svelte'],
            bundleLoad: true,
        }),
        js: js({
            files: ['src/lib/errors.ts'],
            bundleLoad: true,
            // Required: two co-located bundleLoad adapters collide on compiled-catalog filenames.
            granularLoad: true,
        }),
    },
})
