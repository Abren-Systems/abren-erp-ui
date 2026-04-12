import { type Currency } from '@/shared/domain/money'
import { CommonMapper } from '@/shared/infrastructure/mappers'
import type {
  BankAccountId,
  BankTransactionId,
  ScheduledPaymentId,
  UserId,
} from '@/shared/types/brand.types'
import type {
  BankAccount,
  BankTransaction,
  FinancialObligationCategory,
  ScheduledPayment,
} from '../domain/bank.types'
import type { BankAccountDTO, BankTransactionDTO, ScheduledPaymentDTO } from './api.types'

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
      amount: CommonMapper.toMoney(dto.amount, dto.currency_code),
      date: CommonMapper.toDate(dto.transaction_date)!,
      reference: dto.reference ?? '',
      description: dto.description,
      type: dto.transaction_type as 'DEBIT' | 'CREDIT',
    }
  }

  /**
   * Transforms a raw API Scheduled Payment DTO into a Domain Type.
   *
   * @param dto - The raw scheduled payment data from the API.
   * @returns A clean ScheduledPayment domain model.
   */
  static toScheduledPayment(dto: ScheduledPaymentDTO): ScheduledPayment {
    return {
      id: CommonMapper.toBrandedId<ScheduledPaymentId>(dto.id),
      bankAccountId: CommonMapper.toBrandedId<BankAccountId>(dto.bank_account_id),
      category: dto.category as FinancialObligationCategory,
      amount: CommonMapper.toMoney(dto.amount, dto.currency_code),
      dueDate: CommonMapper.toDate(dto.due_date)!,
      description: dto.description,
      status: dto.status as ScheduledPayment['status'], // Explicit cast to handle DTO status
      sourceModule: dto.source_module ?? null,
      sourceId: dto.source_id ?? null,
      createdBy: CommonMapper.toBrandedId<UserId>(dto.tenant_id), // Simplified for now
    }
  }
}
