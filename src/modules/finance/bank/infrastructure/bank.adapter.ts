import type { BankAccountId, ScheduledPaymentId } from '@/shared/types/brand.types'
import type { BankAccount, BankTransaction, ScheduledPayment } from '../models/bank.types'
import type {
  BankAccountDTO,
  BankTransactionDTO,
  ScheduledPaymentDTO,
  CreateScheduledPaymentRequest,
} from './api.types'
import type { ListQuery, ListResponse } from '@/shared/domain/pagination'
import type { OperationalEntity } from '@/platform/workflow-runtime/models/workflows.types'
import { apiGetEnvelope, apiPostEnvelope } from '@/shared/api/http-client'
import {
  mapOperational,
  mapOperationalList,
  type OperationalDTO,
  type OperationalListDTO,
} from '@/platform/workflow-runtime/utils/operational'
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
  async getBankAccounts(query?: ListQuery): Promise<ListResponse<OperationalEntity<BankAccount>>> {
    const raw = await apiGetEnvelope<OperationalListDTO<BankAccountDTO>>('/finance/bank/accounts', {
      params: query,
    })
    return mapOperationalList(raw.data, (dto: BankAccountDTO) => BankMapper.toBankAccount(dto))
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
  ): Promise<ListResponse<OperationalEntity<BankTransaction>>> {
    const raw = await apiGetEnvelope<OperationalListDTO<BankTransactionDTO>>(
      `/finance/bank/accounts/${accountId}/transactions`,
      {
        params: query,
      },
    )
    return mapOperationalList(raw.data, (dto: BankTransactionDTO) =>
      BankMapper.toTransaction(dto, accountId),
    )
  },

  /**
   * Fetches all scheduled payments for the current tenant (Paginated).
   */
  async getScheduledPayments(
    query?: ListQuery,
  ): Promise<ListResponse<OperationalEntity<ScheduledPayment>>> {
    const raw = await apiGetEnvelope<OperationalListDTO<ScheduledPaymentDTO>>(
      '/finance/bank/scheduled-payments',
      { params: query },
    )
    return mapOperationalList(raw.data, (dto) => BankMapper.toScheduledPayment(dto))
  },

  /**
   * Creates a new scheduled payment.
   *
   * @param data - The scheduled payment request payload.
   * @returns The created and validated ScheduledPayment domain model.
   */
  async createScheduledPayment(
    data: CreateScheduledPaymentRequest,
  ): Promise<OperationalEntity<ScheduledPayment>> {
    const raw = await apiPostEnvelope<OperationalDTO<ScheduledPaymentDTO>>(
      '/finance/bank/scheduled-payments',
      data,
    )
    return mapOperational(raw.data, (dto) => BankMapper.toScheduledPayment(dto))
  },

  /**
   * Releases a scheduled payment for processing.
   *
   * @param paymentId - The unique identifier of the payment.
   * @returns The updated and validated ScheduledPayment domain model.
   */
  async releaseScheduledPayment(
    paymentId: ScheduledPaymentId,
  ): Promise<OperationalEntity<ScheduledPayment>> {
    const raw = await apiPostEnvelope<OperationalDTO<ScheduledPaymentDTO>>(
      `/finance/bank/scheduled-payments/${paymentId}/release`,
    )
    return mapOperational(raw.data, (dto) => BankMapper.toScheduledPayment(dto))
  },
}
