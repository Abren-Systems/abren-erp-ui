import type { WorkflowInstanceId, RoleId } from '@/shared/types/brand.types'
import type { IsoDate } from '@/shared/domain/business-date'
import { z } from 'zod'

export interface PendingApproval {
  id: WorkflowInstanceId
  entityType: string
  entityId: string
  currentState: string
  targetState: string | null
  requiredRole: RoleId
  submittedAt: IsoDate | null
}

export type ApprovalAction = 'APPROVE' | 'REJECT'

// ---------------------------------------------------------------------------
// Projection Tier Branding (ADR-0018)
// ---------------------------------------------------------------------------
declare const projectionTier: unique symbol

export type ProjectionTier = 'reference' | 'lightweight' | 'full'

type ProjectionBranded<TTier extends ProjectionTier> = {
  readonly [projectionTier]: TTier
}

// ---------------------------------------------------------------------------
// Action Descriptor
// ---------------------------------------------------------------------------
/** Semantic description of a workflow action. */
export const ActionDescriptorSchema = z
  .object({
    action: z.string(),
    label: z.string(),
    icon: z.string().nullable().optional(),
    is_primary: z.boolean().default(false),
    requires_reason: z.boolean().default(false),
    variant: z.enum(['default', 'destructive', 'success', 'warning']).nullable().optional(),
    confirmation: z
      .object({
        title: z.string(),
        message: z.string(),
      })
      .nullable()
      .optional(),
  })
  .transform((val) => ({
    action: val.action,
    label: val.label,
    icon: val.icon,
    isPrimary: val.is_primary,
    requiresReason: val.requires_reason,
    variant: val.variant ?? 'default',
    confirmation: val.confirmation,
  }))

export type ActionDescriptor = z.infer<typeof ActionDescriptorSchema>

// ---------------------------------------------------------------------------
// Tiered Operations Schemas (ADR-0018)
// ---------------------------------------------------------------------------

/** Tier 0 — Base concurrency token. */
export const BaseOperationsSchema = z.object({
  version: z.number().int().default(1),
})

export type BaseOperations = z.infer<typeof BaseOperationsSchema>

/** Tier 1 — Lightweight projection for lists and grids. */
export const LightweightOperationsSchema = BaseOperationsSchema.extend({
  lifecycle_status: z.string().nullable().optional(),
}).transform((val) => ({
  version: val.version,
  lifecycleStatus: val.lifecycle_status ?? undefined,
}))

export type LightweightOperations = z.infer<typeof LightweightOperationsSchema>

/** Tier 2 — Full authoritative projection with capability graph. */
export const FullOperationsSchema = z
  .object({
    actions: z.array(ActionDescriptorSchema),
    permissions: z.record(z.enum(['editable', 'readonly', 'hidden'])),
    version: z.number().int().default(1),
    lifecycle_status: z.string().nullable().optional(),
  })
  .transform((val) => ({
    actions: val.actions,
    permissions: val.permissions,
    version: val.version,
    lifecycleStatus: val.lifecycle_status ?? undefined,
  }))

export type FullOperations = z.infer<typeof FullOperationsSchema>

// ---------------------------------------------------------------------------
// Response Envelopes
// ---------------------------------------------------------------------------

/** Tier 1 response envelope for paginated lists. */
export interface LightweightOperationalResponse<T> {
  success: boolean
  data: T
  operations: LightweightOperations
  meta?: Record<string, unknown>
}

/** Tier 2 response envelope for workflow-aware entities. */
export interface OperationalResponse<T> {
  success: boolean
  data: T
  operations: FullOperations
  meta?: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// Operational Entity Types (Nominally Branded)
// ---------------------------------------------------------------------------

/** Plain reference entity — Tier 0. No operational metadata. */
export type ReferenceEntity<T> = T

/** Lightweight operational entity — Tier 1. For grids and lists. */
export type LightweightOperationalEntity<T> = T &
  ProjectionBranded<'lightweight'> & {
    __operations: LightweightOperations
  }

/** Full operational entity — Tier 2. For detail views and mutations. */
export type OperationalEntity<T> = T &
  ProjectionBranded<'full'> & {
    __operations: FullOperations
  }
