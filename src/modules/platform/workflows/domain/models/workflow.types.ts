export interface PendingApproval {
  id: string
  entityType: string
  entityId: string
  currentState: string
  targetState: string | null
  requiredRole: string
  submittedAt: Date | null
}

export type ApprovalAction = 'APPROVE' | 'REJECT'
