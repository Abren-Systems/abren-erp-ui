import { describe, it, expect } from 'vitest'
import { ReportingMapper } from '../mappers'
import type { DailyCashflowDTO } from '../api.types'
import { Currency } from '../../../../shared/domain/money'

describe('ReportingMapper', () => {
  it('should map DailyCashflowDTO to DailyCashflowEntry', () => {
    const dto: DailyCashflowDTO = {
      date: '2026-04-01',
      total_inflow: 1000,
      total_outflow: 500,
      projected_inflow: 200,
      projected_outflow: 100,
      net_cashflow: 600,
      currency_code: 'ETB',
    }

    const entry = ReportingMapper.toDailyCashflowEntry(dto)

    expect(entry.date).toEqual('2026-04-01')
    expect(entry.actualInflow.amount).toBe(1000)
    expect(entry.actualInflow.currency).toBe(Currency.ETB)
    expect(entry.actualOutflow.amount).toBe(500)
    expect(entry.projectedInflow.amount).toBe(200)
    expect(entry.projectedOutflow.amount).toBe(100)
    expect(entry.netCashflow.amount).toBe(600)
  })

  it('should fallback to USD if currency_code is invalid', () => {
    const dto: DailyCashflowDTO = {
      date: '2026-04-01',
      total_inflow: 1000,
      total_outflow: 500,
      projected_inflow: 200,
      projected_outflow: 100,
      net_cashflow: 600,
      currency_code: 'INVALID' as unknown as Currency,
    }

    const entry = ReportingMapper.toDailyCashflowEntry(dto)

    expect(entry.actualInflow.currency).toBe(Currency.USD)
  })
})
