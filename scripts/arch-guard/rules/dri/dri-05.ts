import type { Rule } from '../../engine/types'
import { SyntaxKind } from 'ts-morph'

export const DRI05: Rule = {
  code: 'DRI-05',
  description:
    'Controllers must NOT render DOM or import Vue rendering APIs (h, resolveComponent).',
  severity: 'error',
  check(context) {
    if (!context.sourceFile.getFilePath().endsWith('controller.ts')) return

    const importDeclarations = context.sourceFile.getDescendantsOfKind(SyntaxKind.ImportDeclaration)

    for (const importDecl of importDeclarations) {
      if (importDecl.getModuleSpecifierValue() === 'vue') {
        const namedImports = importDecl.getNamedImports()
        for (const namedImport of namedImports) {
          const name = namedImport.getName()
          if (['h', 'resolveComponent', 'createVNode', 'render'].includes(name)) {
            context.report({
              code: 'DRI-05',
              message: `Controllers must NOT render DOM. Use of Vue rendering API '${name}' is forbidden.`,
              severity: 'error',
              node: namedImport,
            })
          }
        }
      }
    }
  },
}
