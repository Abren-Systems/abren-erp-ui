import { apiGet } from '@/shared/api/http-client'

export interface DailyCashflowDTO {
  date: string
  total_inflow: number
  total_outflow: number
  projected_inflow: number
  projected_outflow: number
  net_cashflow: number
  currency_code: string
}

export interface CashflowQuery {
  startDate: string
  endDate: string
}

/**
 * Reporting API Adapter
 */
export const reportingAdapter = {
  /**
   * Fetches daily cashflow data for a given date range
   */
  async getDailyCashflow(query: CashflowQuery): Promise<DailyCashflowDTO[]> {
    const params = new URLSearchParams({
      start_date: query.startDate,
      end_date: query.endDate,
    })
    return apiGet<DailyCashflowDTO[]>(`/reporting/daily-cashflow?${params.toString()}`)
  },
}
