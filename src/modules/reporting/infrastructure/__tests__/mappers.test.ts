import { describe, it, expect } from 'vitest'
import { ReportingMapper } from '../mappers'
import { Currency } from '../../../../shared/domain/money'

describe('ReportingMapper', () => {
  it('should map DailyCashflowDTO to DailyCashflowEntry', () => {
    const dto: Record<string, unknown> = {
      date: '2026-04-01',
      inflow: '1000.00',
      outflow: '500.00',
      net_change: '500.00',
      projected_inflow: '200.00',
      projected_outflow: '100.00',
      currency_code: 'ETB',
    }

    const entry = ReportingMapper.toDailyCashflowEntry(dto)

    expect(entry.date).toEqual('2026-04-01')
    expect(entry.actualInflow.amount).toBe(1000)
    expect(entry.actualInflow.currency).toBe(Currency.ETB)
    expect(entry.actualOutflow.amount).toBe(500)
    expect(entry.projectedInflow.amount).toBe(200)
    expect(entry.projectedOutflow.amount).toBe(100)
    expect(entry.netCashflow.amount).toBe(500)
  })

  it('should fallback to ETB if currency_code is missing', () => {
    const dto: Record<string, unknown> = {
      date: '2026-04-01',
      inflow: '1000.00',
    }

    const entry = ReportingMapper.toDailyCashflowEntry(dto)

    expect(entry.actualInflow.currency).toBe(Currency.ETB)
  })
})
