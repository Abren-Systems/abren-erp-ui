import type { BankAccountId } from '@/shared/types/brand.types'
import { Currency } from '@/shared/domain/currency'
import { Money } from '@/shared/domain/money'

/**
 * Bank Account Entity.
 * Represents a logical bank account within a tenant's financial context.
 */
export interface BankAccount {
  id: BankAccountId
  bankName: string
  bankCode: string | null
  accountNumber: string
  accountName: string
  currency: Currency
  balance: Money
  isDefault: boolean
  status: 'ACTIVE' | 'INACTIVE' | 'FROZEN'
}

/**
 * Bank Transaction Entity.
 * Represents a movement of funds within a bank account.
 */
export interface BankTransaction {
  id: string
  accountId: BankAccountId
  amount: Money
  date: string
  reference: string
  description: string
  type: 'DEBIT' | 'CREDIT'
}
