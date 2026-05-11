import type { components } from '@/shared/api/generated.types'

/** Consolidated Workflows Domain DTOs (Strictly aligned to backend Pydantic models) */

export type Schemas = components['schemas']

// --- Approval DTOs ---

export type PendingApprovalDTO = Schemas['PendingApprovalDTO']
export type CreateApprovalActionDTO = Schemas['CreateApprovalActionRequest']
export type CreateApprovalStepDTO = Schemas['CreateApprovalStepRequest']
export type CreateApprovalPolicyDTO = Schemas['CreateApprovalPolicyRequest']

// --- Template DTOs ---

export type WorkflowTemplateDTO = Schemas['WorkflowTemplateDTO']
