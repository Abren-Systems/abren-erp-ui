/**
 * Money Value Object — Mirrors backend shared kernel
 *
 * Encapsulates monetary amounts with currency safety.
 * Prevents mixing currencies in arithmetic operations.
 */
import { Currency } from './currency';
export class Money {
    amount;
    currency;
    constructor(amount, currency) {
        this.amount = amount;
        this.currency = currency;
    }
    static from(amount, currency) {
        const curr = typeof currency === 'string' ? currency : currency;
        return new Money(amount, curr);
    }
    static zero(currency = Currency.ETB) {
        return new Money(0, currency);
    }
    format(locale = 'en-ET') {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: this.currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(this.amount);
    }
    add(other) {
        this.assertSameCurrency(other);
        return new Money(this.amount + other.amount, this.currency);
    }
    subtract(other) {
        this.assertSameCurrency(other);
        return new Money(this.amount - other.amount, this.currency);
    }
    isZero() {
        return this.amount === 0;
    }
    isPositive() {
        return this.amount > 0;
    }
    isNegative() {
        return this.amount < 0;
    }
    equals(other) {
        return this.amount === other.amount && this.currency === other.currency;
    }
    assertSameCurrency(other) {
        if (this.currency !== other.currency) {
            throw new Error(`Cannot perform arithmetic on different currencies: ${this.currency} vs ${other.currency}`);
        }
    }
}
