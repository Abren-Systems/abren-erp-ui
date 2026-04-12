import type { components } from '@/shared/api/generated.types'

/** Consolidated Workflows Domain DTOs (Strictly aligned to backend Pydantic models) */

export type Schemas = components['schemas']

// --- Approval DTOs ---

export type PendingApprovalDTO = Schemas['PendingApprovalResponse']
export type ApprovalActionDTO = Schemas['ApprovalActionCreate']
export type ApprovalStepCreateDTO = Schemas['ApprovalStepCreate']
export type ApprovalPolicyCreateDTO = Schemas['ApprovalPolicyCreate']

// --- Template DTOs ---

export type WorkflowTemplateReadDTO = Schemas['WorkflowTemplateRead']
