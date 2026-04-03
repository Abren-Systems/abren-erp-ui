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
