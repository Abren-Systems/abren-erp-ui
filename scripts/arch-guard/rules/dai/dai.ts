import type { Rule } from '../../engine/types'
import { SyntaxKind } from 'ts-morph'

export const DAI_RULES: Rule = {
  code: 'DAI',
  description: 'Dual Authority Invariants',
  severity: 'error',
  check(context) {
    const filePath = context.sourceFile.getFilePath()
    const isScreenRenderer = filePath.endsWith('ScreenRenderer.vue.ts')
    const isFormToolbar =
      filePath.endsWith('FormToolbar.vue.ts') || filePath.endsWith('ListTitleBar.vue.ts')

    // DAI-01: Chrome components ONLY by ScreenRenderer
    if (!isScreenRenderer) {
      const imports = context.sourceFile.getDescendantsOfKind(SyntaxKind.ImportDeclaration)
      for (const imp of imports) {
        const names = imp.getNamedImports().map((i) => i.getName())
        const defaultImp = imp.getDefaultImport()?.getText()
        const allNames = [...names, defaultImp].filter(Boolean) as string[]

        for (const name of allNames) {
          if (['PageHeader', 'ListTitleBar', 'FormTitleBar', 'FormToolbar'].includes(name)) {
            // Exception: these components themselves might import each other or base components,
            // so ignore if we are inside the shared/components/workspace folder
            if (filePath.includes('/shared/components/workspace/')) continue

            // This is partially covered by DRI-03 for views, but DAI-01 applies globally.
            context.report({
              code: 'DAI-01',
              message: `Dual Authority Violation: Chrome components may ONLY be imported by ScreenRenderer. Found '${name}'.`,
              severity: 'error',
              node: imp,
            })
          }
        }
      }
    }

    // DAI-03: ONLY FormToolbar/ListTitleBar may execute ScreenCommands globally
    // We can't perfectly track this, but we can look for `ctrl.executeCommand` in views.
    if (
      context.isVueFile &&
      !isFormToolbar &&
      !filePath.includes('AppTemplate.vue.ts') &&
      !filePath.includes('Dialog.vue.ts')
    ) {
      // Just check the raw string for executeCommand
      const rawLines = context.rawContent.split('\n')
      for (let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i]
        if (line.includes('.executeCommand(')) {
          // We allow executeCommand inside some very specific generic dialog wrappers if needed, but for now strict.
          context.report({
            code: 'DAI-03',
            message: `Dual Authority Violation: Only FormToolbar/ListTitleBar may execute ScreenCommands. Found executeCommand usage.`,
            severity: 'error',
            line: i + 1,
            column: line.indexOf('.executeCommand'),
          })
        }
      }
    }
  },
}
