import { apiGet, apiPost } from '@/shared/api/http-client'
import type { PendingApprovalDTO, ApprovalActionDTO, WorkflowPolicyDTO } from './api.types'

const BASE = '/workflows'

/**
 * Workflow API Adapter.
 *
 * Provides typed HTTP methods for interacting with Approval Workflows and Policies.
 */
export const workflowsAdapter = {
  /**
   * Fetches all pending approval tasks for the active session.
   *
   * @returns A promise resolving to an array of PendingApprovalDTOs.
   */
  async getPendingTasks(): Promise<PendingApprovalDTO[]> {
    return apiGet(`${BASE}/approvals/pending`)
  },

  /**
   * Submits a decision (Approve/Reject) for a specific workflow instance.
   *
   * @param instanceId - The unique identifier of the workflow task.
   * @param action - The transition choice and comments.
   * @returns A promise resolving when the decision is persisted.
   */
  async submitDecision(instanceId: string, action: ApprovalActionDTO): Promise<void> {
    return apiPost(`${BASE}/approvals/${instanceId}/actions`, action)
  },

  /**
   * Lists all active workflow routing policies.
   *
   * @returns A promise resolving to an array of WorkflowPolicyDTOs.
   */
  async listPolicies(): Promise<WorkflowPolicyDTO[]> {
    return apiGet(`${BASE}/state/policies`)
  },

  /**
   * Creates a new workflow routing policy.
   *
   * @param policy - The partial policy configuration.
   * @returns A promise resolving to the created WorkflowPolicyDTO.
   */
  async createPolicy(policy: Partial<WorkflowPolicyDTO>): Promise<WorkflowPolicyDTO> {
    return apiPost(`${BASE}/state/policies`, policy)
  },
}
