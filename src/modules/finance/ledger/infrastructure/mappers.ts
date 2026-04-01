import type { components } from '@/shared/api/generated.types'
import type { Account } from '../domain/account.types'
import type { AccountId } from '@/shared/types/brand.types'
import { toId } from '@/shared/types/brand.types'
import { Currency } from '@/shared/domain/currency'
import { Money } from '@/shared/domain/money'

type AccountRead = components['schemas']['AccountRead']

/**
 * Ledger Mapper-as-Factory.
 *
 * Transforms raw API DTOs into Frontend Domain Models for the General Ledger.
 */
export class LedgerMapper {
  /**
   * Transforms a raw API Account DTO into a Domain Type.
   *
   * @param dto - The raw account data from the API.
   * @returns A clean Account domain model.
   */
  static toAccount(dto: AccountRead): Account {
    // Backend currently doesn't provide currency_code in AccountRead,
    // defaulting to functional currency (ETB) for now.
    const currency = Currency.ETB

    return {
      id: toId<AccountId>(dto.id),
      code: String(dto.code), // Convert numeric code to string for UI
      name: dto.name,
      type: dto.account_type.toLowerCase(),
      currency: currency,
      isActive: dto.is_active,
      balance: Money.zero(currency),
    }
  }
}
