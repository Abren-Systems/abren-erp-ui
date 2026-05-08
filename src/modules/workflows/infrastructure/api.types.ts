import type { components } from '@/shared/api/generated.types'

/** Consolidated Workflows Domain DTOs (Strictly aligned to backend Pydantic models) */

export type Schemas = components['schemas']

// --- Approval DTOs ---

export type PendingApprovalDTO = Schemas['PendingApprovalResponse']
export type CreateApprovalActionDTO = Schemas['ApprovalActionCreate']
export type CreateApprovalStepDTO = Schemas['ApprovalStepCreate']
export type CreateApprovalPolicyDTO = Schemas['ApprovalPolicyCreate']

// --- Template DTOs ---

export type WorkflowTemplateDTO = Schemas['WorkflowTemplateRead']
