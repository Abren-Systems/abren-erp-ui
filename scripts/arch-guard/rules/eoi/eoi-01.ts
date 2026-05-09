import type { Rule } from '../../engine/types'
import { SyntaxKind } from 'ts-morph'

export const EOI01: Rule = {
  code: 'EOI-01',
  description: 'ONLY ScreenRenderer (or tests) may call controller factories (useXxxController).',
  severity: 'error',
  check(context) {
    const filePath = context.sourceFile.getFilePath()
    const isScreenRenderer = filePath.includes('ScreenRenderer.vue')
    const isScreenDef = filePath.endsWith('screen.ts') || filePath.endsWith('definition.ts')
    const isTest =
      filePath.includes('.test.') || filePath.includes('.spec.') || filePath.includes('/__tests__/')
    const isFactory = filePath.includes('factory') || filePath.includes('testing')

    // screen.ts is allowed to reference the controller factory function without calling it,
    // but we allow calling just in case they do anonymous function `() => useXxxController()`
    if (isScreenRenderer || isTest || isFactory || isScreenDef) return

    const callExpressions = context.sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)

    for (const callExpr of callExpressions) {
      const expr = callExpr.getExpression()
      const name = expr.getText()

      // Allow base controller composition inside controller files
      if (name === 'useScreenController' && filePath.endsWith('controller.ts')) {
        continue
      }

      if (name.startsWith('use') && name.endsWith('Controller')) {
        context.report({
          code: 'EOI-01',
          message: `Execution Ownership Violation: Unauthorized call to controller factory '${name}'. Only ScreenRenderer may instantiate controllers.`,
          severity: 'error',
          node: callExpr,
        })
      }
    }
  },
}
