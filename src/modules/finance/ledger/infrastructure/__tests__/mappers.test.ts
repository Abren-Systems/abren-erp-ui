import { describe, it, expect } from 'vitest'
import { LedgerMapper } from '../mappers'
import { Currency } from '../../../../../shared/domain/money'
import type { components } from '../../../../../shared/api/generated.types'

type AccountDTO = components['schemas']['AccountDTO']
type JournalEntryDTO = components['schemas']['JournalEntryDTO']
type FiscalPeriodDTO = components['schemas']['FiscalPeriodDTO']

describe('LedgerMapper', () => {
  describe('toAccount', () => {
    it('should map AccountDTO to Account model', () => {
      const dto: AccountDTO = {
        id: 'acc-1',
        tenant_id: 'tenant-1',
        code: 1010,
        name: 'Cash in Bank',
        account_type: 'ASSET',
        parent_id: null,
        currency_code: null,
        is_active: true,
        requires_revaluation: false,
      }

      const model = LedgerMapper.toAccount(dto)

      expect(model.id).toBe('acc-1')
      expect(model.code).toBe('1010')
      expect(model.name).toBe('Cash in Bank')
      expect(model.type).toBe('ASSET')
      expect(model.currency).toBe(Currency.ETB)
      expect(model.isActive).toBe(true)
      expect(model.balance.amount).toBe(0)
    })
  })

  describe('toJournalEntry', () => {
    it('should map JournalEntryDTO to JournalEntry model', () => {
      const dto: JournalEntryDTO = {
        id: 'je-1',
        tenant_id: 'tenant-1',
        entry_number: 'JE-2026-001',
        status: 'POSTED',
        date: '2026-04-01',
        description: 'Monthly payroll',
        base_currency_code: 'ETB',
        lines: [
          {
            id: 'line-1',
            account_id: 'acc-1',
            party_id: null,
            party_type: null,
            document_id: null,
            amount: '1000.00',
            amount_in_base: '1000.00',
            original_amount: '1000.00',
            original_currency: 'ETB',
            base_amount: '1000.00',
            exchange_rate: '1.0',
            exchange_rate_source: null,
            exchange_rate_ref: null,
            exchange_rate_date: null,
            fx_gain_loss: null,
            intercompany_tenant_id: null,
            is_debit: true,
            currency_code: 'ETB',
            description: 'Salaries',
          },
          {
            id: 'line-2',
            account_id: 'acc-2',
            party_id: null,
            party_type: null,
            document_id: null,
            amount: '1000.00',
            amount_in_base: '1000.00',
            original_amount: '1000.00',
            original_currency: 'ETB',
            base_amount: '1000.00',
            exchange_rate: '1.0',
            exchange_rate_source: null,
            exchange_rate_ref: null,
            exchange_rate_date: null,
            fx_gain_loss: null,
            intercompany_tenant_id: null,
            is_debit: false,
            currency_code: 'ETB',
            description: 'Cash',
          },
        ],
        posted_by: null,
        posted_at: null,
        created_at: '2026-04-01T08:00:00Z',
      }

      const model = LedgerMapper.toJournalEntry(dto)

      expect(model.id).toBe('je-1')
      expect(model.entryNumber).toBe('JE-2026-001')
      expect(model.status).toBe('POSTED')
      expect(model.entryDate).toBe('2026-04-01')
      expect(model.lines).toHaveLength(2)
      expect(model.lines[0].debit.amount).toBe(1000)
      expect(model.lines[1].credit.amount).toBe(1000)
    })

    it('should handle missing lines with empty array', () => {
      const dto = {
        id: 'je-2',
        tenant_id: 'tenant-1',
        entry_number: 'JE-002',
        status: 'DRAFT',
        date: '2026-04-02',
        description: 'Empty entry',
        lines: [],
        base_currency_code: 'ETB',
        posted_by: null,
        posted_at: null,
        created_at: null,
      } as JournalEntryDTO

      const model = LedgerMapper.toJournalEntry(dto)
      expect(model.lines).toEqual([])
    })
  })

  describe('toFiscalPeriod', () => {
    it('should map FiscalPeriodRead to FiscalPeriod model', () => {
      const dto: FiscalPeriodDTO = {
        id: 'fp-1',
        tenant_id: 'tenant-1',
        name: 'April 2026',
        start_date: '2026-04-01',
        end_date: '2026-04-30',
        status: 'OPEN',
        created_at: '2026-03-31T20:00:00Z',
      }

      const model = LedgerMapper.toFiscalPeriod(dto)

      expect(model.id).toBe('fp-1')
      expect(model.name).toBe('April 2026')
      expect(model.status).toBe('OPEN')
      expect(model.startDate).toBe('2026-04-01')
      expect(model.endDate).toBe('2026-04-30')
    })
  })
})
