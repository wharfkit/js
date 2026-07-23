import {defineConfig} from 'vite'
import {svelte} from '@sveltejs/vite-plugin-svelte'
import dts from 'vite-plugin-dts'
import net from 'node:net'
import {readFile, writeFile} from 'node:fs/promises'
import {resolve} from 'node:path'

function isPortFree(port: number): Promise<boolean> {
    return new Promise((resolve) => {
        const srv = net.createServer()
        srv.once('error', () => resolve(false))
        srv.once('listening', () => srv.close(() => resolve(true)))
        srv.listen(port, '0.0.0.0')
    })
}

async function findFreePort(start: number, tries = 20): Promise<number> {
    for (let i = 0; i < tries; i++) {
        if (await isPortFree(start + i)) return start + i
    }
    return start
}

export default defineConfig(async ({mode}) => {
    if (mode === 'development') {
        const port = await findFreePort(5173)
        return {
            root: 'dev',
            plugins: [
                svelte({
                    compilerOptions: {
                        css: 'injected',
                    },
                }),
            ],
            server: {
                port,
                strictPort: true,
            },
        }
    }

    return {
        plugins: [
            svelte({
                compilerOptions: {
                    css: 'injected',
                },
            }),
            dts({
                rollupTypes: true,
                outDir: 'lib',
                entryRoot: 'src',
                // api-extractor drops the aliased default export; re-add it
                afterBuild: async () => {
                    const file = resolve(process.cwd(), 'lib/web-ui.d.ts')
                    const dts = await readFile(file, 'utf8')
                    if (!/export default WebUI/.test(dts)) {
                        await writeFile(file, `${dts}\nexport default WebUI\n`)
                    }
                },
            }),
        ],
        build: {
            lib: {
                entry: 'src/index.ts',
                name: 'WebUI',
                formats: ['es', 'cjs'],
                fileName: (format) => {
                    if (format === 'es') return 'web-ui.m.js'
                    return 'web-ui.cjs'
                },
            },
            outDir: 'lib',
            rollupOptions: {
                external: ['@wharfkit/session', '@wharfkit/common', '@wharfkit/antelope'],
                output: {exports: 'named'},
            },
        },
    }
})
