import type { Rule } from '../../engine/types'
import { SyntaxKind } from 'ts-morph'

export const SNI_RULES: Rule = {
  code: 'SNI',
  description: 'Snapshot Integrity Invariants',
  severity: 'error',
  check(context) {
    const filePath = context.sourceFile.getFilePath()

    // SNI-02 & SNI-03: ScreenModel types must not contain functions or refs
    if (filePath.endsWith('screen-model.types.ts')) {
      // Find the ScreenModel interface/type
      const interfaces = context.sourceFile.getInterfaces()
      for (const intf of interfaces) {
        if (intf.getName() === 'ScreenModel') {
          // Check for function properties or references to Vue reactivity types
          const typeNodes = intf.getDescendantsOfKind(SyntaxKind.TypeReference)
          for (const typeNode of typeNodes) {
            const name = typeNode.getTypeName().getText()
            if (['Ref', 'ComputedRef'].includes(name)) {
              context.report({
                code: 'SNI-03',
                message: `Snapshot Integrity Violation: No reactive refs allowed inside projection output. Found '${name}'.`,
                severity: 'error',
                node: typeNode,
              })
            }
            if (name === 'Function' || name.includes('=>')) {
              context.report({
                code: 'SNI-02',
                message: `Snapshot Integrity Violation: No functions or closures allowed inside ScreenModel.`,
                severity: 'error',
                node: typeNode,
              })
            }
          }

          const functionTypes = intf.getDescendantsOfKind(SyntaxKind.FunctionType)
          for (const funcType of functionTypes) {
            context.report({
              code: 'SNI-02',
              message: `Snapshot Integrity Violation: No functions or closures allowed inside ScreenModel.`,
              severity: 'error',
              node: funcType,
            })
          }
        }
      }
    }
  },
}
