import type { Rule } from '../../engine/types'
import { SyntaxKind } from 'ts-morph'

export const PII01: Rule = {
  code: 'PII-01',
  description: 'Views must use useScreenControllerContext instead of inject(ScreenControllerKey)',
  severity: 'error',
  check(context) {
    const filePath = context.sourceFile.getFilePath()
    const baseName = context.sourceFile.getBaseName()

    // Only apply to view.vue files inside modules
    if (
      !context.isVueFile ||
      !baseName.startsWith('view.vue') ||
      !filePath.includes('/src/modules/')
    )
      return

    const importDeclarations = context.sourceFile.getDescendantsOfKind(SyntaxKind.ImportDeclaration)

    for (const decl of importDeclarations) {
      const namedImports = decl.getImportClause()?.getNamedBindings()
      if (namedImports && namedImports.isKind(SyntaxKind.NamedImports)) {
        for (const element of namedImports.getElements()) {
          if (element.getName() === 'ScreenControllerKey') {
            context.report({
              code: 'PII-01',
              message:
                'Projection Integrity Violation: Direct injection of ScreenControllerKey is banned in views. Use `useScreenControllerContext` for a null-safe projection boundary.',
              severity: 'error',
              node: element,
            })
          }
        }
      }
    }
  },
}

export const PII02: Rule = {
  code: 'PII-02',
  description:
    'Views must be pure projection interpreters and cannot accumulate mutable UI state (ref, reactive, computed).',
  severity: 'error',
  check(context) {
    const filePath = context.sourceFile.getFilePath()

    if (!context.isVueFile || !filePath.includes('/src/modules/')) return

    const fileText = context.sourceFile.getFullText()

    // Crude disable check
    if (fileText.includes('// arch-guard-disable PII-02')) return

    // Regex to find `import { ref, reactive, computed } from 'vue'`
    // Since AST parsing for .vue files fails in ts-morph without extraction
    if (fileText.match(/import\s+{[^}]*(ref|reactive|computed)[^}]*}\s+from\s+['"]vue['"]/)) {
      context.report({
        code: 'PII-02',
        message:
          'Projection Purity Violation: Views cannot accumulate mutable state (ref/reactive/computed). They must read from the projection and emit intents.',
        severity: 'error',
        node: context.sourceFile,
      })
    }
  },
}

export const PII03: Rule = {
  code: 'PII-03',
  description:
    'Module controllers must utilize useScreenController to participate in the canonical runtime topology.',
  severity: 'error',
  check(context) {
    const filePath = context.sourceFile.getFilePath()
    const baseName = context.sourceFile.getBaseName()

    // Only apply to controller.ts files inside modules
    if (baseName !== 'controller.ts' || !filePath.includes('/src/modules/')) return

    // Skip test files
    if (filePath.includes('.test.') || filePath.includes('.spec.')) return

    const fileText = context.sourceFile.getFullText()

    // Crude disable check
    if (fileText.includes('// arch-guard-disable PII-03')) return

    const callExpressions = context.sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)
    let usesScreenController = false

    for (const callExpr of callExpressions) {
      const expr = callExpr.getExpression()
      if (expr.getText() === 'useScreenController') {
        usesScreenController = true
        break
      }
    }

    if (!usesScreenController) {
      context.report({
        code: 'PII-03',
        message:
          'Runtime Topology Violation: Controller is missing useScreenController(). This indicates a parallel "fake" controller architecture.',
        severity: 'error',
        node: context.sourceFile,
      })
    }
  },
}

export const PII_RULES = [PII01, PII02, PII03]
