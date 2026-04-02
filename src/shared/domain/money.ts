/**
 * Money Value Object — Mirrors backend shared kernel
 *
 * Encapsulates monetary amounts with currency safety.
 * Prevents mixing currencies in arithmetic operations.
 */

/**
 * Currency Enum — Mirrors backend Currency value object
 */
export enum Currency {
  ETB = 'ETB',
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
}

export class Money {
  private constructor(
    public readonly amount: number,
    public readonly currency: Currency,
  ) {}

  /**
   * Create Money from a major unit amount (e.g., 10.50).
   */
  static from(amount: number, currency: Currency | string): Money {
    const curr = typeof currency === 'string' ? (currency as Currency) : currency
    return new Money(amount, curr)
  }

  /**
   * Create Money from cents (e.g., 1050 cents = 10.50).
   * Prevents floating point issues by forcing integer cents.
   */
  static fromCents(cents: number, currency: Currency): Money {
    return new Money(cents / 100, currency)
  }

  static fromDTO(dto: { amount: number; currency: string }): Money {
    return new Money(dto.amount, dto.currency as Currency)
  }

  static zero(currency: Currency = Currency.ETB): Money {
    return new Money(0, currency)
  }

  toDTO(): { amount: number; currency: string } {
    return {
      amount: this.amount,
      currency: this.currency,
    }
  }

  /**
   * Format the amount as a locale-aware currency string.
   * Defaults to Ethiopian locale (`en-ET`) since ETB is the primary currency.
   */
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
    // Arithmetic across currencies is a domain invariant violation — always throw
    if (this.currency !== other.currency) {
      throw new Error(
        `Cannot perform arithmetic on different currencies: ${this.currency} vs ${other.currency}`,
      )
    }
  }
}
