import type { IsoDate } from '../types/brand.types'
export type { IsoDate }

/**
 * BusinessDate — A Presentation-only utility for localized date formatting and parsing.
 */

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

  static format(date: IsoDate, locale: string = 'en-US'): string {
    // We explicitly allow new Date() here ONLY for formatting via Intl API.
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date))
  }
}
