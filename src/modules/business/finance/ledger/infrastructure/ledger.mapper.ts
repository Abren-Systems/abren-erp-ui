import type { components } from '@/core/api/generated.types'
import type { Account } from '../domain/account.types'
import type { AccountId } from '@/core/types/brand.types'
import { toId } from '@/core/types/brand.types'
import { Currency } from '@/core/domain/currency'
import { Money } from '@/core/domain/money'

type AccountRead = components['schemas']['AccountRead']

/**
 * Transforms a raw API Account DTO into a Domain Type
 */
export function mapAccount(dto: AccountRead): Account {
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
