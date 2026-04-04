import { describe, it, expect } from 'vitest'
import { IdentityMapper } from '../mappers'

describe('IdentityMapper', () => {
  it('should map user DTO to User domain model', () => {
    const dto = {
      id: 'user-1',
      email: 'test@abren.com',
      status: 'ACTIVE' as const,
      tenant_id: 'tenant-1',
      roles: [{ role_id: 'role-1', name: 'Admin' }],
      last_login_at: '2026-04-01T12:00:00Z',
    }

    const model = IdentityMapper.toUser(dto)

    expect(model.id).toBe('user-1')
    expect(model.email).toBe('test@abren.com')
    expect(model.status).toBe('ACTIVE')
    expect(model.roles).toHaveLength(1)
    expect(model.roles[0].name).toBe('Admin')
    expect(model.lastLoginAt).toEqual(new Date('2026-04-01T12:00:00Z'))
  })
})
