import { describe, it, expect } from 'vitest'
import { CommonMapper } from '../mappers'
import { Money, Currency } from '../../domain/money'

describe('CommonMapper', () => {
  describe('toMoney', () => {
    it('should transform amount and currency into a Money object', () => {
      const money = CommonMapper.toMoney(100.5, 'USD')
      expect(money).toBeInstanceOf(Money)
      expect(money.amount).toBe(100.5)
      expect(money.currency).toBe(Currency.USD)
    })
  })

  describe('toDate', () => {
    it('should transform an ISO string into an IsoDate brand', () => {
      const date = CommonMapper.toDate('2026-04-03T12:00:00Z')
      expect(date).toBe('2026-04-03')
    })

    it('should return null for null/undefined input', () => {
      expect(CommonMapper.toDate(null)).toBeNull()
      expect(CommonMapper.toDate(undefined)).toBeNull()
    })
  })

  describe('toBrandedId', () => {
    it('should brand a string ID', () => {
      const id = CommonMapper.toBrandedId<{ readonly __brand: 'TestId' } & string>('test-123')
      expect(id).toBe('test-123')
    })
  })

  describe('mapCollection', () => {
    it('should map an array of DTOs using the provided mapper', () => {
      const dtos = [{ id: '1' }, { id: '2' }]
      const mapper = (dto: { id: string }) => dto.id
      const result = CommonMapper.mapCollection(dtos, mapper)
      expect(result).toEqual(['1', '2'])
    })
  })
})
