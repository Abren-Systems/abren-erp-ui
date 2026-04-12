import { describe, it, expect } from 'vitest'
import { BankMapper } from '../mappers'
import { Currency } from '../../../../../shared/domain/money'
import type { components } from '../../../../../shared/api/generated.types'
import { toId } from '../../../../../shared/types/brand.types'
import type { BankAccountId } from '../../../../../shared/types/brand.types'

type BankAccountDTO = components['schemas']['BankAccountSchema']
type BankTransactionDTO = components['schemas']['BankTransactionSchema']

describe('BankMapper', () => {
  describe('toBankAccount', () => {
    it('should map BankAccountDTO to BankAccount model', () => {
      const dto: BankAccountDTO = {
        id: '019524f5-9a3c-7d2e-b145-68c3a7e1f9d0',
        tenant_id: '019524f5-9a3c-7d2e-b145-68c3a7e1f9d1',
        name: 'Main Operating Account',
        account_number: '1000123456789',
        bank_name: 'Commercial Bank of Ethiopia',
        account_type: 'CHECKING',
        currency_code: 'ETB',
        current_balance: '150000.50',
        is_active: true,
        is_default: true,
      }

      const model = BankMapper.toBankAccount(dto)

      expect(model.id).toBe(dto.id)
      expect(model.bankName).toBe('Commercial Bank of Ethiopia')
      expect(model.accountNumber).toBe('1000123456789')
      expect(model.accountName).toBe('Main Operating Account')
      expect(model.currency).toBe(Currency.ETB)
      expect(model.balance.amount).toBe(150000.5)
      expect(model.isDefault).toBe(true)
      expect(model.status).toBe('ACTIVE')
    })

    it('should map inactive account status correctly', () => {
      const dto: BankAccountDTO = {
        id: '019524f5-9a3c-7d2e-b145-68c3a7e1f9d0',
        tenant_id: '019524f5-9a3c-7d2e-b145-68c3a7e1f9d1',
        name: 'Savings Account',
        account_number: '2000123456789',
        bank_name: 'Abyssinia Bank',
        account_type: 'SAVINGS',
        currency_code: 'ETB',
        current_balance: '500.00',
        is_active: false,
        is_default: false,
      }

      const model = BankMapper.toBankAccount(dto)
      expect(model.status).toBe('INACTIVE')
    })
  })

  describe('toTransaction', () => {
    it('should map BankTransactionDTO to BankTransaction model', () => {
      const accountId = toId<BankAccountId>('acc-123')
      const dto: BankTransactionDTO = {
        id: '019524f5-9a3c-7d2e-b145-68c3a7e1f9d2',
        tenant_id: '019524f5-9a3c-7d2e-b145-68c3a7e1f9d1',
        bank_account_id: '019524f5-9a3c-7d2e-b145-68c3a7e1f9d0',
        transaction_date: '2026-04-01T10:00:00Z',
        value_date: '2026-04-01T10:00:00Z',
        description: 'ATM Withdrawal',
        reference: 'ATM-7788',
        amount: '1000.00',
        currency_code: 'ETB',
        transaction_type: 'DEBIT',
        reconciliation_status: 'UNRECONCILED',
        reconciled_at: null,
        journal_entry_id: null,
      }

      const model = BankMapper.toTransaction(dto, accountId)

      expect(model.id).toBe(dto.id)
      expect(model.accountId).toBe(accountId)
      expect(model.amount.amount).toBe(1000)
      expect(model.amount.currency).toBe(Currency.ETB)
      expect(model.date).toBe('2026-04-01')
      expect(model.reference).toBe('ATM-7788')
      expect(model.type).toBe('DEBIT')
    })

    it('should handle null reference by providing an empty string', () => {
      const accountId = toId<BankAccountId>('acc-123')
      const dto: Partial<BankTransactionDTO> = {
        id: '019524f5-9a3c-7d2e-b145-68c3a7e1f9d2',
        transaction_date: '2026-04-01T10:00:00Z',
        description: 'Simple Transfer',
        reference: null,
        amount: '500.00',
        currency_code: 'ETB',
        transaction_type: 'CREDIT',
      }

      const model = BankMapper.toTransaction(dto as BankTransactionDTO, accountId)
      expect(model.reference).toBe('')
    })
  })
})
