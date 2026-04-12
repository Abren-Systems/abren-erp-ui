import { apiGet } from '@/shared/api/http-client'
import type { DailyCashflowDTO, CashflowQuery } from './api.types'
import { DailyCashflowSchema } from './api.schemas'

/**
 * Reporting API Adapter.
 *
 * Provides typed HTTP methods for interacting with the Reporting endpoints.
 * All responses are shielded by Zod schemas to ensure runtime integrity.
 */
export const reportingAdapter = {
  /**
   * Fetches daily cashflow data for a given date range.
   *
   * @param query - The date range parameters.
   * @returns A promise resolving to an array of validated DailyCashflowDTOs.
   */
  async getDailyCashflow(query: CashflowQuery): Promise<DailyCashflowDTO[]> {
    const params = new URLSearchParams({
      start_date: query.startDate,
      end_date: query.endDate,
    })
    const raw = (await apiGet<DailyCashflowDTO[]>(
      `/reporting/daily-cashflow?${params.toString()}`,
    )) as unknown[]
    return raw.map((item) => DailyCashflowSchema.parse(item))
  },
}
