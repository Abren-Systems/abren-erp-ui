import { type Currency } from '@/shared/domain/money'
import { CommonMapper } from '@/shared/infrastructure/mappers'
import type { BankAccountId, BankTransactionId } from '@/shared/types/brand.types'
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
      id: CommonMapper.toBrandedId<BankAccountId>(dto.id),
      bankName: dto.bank_name,
      bankCode: dto.bank_code ?? null,
      accountNumber: dto.account_number,
      accountName: dto.name,
      currency: dto.currency_code as Currency,
      balance: CommonMapper.toMoney(dto.current_balance, dto.currency_code),
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
      id: CommonMapper.toBrandedId<BankTransactionId>(dto.id),
      accountId,
      amount: CommonMapper.toMoney(dto.amount, dto.currency),
      date: CommonMapper.toDate(dto.date)!,
      reference: dto.reference,
      description: dto.description,
      type: dto.type as 'DEBIT' | 'CREDIT',
    }
  }
}
