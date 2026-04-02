import { apiGet } from '@/shared/api/http-client'
import type { DailyCashflowDTO, CashflowQuery } from './api.types'

/**
 * Reporting API Adapter.
 *
 * Provides typed HTTP methods for interacting with the Reporting endpoints.
 */
export const reportingAdapter = {
  /**
   * Fetches daily cashflow data for a given date range.
   *
   * @param query - The date range parameters.
   * @returns A promise resolving to an array of raw DailyCashflowDTOs.
   */
  async getDailyCashflow(query: CashflowQuery): Promise<DailyCashflowDTO[]> {
    const params = new URLSearchParams({
      start_date: query.startDate,
      end_date: query.endDate,
    })
    return apiGet<DailyCashflowDTO[]>(`/reporting/daily-cashflow?${params.toString()}`)
  },
}
