import type { PendingApprovalDTO } from '../../infrastructure/api.types'
import type { PendingApproval } from '../models/workflow.types'

export function mapToPendingApproval(dto: PendingApprovalDTO): PendingApproval {
  return {
    id: dto.instance_id,
    entityType: dto.entity_type,
    entityId: dto.entity_id,
    currentState: dto.current_state,
    targetState: dto.target_state,
    requiredRole: dto.required_role,
    submittedAt: dto.submitted_at ? new Date(dto.submitted_at) : null,
  }
}
