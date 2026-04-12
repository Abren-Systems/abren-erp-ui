import { z } from 'zod'

/**
 * Zod Schemas for Workflows Module.
 * These serve as the "Fail-Fast Shield" at the infrastructure boundary.
 */

export const PendingApprovalSchema = z.object({
  instance_id: z.string().uuid(),
  entity_type: z.string(),
  entity_id: z.string().uuid(),
  current_state: z.string(),
  target_state: z.string().nullable(),
  required_role: z.string().nullable(),
  submitted_at: z.string().datetime().nullable(),
})

export const WorkflowTemplateSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  name: z.string(),
  entity_type: z.string(),
})
