import { apiGet } from '@/shared/api/http-client'
import type { BankAccountDTO, BankTransactionDTO } from './api.types'

/**
 * Bank API Adapter
 *
 * Handles standardized HTTP communication with the banking backend services.
 */
export const bankAdapter = {
  /**
   * Fetches all banking accounts for the current tenant.
   *
   * @returns List of raw BankAccountDTOs.
   */
  async getBankAccounts(): Promise<BankAccountDTO[]> {
    // Path matched in generated.types.ts: '/api/v1/finance/bank/accounts'
    return apiGet<BankAccountDTO[]>('/finance/bank/accounts')
  },

  /**
   * Fetches the transaction history for a specific bank account.
   *
   * @param accountId - The unique identifier of the bank account.
   * @returns List of raw BankTransactionDTOs.
   */
  async getTransactions(accountId: string): Promise<BankTransactionDTO[]> {
    // Current route in spec is list only, assuming standard REST pattern for nested resources.
    // This allows UI development to proceed with mocked data if the endpoint returns 404.
    return apiGet<BankTransactionDTO[]>(`/finance/bank/accounts/${accountId}/transactions`)
  },
}
