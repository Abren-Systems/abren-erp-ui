import { defineAsyncComponent } from 'vue'
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
    // Fallback to text input if no specialized Money editor exists yet
    displayRenderer: defineAsyncComponent(
      () => import('@/shared/components/primitives/input/AppInput.vue'),
    ),
    editorRenderer: defineAsyncComponent(
      () => import('@/shared/components/primitives/input/AppInput.vue'),
    ),
  },

  [SemanticKind.Status]: {
    formatter: (value) =>
      value == null ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value),
    displayRenderer: defineAsyncComponent(
      () => import('@/shared/components/primitives/badge/AppBadge.vue'),
    ),
  },

  [SemanticKind.LedgerAccount]: {
    displayRenderer: defineAsyncComponent(
      () => import('@/shared/components/primitives/input/AppInput.vue'),
    ),
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
    displayRenderer: defineAsyncComponent(
      () => import('@/shared/components/primitives/input/AppInput.vue'),
    ),
  },

  [SemanticKind.Currency]: {
    displayRenderer: defineAsyncComponent(
      () => import('@/shared/components/primitives/input/AppInput.vue'),
    ),
  },

  [SemanticKind.Vendor]: {
    displayRenderer: defineAsyncComponent(
      () => import('@/shared/components/primitives/input/AppInput.vue'),
    ),
  },

  [SemanticKind.Email]: {
    displayRenderer: defineAsyncComponent(
      () => import('@/shared/components/primitives/input/AppInput.vue'),
    ),
  },

  [SemanticKind.Phone]: {
    displayRenderer: defineAsyncComponent(
      () => import('@/shared/components/primitives/input/AppInput.vue'),
    ),
  },

  [SemanticKind.Date]: {
    formatter: (value) => {
      if (!value) return ''
      // Simplified date formatter
      try {
        const d = new Date(value as string | number | Date)
        return d.toLocaleDateString()
      } catch {
        return typeof value === 'object' ? JSON.stringify(value) : String(value)
      }
    },
    displayRenderer: defineAsyncComponent(
      () => import('@/shared/components/primitives/input/AppInput.vue'),
    ),
  },
}

export function resolveSemantic(kind: SemanticKind): SemanticRuntime {
  const runtime = semanticRegistry[kind]
  if (!runtime) {
    throw new Error(`[SemanticRuntime] Unregistered SemanticKind: ${kind}`)
  }
  return runtime
}
