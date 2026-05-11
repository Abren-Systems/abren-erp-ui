import { describe, it, expect } from 'vitest'
import { WorkflowMapper } from '../mappers'
import type { PendingApprovalDTO } from '../api.types'

describe('WorkflowMapper', () => {
  it('should map PendingApprovalDTO to PendingApproval', () => {
    const dto: PendingApprovalDTO = {
      instance_id: 'inst-1',
      entity_type: 'payment_request',
      entity_id: 'pr-1',
      current_state: 'pending_approval',
      target_state: 'approved',
      required_role: 'finance_manager',
      submitted_at: '2026-04-01T10:00:00Z',
    }

    const model = WorkflowMapper.toPendingApproval(dto)

    expect(model.id).toBe('inst-1')
    expect(model.entityType).toBe('payment_request')
    expect(model.entityId).toBe('pr-1')
    expect(model.currentState).toBe('pending_approval')
    expect(model.targetState).toBe('approved')
    expect(model.requiredRole).toBe('finance_manager')
    expect(model.submittedAt).toEqual('2026-04-01')
  })

  it('should handle null submitted_at', () => {
    const dto: PendingApprovalDTO = {
      instance_id: 'inst-1',
      entity_type: 'payment_request',
      entity_id: 'pr-1',
      current_state: 'pending_approval',
      target_state: 'approved',
      required_role: 'finance_manager',
      submitted_at: null as unknown as string,
    }

    const model = WorkflowMapper.toPendingApproval(dto)

    expect(model.submittedAt).toBeNull()
  })
})
