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

/** Semantic description of a workflow action. */
export const ActionDescriptorSchema = z
  .object({
    action: z.string(),
    label: z.string(),
    icon: z.string().nullable().optional(),
    is_primary: z.boolean().default(false),
    requires_reason: z.boolean().default(false),
  })
  .transform((val) => ({
    action: val.action,
    label: val.label,
    icon: val.icon,
    isPrimary: val.is_primary,
    requiresReason: val.requires_reason,
  }))

export type ActionDescriptor = z.infer<typeof ActionDescriptorSchema>

/** Authoritative projection of current operational capabilities. */
export const WorkflowOperationsSchema = z.object({
  actions: z.array(ActionDescriptorSchema),
  permissions: z.record(z.enum(['editable', 'readonly', 'hidden'])),
  version: z.number().int().default(1),
})

export type WorkflowOperations = z.infer<typeof WorkflowOperationsSchema>

/** Enhanced response envelope for workflow-aware entities. */
export interface OperationalResponse<T> {
  success: boolean
  data: T
  operations: WorkflowOperations
  meta?: Record<string, unknown>
}

/** Frontend runtime representation of an operational entity (flattened from envelope). */
export type OperationalEntity<T> = T & {
  __operations: WorkflowOperations
}
