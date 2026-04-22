import { apiGet, apiPost } from '@/shared/api/http-client'
import { CommonMapper } from '@/shared/infrastructure/mappers'
import type { BankAccountId } from '@/shared/types/brand.types'
import type {
  BankAccount,
  BankTransaction,
  ScheduledPayment,
} from '@/modules/finance/bank/domain/bank.types'
import type {
  BankAccountDTO,
  BankTransactionDTO,
  ScheduledPaymentDTO,
  CreateScheduledPaymentRequest,
} from './api.types'
import { BankAccountSchema, BankTransactionSchema, ScheduledPaymentSchema } from './api.schemas'
import { BankMapper } from './mappers'

/**
 * Bank API Adapter
 *
 * Handles standardized HTTP communication with the banking backend services.
 * All responses are shielded by Zod schemas to ensure runtime integrity.
 */
export const bankAdapter = {
  /**
   * Fetches all banking accounts for the current tenant.
   *
   * @returns List of validated and mapped BankAccounts.
   */
  async getBankAccounts(): Promise<BankAccount[]> {
    const raw = (await apiGet<unknown[]>('/finance/bank/accounts')) || []
    const dtos = raw.map((item) => BankAccountSchema.parse(item) as BankAccountDTO)
    return CommonMapper.mapCollection(dtos, (dto) => BankMapper.toBankAccount(dto))
  },

  /**
   * Fetches the transaction history for a specific bank account.
   *
   * @param accountId - The unique identifier of the bank account.
   * @returns List of validated and mapped BankTransactions.
   */
  async getTransactions(accountId: BankAccountId): Promise<BankTransaction[]> {
    const raw = (await apiGet<unknown[]>(`/finance/bank/accounts/${accountId}/transactions`)) || []
    const dtos = raw.map((item) => BankTransactionSchema.parse(item) as BankTransactionDTO)
    return dtos.map((dto) => BankMapper.toTransaction(dto, accountId))
  },

  /**
   * Fetches all scheduled payments for the current tenant.
   *
   * @returns List of validated and mapped ScheduledPayments.
   */
  async getScheduledPayments(): Promise<ScheduledPayment[]> {
    const raw = (await apiGet<unknown[]>('/finance/bank/scheduled-payments')) || []
    const dtos = raw.map((item) => ScheduledPaymentSchema.parse(item) as ScheduledPaymentDTO)
    return CommonMapper.mapCollection(dtos, (dto) => BankMapper.toScheduledPayment(dto))
  },

  /**
   * Creates a new scheduled payment.
   *
   * @param data - The scheduled payment request payload.
   * @returns The created and validated ScheduledPayment domain model.
   */
  async createScheduledPayment(data: CreateScheduledPaymentRequest): Promise<ScheduledPayment> {
    const raw = await apiPost<ScheduledPaymentDTO>('/finance/bank/scheduled-payments', data)
    const dto = ScheduledPaymentSchema.parse(raw) as ScheduledPaymentDTO
    return BankMapper.toScheduledPayment(dto)
  },

  /**
   * Releases a scheduled payment for processing.
   *
   * @param paymentId - The unique identifier of the payment.
   * @returns The updated and validated ScheduledPayment domain model.
   */
  async releaseScheduledPayment(paymentId: string): Promise<ScheduledPayment> {
    const raw = await apiPost<ScheduledPaymentDTO>(
      `/finance/bank/scheduled-payments/${paymentId}/release`,
    )
    const dto = ScheduledPaymentSchema.parse(raw) as ScheduledPaymentDTO
    return BankMapper.toScheduledPayment(dto)
  },
}
