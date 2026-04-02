import type { components } from '@/shared/api/generated.types'

export type BankAccountDTO = components['schemas']['BankAccountDTO']
export type BankTransactionDTO = {
  id: string
  amount: number
  currency: string
  date: string
  reference: string
  description: string
  type: 'DEBIT' | 'CREDIT'
}
