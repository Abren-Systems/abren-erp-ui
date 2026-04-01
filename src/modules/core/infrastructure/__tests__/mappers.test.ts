import { describe, it, expect } from 'vitest'
import { CoreMapper } from '../mappers'
import { UserStatus } from '../../domain/user.types'

describe('CoreMapper', () => {
  it('should map user DTO to User domain model', () => {
    const dto = {
      id: 'user-1',
      email: 'test@abren.com',
      role: 'Admin',
      status: 'Active',
      tenant_id: 'tenant-1',
      last_login_at: '2026-04-01T12:00:00Z',
    }

    const model = CoreMapper.toUser(dto)

    expect(model.id).toBe('user-1')
    expect(model.email).toBe('test@abren.com')
    expect(model.status).toBe(UserStatus.Active)
    expect(model.lastLoginAt).toEqual(new Date('2026-04-01T12:00:00Z'))
  })
})
