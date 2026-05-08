import type { Rule } from '../../engine/types'
import { SyntaxKind } from 'ts-morph'

export const RII_RULES: Rule = {
  code: 'RII',
  description: 'Reactive Integrity Invariants (02 & 03)',
  severity: 'error',
  check(context) {
    if (!context.isVueFile) return
    const isViewFile =
      context.sourceFile.getFilePath().endsWith('view.vue.ts') ||
      context.sourceFile.getFilePath().includes('Dialog.vue.ts')
    if (!isViewFile) return

    // RII-03: No watcher-driven business logic in views
    const callExpressions = context.sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)
    for (const callExpr of callExpressions) {
      const name = callExpr.getExpression().getText()
      if (name === 'watch' || name === 'watchEffect') {
        const args = callExpr.getArguments()
        if (args.length > 0) {
          const watchSourceText = args[0].getText()
          // If watching entity, status, workflow state, etc.
          if (
            watchSourceText.includes('entity') ||
            watchSourceText.includes('status') ||
            watchSourceText.includes('state')
          ) {
            context.report({
              code: 'RII-03',
              message: `Reactive Escape Corruption: No watcher-driven business logic in views. Watchers may observe UI state only.`,
              severity: 'error',
              node: callExpr,
            })
          }
        }
      }

      // RII-02: Views must not derive workflow state independently (e.g. computed(() => entity.status === 'HOLD'))
      if (name === 'computed') {
        const args = callExpr.getArguments()
        if (args.length > 0) {
          const funcText = args[0].getText()
          if (
            (funcText.includes('entity') || funcText.includes('status')) &&
            (funcText.includes('===') || funcText.includes('!=='))
          ) {
            context.report({
              code: 'RII-02',
              message: `Reactive Escape Corruption: Views must not derive workflow state independently. Use ScreenModel capabilities instead.`,
              severity: 'error',
              node: callExpr,
            })
          }
        }
      }
    }
  },
}
