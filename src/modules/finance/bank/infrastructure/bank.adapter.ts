import type { BankAccountId } from '@/shared/types/brand.types'
import type { ScheduledPayment } from '../models/bank.types'
import type {
  BankAccountDTO,
  BankTransactionDTO,
  ScheduledPaymentDTO,
  CreateScheduledPaymentRequest,
} from './api.types'
import type { ListQuery, ListResponse } from '@/shared/domain/pagination'
import type {
  Operational,
  WorkflowOperations,
} from '@/platform/workflow-runtime/models/workflows.types'
import { apiGetEnvelope, apiPostEnvelope } from '@/shared/api/http-client'
import {
  BankAccountListSchema,
  BankTransactionListSchema,
  ScheduledPaymentListSchema,
  OperationalScheduledPaymentSchema,
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
    const raw = await apiGetEnvelope<unknown>('/finance/bank/accounts', { params: query })
    const parsed = BankAccountListSchema.parse(raw.data)
    return {
      items: parsed.items,
      totalCount: parsed.total_count,
    }
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
    const raw = await apiGetEnvelope<unknown>(`/finance/bank/accounts/${accountId}/transactions`, {
      params: query,
    })
    const parsed = BankTransactionListSchema.parse(raw.data)
    return {
      items: parsed.items,
      totalCount: parsed.total_count,
    }
  },

  /**
   * Fetches all scheduled payments for the current tenant (Paginated).
   */
  async getScheduledPayments(
    query?: ListQuery,
  ): Promise<ListResponse<Operational<ScheduledPayment>>> {
    const raw = await apiGetEnvelope<unknown>('/finance/bank/scheduled-payments', { params: query })
    const parsed = ScheduledPaymentListSchema.parse(raw.data)

    return {
      items: parsed.items.map((item) => ({
        ...BankMapper.toScheduledPayment(item.data as ScheduledPaymentDTO),
        __operations: item.operations as unknown as WorkflowOperations,
      })),
      totalCount: parsed.total_count,
    }
  },

  /**
   * Creates a new scheduled payment.
   *
   * @param data - The scheduled payment request payload.
   * @returns The created and validated ScheduledPayment domain model.
   */
  async createScheduledPayment(
    data: CreateScheduledPaymentRequest,
  ): Promise<Operational<ScheduledPayment>> {
    const raw = await apiPostEnvelope<unknown>('/finance/bank/scheduled-payments', data)
    const parsed = OperationalScheduledPaymentSchema.parse(raw)
    return {
      ...BankMapper.toScheduledPayment(parsed.data as ScheduledPaymentDTO),
      __operations: parsed.operations as unknown as WorkflowOperations,
    }
  },

  /**
   * Releases a scheduled payment for processing.
   *
   * @param paymentId - The unique identifier of the payment.
   * @returns The updated and validated ScheduledPayment domain model.
   */
  async releaseScheduledPayment(paymentId: string): Promise<Operational<ScheduledPayment>> {
    const raw = await apiPostEnvelope<unknown>(
      `/finance/bank/scheduled-payments/${paymentId}/release`,
    )
    const parsed = OperationalScheduledPaymentSchema.parse(raw)
    return {
      ...BankMapper.toScheduledPayment(parsed.data as ScheduledPaymentDTO),
      __operations: parsed.operations as unknown as WorkflowOperations,
    }
  },
}
