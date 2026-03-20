/**
 * Money Value Object — Mirrors backend shared kernel
 *
 * Encapsulates monetary amounts with currency safety.
 * Prevents mixing currencies in arithmetic operations.
 */

import { Currency } from './currency'

export class Money {
  private constructor(
    public readonly amount: number,
    public readonly currency: Currency,
  ) {}

  static from(amount: number, currency: Currency | string): Money {
    const curr = typeof currency === 'string' ? (currency as Currency) : currency
    return new Money(amount, curr)
  }

  static zero(currency: Currency = Currency.ETB): Money {
    return new Money(0, currency)
  }

  format(locale: string = 'en-ET'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: this.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(this.amount)
  }

  add(other: Money): Money {
    this.assertSameCurrency(other)
    return new Money(this.amount + other.amount, this.currency)
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other)
    return new Money(this.amount - other.amount, this.currency)
  }

  isZero(): boolean {
    return this.amount === 0
  }

  isPositive(): boolean {
    return this.amount > 0
  }

  isNegative(): boolean {
    return this.amount < 0
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error(
        `Cannot perform arithmetic on different currencies: ${this.currency} vs ${other.currency}`,
      )
    }
  }
}
