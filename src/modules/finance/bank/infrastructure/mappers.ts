import { Money } from '@/shared/domain/money'
import { Currency } from '@/shared/domain/currency'
import type { BankAccountId } from '@/shared/types/brand.types'
import { toId } from '@/shared/types/brand.types'
import type { BankAccount, BankTransaction } from '../domain/bank.types'
import type { BankAccountDTO, BankTransactionDTO } from './api.types'

/**
 * Bank Mapper-as-Factory.
 *
 * Transforms raw API DTOs into Frontend Domain Models for Banking.
 */
export class BankMapper {
  /**
   * Transforms a raw API Bank Account DTO into a Domain Type.
   *
   * @param dto - The raw bank account data from the API.
   * @returns A clean BankAccount domain model.
   */
  static toBankAccount(dto: BankAccountDTO): BankAccount {
    return {
      id: toId<BankAccountId>(dto.id),
      bankName: dto.bank_name,
      bankCode: dto.bank_code ?? null,
      accountNumber: dto.account_number,
      accountName: dto.name,
      currency: dto.currency_code as Currency,
      balance: Money.from(dto.current_balance, dto.currency_code),
      isDefault: dto.is_default,
      status: dto.is_active ? 'ACTIVE' : 'INACTIVE',
    }
  }

  /**
   * Transforms a raw API Bank Transaction DTO into a Domain Type.
   *
   * @param dto - The raw transaction data from the API.
   * @param accountId - The ID of the bank account this transaction belongs to.
   * @returns A clean BankTransaction domain model.
   */
  static toTransaction(dto: BankTransactionDTO, accountId: BankAccountId): BankTransaction {
    return {
      id: dto.id,
      accountId,
      amount: Money.from(dto.amount, dto.currency),
      date: dto.date,
      reference: dto.reference,
      description: dto.description,
      type: dto.type as 'DEBIT' | 'CREDIT',
    }
  }
}
