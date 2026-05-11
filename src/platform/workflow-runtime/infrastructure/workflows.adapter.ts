import { apiGet, apiPost } from '@/shared/api/http-client'
import { PendingApprovalSchema } from './api.schemas'
import { WorkflowMapper } from './mappers'
import type { PendingApproval } from '../models/workflows.types'
import type { CreateApprovalActionDTO, CreateApprovalPolicyDTO } from './api.types'

const BASE = '/workflows'

/**
 * Workflow API Adapter — Gold Standard Implementation.
 *
 * Provides typed HTTP methods for interacting with Approval Workflows.
 * Includes boundary shielding via Zod and Mapper-as-Factory for domain purity.
 */
export const workflowsAdapter = {
  /**
   * Fetches all pending approval tasks and maps them to Domain Models.
   */
  async getPendingTasks(): Promise<PendingApproval[]> {
    const raw = await apiGet<unknown[]>(`${BASE}/approvals/pending`)
    return raw.map((item) => {
      const dto = PendingApprovalSchema.parse(item)
      return WorkflowMapper.toPendingApproval(dto)
    })
  },

  /**
   * Submits a decision (Approve/Reject) for a specific workflow instance.
   */
  async submitDecision(instanceId: string, action: CreateApprovalActionDTO): Promise<void> {
    await apiPost(`${BASE}/approvals/${instanceId}/actions`, action)
  },

  /**
   * Creates a new workflow routing policy.
   */
  async createPolicy(policy: CreateApprovalPolicyDTO): Promise<void> {
    await apiPost(`${BASE}/state/policies`, policy)
  },
}
