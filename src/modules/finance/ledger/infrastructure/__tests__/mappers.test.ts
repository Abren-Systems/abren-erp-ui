import { describe, it, expect } from 'vitest'
import { LedgerMapper } from '../mappers'
import { Currency } from '../../../../../shared/domain/currency'
import type { components } from '../../../../../shared/api/generated.types'

type AccountRead = components['schemas']['AccountRead']

describe('LedgerMapper', () => {
  describe('toAccount', () => {
    it('should map AccountRead to Account model', () => {
      const dto: AccountRead = {
        id: 'acc-1',
        code: 1010,
        name: 'Cash in Bank',
        account_type: 'ASSET',
        is_active: true,
      }

      const model = LedgerMapper.toAccount(dto)

      expect(model.id).toBe('acc-1')
      expect(model.code).toBe('1010')
      expect(model.name).toBe('Cash in Bank')
      expect(model.type).toBe('asset')
      expect(model.currency).toBe(Currency.ETB)
      expect(model.isActive).toBe(true)
      expect(model.balance.amount).toBe(0)
    })
  })
})
