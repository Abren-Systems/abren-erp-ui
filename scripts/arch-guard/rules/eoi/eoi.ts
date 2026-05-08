import type { Rule } from '../../engine/types'
import { SyntaxKind } from 'ts-morph'

export const EOI_RULES: Rule = {
  code: 'EOI',
  description: 'Execution Ownership Invariants (02 & 03)',
  severity: 'error',
  check(context) {
    const filePath = context.sourceFile.getFilePath()
    const isControllerFile = filePath.endsWith('controller.ts')

    if (!isControllerFile) return

    // EOI-03: Controllers must NOT import other controllers
    const imports = context.sourceFile.getDescendantsOfKind(SyntaxKind.ImportDeclaration)
    for (const imp of imports) {
      const moduleSpecifier = imp.getModuleSpecifierValue()
      // If it imports from another module's controller or another folder's controller
      if (moduleSpecifier.endsWith('/controller') || moduleSpecifier.includes('/controller/')) {
        context.report({
          code: 'EOI-03',
          message: `Execution Ownership Violation: Controllers must NOT import other controllers. They should communicate through commands, services, or orchestration contracts.`,
          severity: 'error',
          node: imp,
        })
      }
    }

    // EOI-02: Controllers must not outlive screen lifecycle
    // Look for module-level variables that store reactive state outside the factory function
    const topLevelStatements = context.sourceFile.getStatements()
    for (const stmt of topLevelStatements) {
      if (stmt.getKind() === SyntaxKind.VariableStatement) {
        const varStmt = stmt.asKind(SyntaxKind.VariableStatement)
        if (varStmt) {
          const declarations = varStmt.getDeclarations()
          for (const decl of declarations) {
            const init = decl.getInitializer()
            if (
              init &&
              (init.getText().startsWith('ref(') ||
                init.getText().startsWith('reactive(') ||
                init.getText().startsWith('computed('))
            ) {
              context.report({
                code: 'EOI-02',
                message: `Execution Ownership Violation: Controllers must not outlive screen lifecycle. Module-level reactive singletons found in controller file.`,
                severity: 'error',
                node: decl,
              })
            }
          }
        }
      }
    }
  },
}
