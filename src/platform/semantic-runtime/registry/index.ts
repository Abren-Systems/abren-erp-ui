import { SemanticKind } from '../contracts'
import type { SemanticRuntime } from '../runtimes'
import { SemanticPolicies } from '../policies'

/**
 * SMI-04: Compile-time semantic registry mapping SemanticKind to SemanticRuntime.
 * Dynamic runtime registration is intentionally banned to preserve determinism.
 */
export const semanticRegistry: Record<SemanticKind, SemanticRuntime> = {
  [SemanticKind.Money]: {
    formatter: (value, _context) => {
      if (value == null) return ''
      const num = Number(value)
      if (isNaN(num)) return typeof value === 'object' ? JSON.stringify(value) : String(value)

      const precision = SemanticPolicies[SemanticKind.Money].precision || 2
      const formatted = num.toFixed(precision)

      if (num < 0 && SemanticPolicies[SemanticKind.Money].negativeStyle === 'parentheses') {
        return `(${Math.abs(num).toFixed(precision)})`
      }
      return formatted
    },
    parser: (value) => {
      if (!value) return null
      const parsed = parseFloat(value.toString().replace(/[^0-9.-]+/g, ''))
      return isNaN(parsed) ? null : parsed
    },
    displayRendererKey: 'AppInput',
    editorRendererKey: 'AppInput',
  },

  [SemanticKind.Status]: {
    formatter: (value) =>
      value == null ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value),
    displayRendererKey: 'AppBadge',
  },

  [SemanticKind.LedgerAccount]: {
    displayRendererKey: 'AppInput',
  },

  [SemanticKind.Quantity]: {
    formatter: (value) => {
      if (value == null) return ''
      const num = Number(value)
      return isNaN(num)
        ? typeof value === 'object'
          ? JSON.stringify(value)
          : String(value)
        : num.toFixed(SemanticPolicies[SemanticKind.Quantity].precision || 4)
    },
    displayRendererKey: 'AppInput',
  },

  [SemanticKind.Currency]: {
    displayRendererKey: 'AppInput',
  },

  [SemanticKind.Vendor]: {
    displayRendererKey: 'AppInput',
  },

  [SemanticKind.Email]: {
    displayRendererKey: 'AppInput',
  },

  [SemanticKind.Phone]: {
    displayRendererKey: 'AppInput',
  },

  [SemanticKind.Date]: {
    formatter: (value) => {
      if (!value) return ''
      try {
        const d = new Date(value as string | number | Date)
        return d.toLocaleDateString()
      } catch {
        return typeof value === 'object' ? JSON.stringify(value) : String(value)
      }
    },
    displayRendererKey: 'AppInput',
  },
}

export function resolveSemantic(kind: SemanticKind): SemanticRuntime {
  const runtime = semanticRegistry[kind]
  if (!runtime) {
    throw new Error(`[SemanticRuntime] Unregistered SemanticKind: ${kind}`)
  }
  return runtime
}
