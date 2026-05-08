import type { Rule } from '../../engine/types'
import { SyntaxKind } from 'ts-morph'

export const DPI01_03: Rule = {
  code: 'DPI',
  description:
    'Projection layer must be deterministic and pure (no Date, Math.random, async, or router).',
  severity: 'error',
  check(context) {
    const filePath = context.sourceFile.getFilePath()

    const isProjectionFile =
      filePath.endsWith('resolve-screen-model.ts') ||
      filePath.endsWith('screen-state-policy.types.ts') ||
      filePath.includes('policy.ts')

    if (!isProjectionFile) return

    // DPI-03: No async/await
    const asyncKeywords = context.sourceFile.getDescendantsOfKind(SyntaxKind.AsyncKeyword)
    for (const node of asyncKeywords) {
      context.report({
        code: 'DPI-03',
        message: 'Projection resolution must be purely synchronous. No async/await allowed.',
        severity: 'error',
        node,
      })
    }

    // DPI-01: No Date.now, new Date, Math.random
    const callExpressions = context.sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)
    for (const callExpr of callExpressions) {
      const exprText = callExpr.getExpression().getText()
      if (exprText === 'Date.now' || exprText === 'Math.random') {
        context.report({
          code: 'DPI-01',
          message: `Projection layer must remain deterministic. Use of '${exprText}' is forbidden.`,
          severity: 'error',
          node: callExpr,
        })
      }
    }

    const newExpressions = context.sourceFile.getDescendantsOfKind(SyntaxKind.NewExpression)
    for (const newExpr of newExpressions) {
      if (newExpr.getExpression().getText() === 'Date') {
        context.report({
          code: 'DPI-01',
          message: `Projection layer must remain deterministic. Use of 'new Date()' is forbidden.`,
          severity: 'error',
          node: newExpr,
        })
      }
    }

    // DPI-02: No router access
    const importDeclarations = context.sourceFile.getDescendantsOfKind(SyntaxKind.ImportDeclaration)
    for (const importDecl of importDeclarations) {
      if (importDecl.getModuleSpecifierValue() === 'vue-router') {
        context.report({
          code: 'DPI-02',
          message: 'Projection layer must not access the router. State resolution should be pure.',
          severity: 'error',
          node: importDecl,
        })
      }
    }
  },
}
