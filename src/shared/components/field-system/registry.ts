/**
 * Field Definition System — Central Registry.
 *
 * This is the single source of truth for field presentation across the entire ERP.
 * It exists to enable a future metadata-driven UI runtime without rewriting screens.
 *
 * Principles:
 * 1. Configuration over code — no one-off formatters in templates.
 * 2. Generic types, contextual behavior — no type explosion.
 * 3. Empty state semantics — null, 0, "", [] are distinct.
 *
 * @see docs/FIELD_SYSTEM.md for full architectural reference.
 */

import { Money } from '@/shared/domain/money'

// --- Type Definitions ---

export type FieldType = 'text' | 'money' | 'status' | 'date' | 'id' | 'number'

export type FieldAlign = 'left' | 'right'
export type FieldEmphasis = 'normal' | 'strong' | 'muted'

/**
 * Rendering hints for domain-aware field display.
 *
 * CONSTRAINT: FieldContext is for rendering hints ONLY.
 * Allowed: entity name, field name.
 * NOT allowed: permissions, workflow state, user roles, or any business logic inputs.
 */
export interface FieldContext {
  /** The domain entity name, e.g. "PaymentRequest", "VendorBill" */
  entity?: string
  /** The field key, e.g. "status", "totalAmount" */
  field?: string
}

/**
 * Defines how a field type renders, formats, aligns, and handles empty state.
 */
export interface FieldDefinition {
  /** Format a raw domain value into a display string */
  format: (value: unknown, ctx?: FieldContext) => string
  /** Text alignment */
  align: FieldAlign
  /** Visual emphasis */
  emphasis: FieldEmphasis
  /** Determine if a value is "empty" for this type. Defaults to null/undefined check. */
  empty: (value: unknown) => boolean
  /** Display string for empty values. Defaults to "—". */
  emptyDisplay: string
  /** CSS variant resolver (used by 'status' type for badge coloring) */
  variant?: (value: unknown, ctx?: FieldContext) => string
}

// --- Status Variant Resolver ---

/**
 * Maps common ERP status strings to semantic CSS variants.
 * Context-aware: can be extended per-entity in the future.
 */
function resolveStatusVariant(value: unknown, _ctx?: FieldContext): string {
  const status = String(value).toUpperCase()
  const map: Record<string, string> = {
    DRAFT: 'neutral',
    SUBMITTED: 'info',
    APPROVED: 'success',
    AUTHORIZED: 'success',
    REJECTED: 'danger',
    CANCELLED: 'danger',
    PAID: 'success',
    VALIDATED: 'success',
    PENDING: 'warning',
    OVERDUE: 'danger',
  }
  return map[status] ?? 'neutral'
}

// --- Default Empty Check ---

function isNullish(value: unknown): boolean {
  return value === null || value === undefined
}

// --- Built-in Field Definitions ---

const definitions = new Map<FieldType, FieldDefinition>([
  [
    'text',
    {
      format: (v) => String(v),
      align: 'left',
      emphasis: 'normal',
      empty: (v) => v === null || v === undefined || v === '',
      emptyDisplay: '—',
    },
  ],
  [
    'money',
    {
      format: (v) => {
        if (v instanceof Money) return v.format('en-ET')
        if (typeof v === 'number') return Money.from(v, 'ETB').format('en-ET')
        return String(v)
      },
      align: 'right',
      emphasis: 'strong',
      empty: isNullish,
      emptyDisplay: '—',
    },
  ],
  [
    'status',
    {
      format: (v) => String(v),
      align: 'left',
      emphasis: 'normal',
      empty: (v) => v === null || v === undefined || v === '',
      emptyDisplay: '—',
      variant: resolveStatusVariant,
    },
  ],
  [
    'date',
    {
      format: (v) => {
        if (v instanceof Date) {
          return v.toLocaleDateString('en-ET', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })
        }
        return String(v)
      },
      align: 'left',
      emphasis: 'normal',
      empty: isNullish,
      emptyDisplay: '—',
    },
  ],
  [
    'id',
    {
      format: (v) => String(v),
      align: 'left',
      emphasis: 'muted',
      empty: (v) => v === null || v === undefined || v === '',
      emptyDisplay: '—',
    },
  ],
  [
    'number',
    {
      format: (v) => {
        if (typeof v === 'number') return v.toLocaleString()
        return String(v)
      },
      align: 'right',
      emphasis: 'normal',
      empty: isNullish,
      emptyDisplay: '—',
    },
  ],
])

// --- Public API ---

/**
 * Resolve the field definition for a given type.
 * Falls back to 'text' if the type is not registered.
 */
export function resolveField(type: FieldType): FieldDefinition {
  return definitions.get(type) ?? (definitions.get('text') as FieldDefinition)
}
