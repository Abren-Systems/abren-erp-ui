import type { Rule } from '../../engine/types'
import { SyntaxKind } from 'ts-morph'

export const ABI02: Rule = {
  code: 'ABI-02',
  description: 'Views must NOT evaluate workflow/business conditions directly.',
  severity: 'error',
  check(context) {
    if (!context.isVueFile) return
    const isViewFile =
      context.sourceFile.getFilePath().endsWith('view.vue.ts') ||
      context.sourceFile.getFilePath().includes('Dialog.vue.ts')
    if (!isViewFile) return

    // AST check for `entity.status === 'SOMETHING'` or similar.
    // In Vue SFCs, this logic might be in the template (which ts-morph doesn't parse natively)
    // or in the `<script>` block.
    // We can at least check the script block for derivations.

    const binaryExpressions = context.sourceFile.getDescendantsOfKind(SyntaxKind.BinaryExpression)

    for (const expr of binaryExpressions) {
      const left = expr.getLeft()
      const leftText = left.getText()

      // Look for things like `entity.status` or `entity.value.status`
      if (
        leftText.includes('entity.status') ||
        leftText.includes('entity.value.status') ||
        leftText.includes('.status.value')
      ) {
        context.report({
          code: 'ABI-02',
          message: `[CONSTITUTIONAL RULE #1] Views must NOT evaluate workflow/business conditions directly. Use ScreenModel capabilities instead. Found evaluation of: ${leftText}`,
          severity: 'error',
          node: expr,
        })
      }
    }

    // For the template, we'll have to use regex on the raw content because ts-morph only parses the script block.
    // We are looking for: v-if="...entity.status..."
    const rawLines = context.rawContent.split('\n')
    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i]
      if (
        line.includes('entity.status') ||
        line.includes('entity?.status') ||
        line.includes("['status']")
      ) {
        // Simple heuristic for template bindings
        if (line.includes('v-if=') || line.includes('v-show=') || line.includes(':disabled=')) {
          context.report({
            code: 'ABI-02',
            message: `[CONSTITUTIONAL RULE #1] Views must NOT evaluate workflow/business conditions directly in templates. Use ScreenModel capabilities.`,
            severity: 'error',
            line: i + 1,
            column: line.indexOf('entity'),
          })
        }
      }
    }
  },
}
