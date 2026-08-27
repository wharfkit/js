import {readFileSync} from 'node:fs'
import {resolve} from 'node:path'
import ts from 'typescript'
import {expect, test} from 'vitest'

const repoRoot = resolve(__dirname, '../..')

function publicNamesFromIndex(sourceText: string, sourceFile: string): Set<string> {
    const source = ts.createSourceFile(sourceFile, sourceText, ts.ScriptTarget.Latest, true)
    const names = new Set<string>()
    for (const statement of source.statements) {
        if (!ts.isExportDeclaration(statement)) continue
        if (!statement.exportClause || !ts.isNamedExports(statement.exportClause)) continue
        for (const element of statement.exportClause.elements) {
            names.add(element.name.text)
        }
    }
    return names
}

function publicNamesFromDts(sourceText: string, sourceFile: string): Set<string> {
    const source = ts.createSourceFile(sourceFile, sourceText, ts.ScriptTarget.Latest, true)
    const names = new Set<string>()
    const hasExportModifier = (node: ts.Node): boolean =>
        !!(
            ts.canHaveModifiers(node) &&
            ts.getModifiers(node)?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
        )

    for (const statement of source.statements) {
        if (ts.isExportAssignment(statement)) {
            names.add('default')
        } else if (
            ts.isExportDeclaration(statement) &&
            statement.exportClause &&
            ts.isNamedExports(statement.exportClause)
        ) {
            for (const element of statement.exportClause.elements) {
                names.add(element.name.text)
            }
        } else if (hasExportModifier(statement)) {
            if (
                ts.isClassDeclaration(statement) ||
                ts.isInterfaceDeclaration(statement) ||
                ts.isTypeAliasDeclaration(statement)
            ) {
                if (statement.name) names.add(statement.name.text)
            } else if (ts.isVariableStatement(statement)) {
                for (const decl of statement.declarationList.declarations) {
                    if (ts.isIdentifier(decl.name)) names.add(decl.name.text)
                }
            }
        }
    }
    return names
}

test('lib/web-ui.d.ts export surface matches src/index.ts exactly', () => {
    const indexFile = resolve(repoRoot, 'src/index.ts')
    const dtsFile = resolve(repoRoot, 'lib/web-ui.d.ts')

    const expected = publicNamesFromIndex(readFileSync(indexFile, 'utf8'), indexFile)
    const actual = publicNamesFromDts(readFileSync(dtsFile, 'utf8'), dtsFile)

    const missing = [...expected].filter((name) => !actual.has(name)).sort()
    const extra = [...actual].filter((name) => !expected.has(name)).sort()

    expect(
        missing,
        'symbols declared public in src/index.ts but missing from lib/web-ui.d.ts'
    ).toEqual([])
    expect(
        extra,
        'symbols exported from lib/web-ui.d.ts but not declared public in src/index.ts'
    ).toEqual([])
})
