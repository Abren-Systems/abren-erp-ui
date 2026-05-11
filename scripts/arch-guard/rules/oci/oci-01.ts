import type { Rule } from '../../engine/types'

/**
 * OCI-01: Authority Inference Ban
 *
 * Controllers and views must NOT compute field editability from status strings.
 * The backend provides `field_permissions` and `available_actions` — the frontend
 * must consume those, never re-derive them from status.
 *
 * Banned patterns:
 *   - status === 'DRAFT' (used to infer editability)
 *   - status !== 'CANCELLED' (used to infer action visibility)
 *   - isEditable = status === ... (manual permission derivation)
 *
 * Allowed:
 *   - Status checks in test files
 *   - Status display in templates (badge color, label text)
 *   - Status type definitions in schema files
 */
export const OCI01: Rule = {
  code: 'OCI-01',
  description:
    'Authority Inference Ban: Controllers/views must not derive field permissions from status strings. Use backend-provided field_permissions.',
  severity: 'error',
  check(context) {
    const filePath = context.sourceFile.getFilePath()

    // Only check controller and view files
    const isController = filePath.includes('controller')
    const isView = filePath.endsWith('view.vue.ts') || filePath.endsWith('View.vue.ts')
    const isComposable = filePath.includes('composables/')

    if (!isController && !isView && !isComposable) return

    // Skip test files
    if (
      filePath.includes('__tests__') ||
      filePath.includes('.spec.') ||
      filePath.includes('.test.')
    )
      return

    const content = context.sourceFile.getFullText()
    const lines = content.split('\n')

    // Patterns that indicate status-based permission derivation
    const inferencePatterns = [
      // Direct status equality checks used for editability
      /(?:isEditable|canEdit|editable|readonly|disabled)\s*[:=]\s*.*status\s*[=!]==?\s*['"`]/,
      // Ternary or conditional based on status for field control
      /status\s*[=!]==?\s*['"`](?:DRAFT|SUBMITTED|APPROVED|AUTHORIZED|REJECTED|CANCELLED|VALIDATED)['"`]\s*\?\s*(?:true|false|'editable'|'readonly')/,
      // canTransitionTo pattern (should be dead after Phase 2)
      /canTransitionTo\s*\(/,
      // Manual isEditable/isFinal derivation
      /(?:isEditable|isFinal|isTerminal)\s*\(\s*(?:status|entity)/,
    ]

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      for (const pattern of inferencePatterns) {
        if (pattern.test(line)) {
          context.report({
            code: 'OCI-01',
            message: `Authority Inference Ban: Do not derive permissions from status strings. Use backend-provided 'field_permissions' or 'available_actions' instead. Found: ${line.trim().substring(0, 80)}`,
            severity: 'error',
            line: i + 1,
          })
          break // Only report once per line
        }
      }
    }
  },
}
