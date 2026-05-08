import type { Rule } from '../../engine/types'
import { SyntaxKind } from 'ts-morph'

export const ABI01: Rule = {
  code: 'ABI-01',
  description: 'Views must not mutate entity state directly.',
  severity: 'error',
  check(context) {
    if (!context.isVueFile) return
    const isViewFile =
      context.sourceFile.getFilePath().endsWith('view.vue.ts') ||
      context.sourceFile.getFilePath().includes('Dialog.vue.ts')
    if (!isViewFile) return

    const assignments = context.sourceFile.getDescendantsOfKind(SyntaxKind.BinaryExpression)

    for (const expr of assignments) {
      if (expr.getOperatorToken().getKind() === SyntaxKind.EqualsToken) {
        const left = expr.getLeft().getText()
        if (
          left.includes('entity.value') ||
          left.includes('.entity.') ||
          left.includes("['entity']")
        ) {
          context.report({
            code: 'ABI-01',
            message: `Authority Boundary Violation: Views must NOT mutate entity state directly. Yield to commands/services. Found mutation of: ${left}`,
            severity: 'error',
            node: expr,
          })
        }
      }
    }
  },
}
