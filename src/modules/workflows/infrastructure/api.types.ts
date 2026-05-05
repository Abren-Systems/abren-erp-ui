import type { components } from '@/shared/api/generated.types'

/** Consolidated Workflows Domain DTOs (Strictly aligned to backend Pydantic models) */

export type Schemas = components['schemas']

// --- Approval DTOs ---

export type PendingApprovalDTO = Schemas['PendingApprovalDTO']
export type ApprovalActionDTO = Schemas['CreateApprovalActionRequest']
export type ApprovalStepCreateDTO = Schemas['CreateApprovalStepRequest']
export type ApprovalPolicyCreateDTO = Schemas['CreateApprovalPolicyRequest']

// --- Template DTOs ---

export type WorkflowTemplateReadDTO = Schemas['WorkflowTemplateDTO']
