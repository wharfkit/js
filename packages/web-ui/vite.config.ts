import {defineConfig} from 'vite'
import {svelte} from '@sveltejs/vite-plugin-svelte'
import {wuchale} from '@wuchale/vite-plugin'
import dts from 'vite-plugin-dts'
import net from 'node:net'
import {readFile, writeFile} from 'node:fs/promises'
import {dirname, resolve} from 'node:path'
import ts from 'typescript'

// Splice below only handles string-literal unions; a reference to another named type would go unresolved.
function assertLiteralUnionOnly(node: ts.TypeNode, name: string, sourceFile: string): void {
    const isStringLiteral = (n: ts.TypeNode) =>
        ts.isLiteralTypeNode(n) && ts.isStringLiteral(n.literal)
    const members = ts.isUnionTypeNode(node) ? node.types : [node]
    if (!members.every(isStringLiteral)) {
        throw new Error(
            `extractTypeAliasText: '${name}' in ${sourceFile} is no longer a plain string-literal ` +
                `union; the textual splice cannot resolve references to other named types. Update ` +
                `extractTypeAliasText (or the build pipeline) before shipping.`
        )
    }
}

// api-extractor's rollup drops pure re-exported types and strips `export` from survivors; patch both after rollup.
function extractTypeAliasText(sourceText: string, sourceFile: string, name: string): string {
    const source = ts.createSourceFile(sourceFile, sourceText, ts.ScriptTarget.Latest, true)
    for (const statement of source.statements) {
        if (ts.isTypeAliasDeclaration(statement) && statement.name.text === name) {
            assertLiteralUnionOnly(statement.type, name, sourceFile)
            const text = statement.getFullText(source).trim()
            return text.startsWith('export ') ? text : `export ${text}`
        }
    }
    throw new Error(`Could not find type alias '${name}' in ${sourceFile}`)
}

// api-extractor's rollup silently drops pure type-only re-exports; collect them all so they can be re-added.
function collectTypeReexports(
    sourceText: string,
    sourceFile: string
): {name: string; module: string}[] {
    const source = ts.createSourceFile(sourceFile, sourceText, ts.ScriptTarget.Latest, true)
    const result: {name: string; module: string}[] = []
    for (const statement of source.statements) {
        if (!ts.isExportDeclaration(statement) || !statement.moduleSpecifier) continue
        if (!ts.isStringLiteral(statement.moduleSpecifier)) continue
        const module = statement.moduleSpecifier.text
        if (!statement.exportClause || !ts.isNamedExports(statement.exportClause)) continue
        for (const element of statement.exportClause.elements) {
            const isTypeOnly = statement.isTypeOnly || element.isTypeOnly
            if (!isTypeOnly) continue
            result.push({name: element.name.text, module})
        }
    }
    return result
}

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
                wuchale(),
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
            wuchale(),
            svelte({
                compilerOptions: {
                    css: 'injected',
                },
            }),
            dts({
                rollupTypes: true,
                outDir: 'lib',
                entryRoot: 'src',
                afterBuild: async () => {
                    const file = resolve(process.cwd(), 'lib/web-ui.d.ts')
                    let dts = await readFile(file, 'utf8')

                    dts = dts.replace(
                        /^declare (type|interface|const|let|var|function|class|enum) /gm,
                        'export declare $1 '
                    )

                    const indexFile = resolve(process.cwd(), 'src/index.ts')
                    const indexSource = await readFile(indexFile, 'utf8')
                    for (const {name, module} of collectTypeReexports(indexSource, indexFile)) {
                        if (new RegExp(`\\b${name}\\b`).test(dts)) continue
                        if (module.startsWith('.')) {
                            const localFile = resolve(
                                dirname(indexFile),
                                module.replace(/\.js$/, '.ts')
                            )
                            const localSource = await readFile(localFile, 'utf8')
                            dts += `\n${extractTypeAliasText(localSource, localFile, name)}\n`
                        } else {
                            dts += `\nexport type {${name}} from '${module}'\n`
                        }
                    }

                    // api-extractor drops the aliased default export; re-add it
                    if (!/export default WebUI/.test(dts)) {
                        dts += '\nexport default WebUI\n'
                    }

                    await writeFile(file, dts)
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
