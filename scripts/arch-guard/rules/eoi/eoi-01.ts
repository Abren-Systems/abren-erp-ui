import type { Rule } from '../../engine/types'
import { SyntaxKind } from 'ts-morph'

export const EOI01: Rule = {
  code: 'EOI-01',
  description:
    'ONLY ScreenRenderer, screen definitions, or view entry points may call controller factories (useXxxController).',
  severity: 'error',
  check(context) {
    const filePath = context.sourceFile.getFilePath()
    const baseName = context.sourceFile.getBaseName()

    const isScreenRenderer = baseName === 'ScreenRenderer.vue'
    const isScreenDef = baseName === 'screen.ts' || baseName === 'definition.ts'
    const isViewEntry = baseName === 'view.vue'
    const isTest =
      filePath.includes('.test.') || filePath.includes('.spec.') || filePath.includes('/__tests__/')
    const isFactory = filePath.includes('factory') || filePath.includes('testing')

    // Authority whitelist for instantiating or referencing controller factories
    if (isScreenRenderer || isTest || isFactory || isScreenDef || isViewEntry) return

    const callExpressions = context.sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)

    for (const callExpr of callExpressions) {
      const expr = callExpr.getExpression()
      const name = expr.getText()

      // Allow base controller composition inside controller files
      if (name === 'useScreenController' && baseName === 'controller.ts') {
        continue
      }

      if (name.startsWith('use') && name.endsWith('Controller')) {
        context.report({
          code: 'EOI-01',
          message: `Execution Ownership Violation: Unauthorized call to controller factory '${name}'. Only authoritative entry points (ScreenRenderer, screen.ts, view.vue) may instantiate controllers.`,
          severity: 'error',
          node: callExpr,
        })
      }
    }
  },
}
