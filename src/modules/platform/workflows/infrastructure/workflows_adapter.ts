import { apiGet, apiPost } from '@/core/api/http-client'
import type { PendingApprovalDTO, ApprovalActionDTO, WorkflowPolicyDTO } from './api.types'

const BASE = '/workflows'

export const workflowsAdapter = {
  getPendingTasks: (): Promise<PendingApprovalDTO[]> => 
    apiGet(`${BASE}/approvals/pending`),

  submitDecision: (instanceId: string, action: ApprovalActionDTO): Promise<void> => 
    apiPost(`${BASE}/approvals/${instanceId}/actions`, action),

  listPolicies: (): Promise<WorkflowPolicyDTO[]> => 
    apiGet(`${BASE}/state/policies`),

  createPolicy: (policy: Partial<WorkflowPolicyDTO>): Promise<WorkflowPolicyDTO> => 
    apiPost(`${BASE}/state/policies`, policy),
}
