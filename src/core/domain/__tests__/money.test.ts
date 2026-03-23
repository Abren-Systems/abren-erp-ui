import { describe, it, expect } from 'vitest'
import { Money } from '../money'
import { Currency } from '../currency'

describe('Money Value Object', () => {
  it('should create a Money instance', () => {
    const money = Money.from(100, Currency.ETB)
    expect(money.amount).toBe(100)
    expect(money.currency).toBe(Currency.ETB)
  })

  it('should create zero money', () => {
    const zero = Money.zero(Currency.USD)
    expect(zero.amount).toBe(0)
    expect(zero.isZero()).toBe(true)
  })

  it('should add same-currency amounts', () => {
    const a = Money.from(100, Currency.ETB)
    const b = Money.from(50, Currency.ETB)
    const result = a.add(b)
    expect(result.amount).toBe(150)
    expect(result.currency).toBe(Currency.ETB)
  })

  it('should subtract same-currency amounts', () => {
    const a = Money.from(100, Currency.ETB)
    const b = Money.from(30, Currency.ETB)
    const result = a.subtract(b)
    expect(result.amount).toBe(70)
  })

  it('should throw when adding different currencies', () => {
    const etb = Money.from(100, Currency.ETB)
    const usd = Money.from(50, Currency.USD)
    expect(() => etb.add(usd)).toThrow('Cannot perform arithmetic on different currencies')
  })

  it('should format currency correctly', () => {
    const money = Money.from(1234.56, Currency.USD)
    const formatted = money.format('en-US')
    expect(formatted).toContain('1,234.56')
  })

  it('should test positivity and negativity', () => {
    expect(Money.from(100, Currency.ETB).isPositive()).toBe(true)
    expect(Money.from(-50, Currency.ETB).isNegative()).toBe(true)
    expect(Money.from(0, Currency.ETB).isZero()).toBe(true)
  })

  it('should test equality', () => {
    const a = Money.from(100, Currency.ETB)
    const b = Money.from(100, Currency.ETB)
    const c = Money.from(100, Currency.USD)
    expect(a.equals(b)).toBe(true)
    expect(a.equals(c)).toBe(false)
  })
})
