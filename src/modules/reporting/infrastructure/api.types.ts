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
