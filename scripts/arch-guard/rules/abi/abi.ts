import type { Rule } from '../../engine/types'
import { SyntaxKind } from 'ts-morph'

export const ABI_RULES: Rule = {
  code: 'ABI',
  description: 'Authority Boundary Invariants',
  severity: 'error',
  check(context) {
    const filePath = context.sourceFile.getFilePath()
    const isProjectionFile = filePath.endsWith('resolve-screen-model.ts')
    const isCommandFile = filePath.endsWith('commands.ts')

    if (isProjectionFile) {
      // ABI-03: resolveScreenModel must NOT access DOM/browser globals.
      const identifiers = context.sourceFile.getDescendantsOfKind(SyntaxKind.Identifier)
      for (const id of identifiers) {
        const text = id.getText()
        if (
          (text === 'window' || text === 'document') &&
          !id.getParentIfKind(SyntaxKind.PropertyAccessExpression)
        ) {
          context.report({
            code: 'ABI-03',
            message: 'resolveScreenModel must NOT access DOM/browser globals.',
            severity: 'error',
            node: id,
          })
        }
      }
    }

    if (isCommandFile) {
      // ABI-04: Commands must NOT execute navigation directly.
      const imports = context.sourceFile.getDescendantsOfKind(SyntaxKind.ImportDeclaration)
      for (const imp of imports) {
        if (imp.getModuleSpecifierValue() === 'vue-router') {
          context.report({
            code: 'ABI-04',
            message:
              'Commands must NOT execute navigation directly (no vue-router imports). Yield to orchestration/routing contracts.',
            severity: 'error',
            node: imp,
          })
        }
      }
    }
  },
}
