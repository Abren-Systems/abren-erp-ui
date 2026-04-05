import { apiGet, apiPost } from '@/shared/api/http-client'
import type {
  BankAccountDTO,
  BankTransactionDTO,
  ScheduledPaymentDTO,
  CreateScheduledPaymentRequest,
} from './api.types'
import { BankAccountSchema, BankTransactionSchema, ScheduledPaymentSchema } from './schemas'

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
   * @returns List of validated BankAccountDTOs.
   */
  async getBankAccounts(): Promise<BankAccountDTO[]> {
    const raw = (await apiGet<BankAccountDTO[]>('/finance/bank/accounts')) as unknown[]
    return raw.map((item) => BankAccountSchema.parse(item))
  },

  /**
   * Fetches the transaction history for a specific bank account.
   *
   * @param accountId - The unique identifier of the bank account.
   * @returns List of validated BankTransactionDTOs.
   */
  async getTransactions(accountId: string): Promise<BankTransactionDTO[]> {
    const raw = (await apiGet<BankTransactionDTO[]>(
      `/finance/bank/accounts/${accountId}/transactions`,
    )) as unknown[]
    return raw.map((item) => BankTransactionSchema.parse(item))
  },

  /**
   * Fetches all scheduled payments for the current tenant.
   *
   * @returns List of validated ScheduledPaymentDTOs.
   */
  async getScheduledPayments(): Promise<ScheduledPaymentDTO[]> {
    const raw = (await apiGet<ScheduledPaymentDTO[]>(
      '/finance/bank/scheduled-payments',
    )) as unknown[]
    return raw.map((item) => ScheduledPaymentSchema.parse(item))
  },

  /**
   * Creates a new scheduled payment.
   *
   * @param data - The scheduled payment request payload.
   * @returns The created and validated ScheduledPaymentDTO.
   */
  async createScheduledPayment(data: CreateScheduledPaymentRequest): Promise<ScheduledPaymentDTO> {
    const raw = await apiPost<ScheduledPaymentDTO>('/finance/bank/scheduled-payments', data)
    return ScheduledPaymentSchema.parse(raw)
  },

  /**
   * Releases a scheduled payment for processing.
   *
   * @param paymentId - The unique identifier of the payment.
   * @returns The updated and validated ScheduledPaymentDTO.
   */
  async releaseScheduledPayment(paymentId: string): Promise<ScheduledPaymentDTO> {
    const raw = await apiPost<ScheduledPaymentDTO>(
      `/finance/bank/scheduled-payments/${paymentId}/release`,
    )
    return ScheduledPaymentSchema.parse(raw)
  },
}
