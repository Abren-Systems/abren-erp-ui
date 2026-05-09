import type { Rule } from '../../engine/types'
import { SyntaxKind } from 'ts-morph'

export const DRI01: Rule = {
  code: 'DRI-01',
  description: 'Views must NOT import controllers directly.',
  severity: 'error',
  check(context) {
    if (!context.isVueFile) return
    const isViewFile =
      context.sourceFile.getFilePath().endsWith('view.vue.ts') ||
      context.sourceFile.getFilePath().includes('Dialog.vue.ts')
    if (!isViewFile) return

    const importDeclarations = context.sourceFile.getDescendantsOfKind(SyntaxKind.ImportDeclaration)

    for (const importDecl of importDeclarations) {
      const moduleSpecifier = importDecl.getModuleSpecifierValue()
      if (importDecl.isTypeOnly()) continue

      if (moduleSpecifier.includes('./controller') || moduleSpecifier.includes('../controller')) {
        context.report({
          code: 'DRI-01',
          message:
            'Views must obtain controller via inject(ScreenControllerKey), not direct import. This prevents lifecycle bypass.',
          severity: 'error',
          node: importDecl,
        })
      }
    }
  },
}
