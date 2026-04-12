import { describe, it, expect } from 'vitest'
import { TaxMapper } from '../mappers'
import type { TaxRuleDTO, TaxCalculationResponse } from '../api.types'

describe('TaxMapper', () => {
  describe('toTaxRule', () => {
    it('should map TaxRuleDTO to TaxRule model', () => {
      const dto: TaxRuleDTO = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Standard VAT',
        rate: '0.15', // backend returns Decimal sometimes serialized as string
        tax_type: 'VAT',
        gl_account_id: '987e6543-e21b-12d3-a456-426614174000',
        is_active: true,
      }

      const result = TaxMapper.toTaxRule(dto)

      expect(result.id).toBe('123e4567-e89b-12d3-a456-426614174000')
      expect(result.name).toBe('Standard VAT')
      expect(result.rate).toBe(0.15)
      expect(result.taxType).toBe('VAT')
      expect(result.glAccountId).toBe('987e6543-e21b-12d3-a456-426614174000')
      expect(result.isActive).toBe(true)
    })
  })

  describe('toCalculationResult', () => {
    it('should map TaxCalculationResponse to TaxCalculationResult', () => {
      const dto: TaxCalculationResponse = {
        net: '100.00',
        tax: '15.00',
        gross: '115.00',
        currency: 'ETB',
      }

      const result = TaxMapper.toCalculationResult(dto)

      expect(result.net.amount).toBe(100)
      expect(result.net.currency).toBe('ETB')

      expect(result.tax.amount).toBe(15)
      expect(result.gross.amount).toBe(115)
    })
  })
})
