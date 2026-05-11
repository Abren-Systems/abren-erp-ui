import type { WorkflowInstanceId, RoleId } from '@/shared/types/brand.types'
import type { IsoDate } from '@/shared/domain/business-date'

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
export interface ActionDescriptor {
  action: string
  label: string
  icon?: string
  isPrimary: boolean
  requiresReason: boolean
}

/** Authoritative projection of current operational capabilities. */
export interface WorkflowOperations {
  actions: ActionDescriptor[]
  permissions: Record<string, 'editable' | 'readonly' | 'hidden'>
  version: number
}

/** Enhanced response envelope for workflow-aware entities. */
export interface OperationalResponse<T> {
  success: boolean
  data: T
  operations: WorkflowOperations
  meta?: Record<string, unknown>
}

/** Frontend runtime representation of an operational entity (flattened from envelope). */
export type Operational<T> = T & {
  __operations?: WorkflowOperations
}
