import { CommonMapper } from '@/shared/infrastructure/mappers'
import type { PendingApprovalDTO } from './api.types'
import type { PendingApproval } from '../domain/workflows.types'
import type { WorkflowInstanceId, RoleId } from '@/shared/types/brand.types'

/**
 * Workflow Mapper-as-Factory.
 *
 * Transforms raw workflow DTOs from the API into clean Frontend Domain Models.
 */
export class WorkflowMapper {
  static toPendingApproval(dto: PendingApprovalDTO): PendingApproval {
    return {
      id: CommonMapper.toBrandedId<WorkflowInstanceId>(dto.instance_id),
      entityType: dto.entity_type,
      entityId: dto.entity_id,
      currentState: dto.current_state,
      targetState: dto.target_state,
      requiredRole: CommonMapper.toBrandedId<RoleId>(dto.required_role),
      submittedAt: CommonMapper.toDate(dto.submitted_at),
    }
  }
}
