import type { Brand } from '../types/brand.types'

/**
 * IsoDate — A branded string representing a valid ISO-8601 date (YYYY-MM-DD).
 * Prevents accidental usage of raw strings or Date objects in domain logic.
 */
export type IsoDate = Brand<string, 'IsoDate'>

export class BusinessDate {
  /**
   * Safely cast an ISO string to an IsoDate brand.
   * In a real app, this would include regex validation.
   */
  static fromIso(isoString: string): IsoDate {
    // Truncate to YYYY-MM-DD if a full timestamp is provided.
    return isoString.split('T')[0] as IsoDate
  }

  static today(): IsoDate {
    return new Date().toISOString().split('T')[0] as IsoDate
  }

  /**
   * Format for display (e.g., MMM d, yyyy)
   */
  static format(date: IsoDate, locale: string = 'en-US'): string {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date))
  }

  static isAfter(a: IsoDate, b: IsoDate): boolean {
    return new Date(a) > new Date(b)
  }
}
