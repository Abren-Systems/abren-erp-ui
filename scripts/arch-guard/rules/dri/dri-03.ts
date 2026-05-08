import type { Rule } from '../../engine/types'
import { SyntaxKind } from 'ts-morph'

export const DRI03: Rule = {
  code: 'DRI-03',
  description:
    'Views must NOT render chrome (ListTitleBar, FormTitleBar, FormToolbar, PageHeader).',
  severity: 'error',
  check(context) {
    if (!context.isVueFile) return
    const isViewFile = context.sourceFile.getFilePath().endsWith('view.vue.ts')
    if (!isViewFile) return

    const importDeclarations = context.sourceFile.getDescendantsOfKind(SyntaxKind.ImportDeclaration)

    for (const importDecl of importDeclarations) {
      const namedImports = importDecl.getNamedImports().map((i) => i.getName())
      const defaultImport = importDecl.getDefaultImport()?.getText()

      const allImports = [...namedImports, defaultImport].filter(Boolean) as string[]

      for (const name of allImports) {
        if (['ListTitleBar', 'FormTitleBar', 'FormToolbar', 'PageHeader'].includes(name)) {
          context.report({
            code: 'DRI-03',
            message: `Single Authority Violation: Views must NOT render chrome components like '${name}'. ScreenRenderer owns the chrome.`,
            severity: 'error',
            node: importDecl,
          })
        }
      }
    }
  },
}
