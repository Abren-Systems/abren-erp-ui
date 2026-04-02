import type { PendingApprovalDTO } from './api.types'
import type { PendingApproval } from '../domain/models/workflow.types'
import type { WorkflowInstanceId, RoleId } from '@/shared/types/brand.types'
import { toId } from '@/shared/types/brand.types'
import { BusinessDate } from '@/shared/domain/business-date'

/**
 * Workflow Mapper-as-Factory.
 *
 * Transforms raw workflow DTOs from the API into clean Frontend Domain Models.
 */
export class WorkflowMapper {
  static toPendingApproval(dto: PendingApprovalDTO): PendingApproval {
    return {
      id: toId<WorkflowInstanceId>(dto.instance_id),
      entityType: dto.entity_type,
      entityId: dto.entity_id,
      currentState: dto.current_state,
      targetState: dto.target_state,
      requiredRole: toId<RoleId>(dto.required_role),
      submittedAt: dto.submitted_at ? BusinessDate.fromIso(dto.submitted_at) : null,
    }
  }
}
