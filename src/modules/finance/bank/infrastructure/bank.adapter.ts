import { apiGet, apiPost } from '@/shared/api/http-client'
import type { BankAccountId } from '@/shared/types/brand.types'
import type { ScheduledPayment } from '../models/bank.types'
import type {
  BankAccountDTO,
  BankTransactionDTO,
  ScheduledPaymentDTO,
  CreateScheduledPaymentRequest,
} from './api.types'
import type { ListQuery, ListResponse } from '@/shared/domain/pagination'
import {
  BankAccountListSchema,
  BankTransactionListSchema,
  ScheduledPaymentListSchema,
  ScheduledPaymentSchema,
} from './api.schemas'
import { BankMapper } from './mappers'

/**
 * Bank API Adapter
 *
 * Handles standardized HTTP communication with the banking backend services.
 * All responses are shielded by Zod schemas to ensure runtime integrity.
 */
export const bankAdapter = {
  /**
   * Fetches all banking accounts for the current tenant (Paginated).
   */
  async getBankAccounts(query?: ListQuery): Promise<ListResponse<BankAccountDTO>> {
    const raw = await apiGet<unknown>('/finance/bank/accounts', { params: query })
    return BankAccountListSchema.parse(raw) as unknown as ListResponse<BankAccountDTO>
  },

  /**
   * Fetches the transaction history for a specific bank account (Paginated).
   *
   * @param accountId - The unique identifier of the bank account.
   * @param query - Pagination parameters.
   */
  async getTransactions(
    accountId: BankAccountId,
    query?: ListQuery,
  ): Promise<ListResponse<BankTransactionDTO>> {
    const raw = await apiGet<unknown>(`/finance/bank/accounts/${accountId}/transactions`, {
      params: query,
    })
    return BankTransactionListSchema.parse(raw) as unknown as ListResponse<BankTransactionDTO>
  },

  /**
   * Fetches all scheduled payments for the current tenant (Paginated).
   */
  async getScheduledPayments(query?: ListQuery): Promise<ListResponse<ScheduledPaymentDTO>> {
    const raw = await apiGet<unknown>('/finance/bank/scheduled-payments', { params: query })
    return ScheduledPaymentListSchema.parse(raw) as unknown as ListResponse<ScheduledPaymentDTO>
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
