import type { Rule } from '../../engine/types'
import { SyntaxKind } from 'ts-morph'

export const DRI04: Rule = {
  code: 'DRI-04',
  description: 'ScreenDefinitions must explicitly declare a controller factory.',
  severity: 'error',
  check(context) {
    if (!context.sourceFile.getFilePath().endsWith('screen.ts')) return

    const variableDeclarations = context.sourceFile.getDescendantsOfKind(
      SyntaxKind.VariableDeclaration,
    )

    for (const varDecl of variableDeclarations) {
      const typeNode = varDecl.getTypeNode()
      if (typeNode && typeNode.getText().includes('ScreenDefinition')) {
        const initializer = varDecl.getInitializerIfKind(SyntaxKind.ObjectLiteralExpression)
        if (initializer) {
          const hasController = initializer.getProperty('controller')
          if (!hasController) {
            context.report({
              code: 'DRI-04',
              message: `ScreenDefinition must explicitly declare a 'controller' factory to ensure deterministic lifecycle.`,
              severity: 'error',
              node: initializer,
            })
          }
        }
      }
    }
  },
}
