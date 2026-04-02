import type { PendingApprovalDTO } from './api.types'
import type { PendingApproval } from '../domain/models/workflow.types'

/**
 * Workflow Mapper-as-Factory.
 *
 * Transforms raw workflow DTOs from the API into clean Frontend Domain Models.
 */
export class WorkflowMapper {
  static toPendingApproval(dto: PendingApprovalDTO): PendingApproval {
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
}
