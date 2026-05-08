import type { Rule } from '../../engine/types'
import { SyntaxKind } from 'ts-morph'

export const RII01: Rule = {
  code: 'RII-01',
  description: 'Projection layer must not create refs/computeds/watchers.',
  severity: 'error',
  check(context) {
    const filePath = context.sourceFile.getFilePath()

    // Target strictly the projection layer logic
    const isProjectionFile =
      filePath.endsWith('resolve-screen-model.ts') ||
      filePath.endsWith('screen-state-policy.types.ts') ||
      filePath.includes('policy.ts')

    if (!isProjectionFile) {
      return
    }

    const importDeclarations = context.sourceFile.getDescendantsOfKind(SyntaxKind.ImportDeclaration)

    for (const importDecl of importDeclarations) {
      if (importDecl.getModuleSpecifierValue() === 'vue') {
        const namedImports = importDecl.getNamedImports()
        for (const namedImport of namedImports) {
          const name = namedImport.getName()
          if (['ref', 'computed', 'watch', 'watchEffect', 'reactive'].includes(name)) {
            context.report({
              code: 'RII-01',
              message: `Reactive Escape Corruption: Projection layer must remain pure deterministic computation. Use of '${name}' is forbidden here.`,
              severity: 'error',
              node: namedImport,
              line: namedImport.getStartLineNumber(),
              column: namedImport.getStartLinePos(),
            })
          }
        }
      }
    }
  },
}
