import { Money, type Currency } from '@/shared/domain/money'
import { BusinessDate, type IsoDate } from '@/shared/domain/business-date'
import { toId, type Brand } from '@/shared/types/brand.types'

/**
 * Shared Mapping Utilities.
 *
 * Provides common transformations for DTO-to-Domain mapping.
 */
export const CommonMapper = {
  /** Transforms a raw amount and currency into a Money value object. */
  toMoney: (amount: number | string, currency: string | Currency): Money => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    return Money.from(numAmount, currency)
  },

  /** Safely transforms an ISO date string into an IsoDate brand. */
  toDate: (isoString: string | null | undefined): IsoDate | null => {
    return isoString ? BusinessDate.fromIso(isoString) : null
  },

  /** Maps a raw ID to a branded ID type. */
  toBrandedId: <T extends Brand<string, string>>(id: string | null | undefined): T => {
    return id ? (toId<T>(id) as T) : (null as unknown as T)
  },

  /** Helper to map a collection of DTOs using a mapper function. */
  mapCollection: <TDTO, TDomain>(dtos: TDTO[], mapper: (dto: TDTO) => TDomain): TDomain[] => {
    return dtos.map(mapper)
  },
}
