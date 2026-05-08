import type { components } from '@/shared/api/generated.types'

export type BankAccountDTO = components['schemas']['BankAccountSchema']
export type BankTransactionDTO = components['schemas']['BankTransactionSchema']
export type ScheduledPaymentDTO = components['schemas']['ScheduledPaymentSchema']
export type CreateScheduledPaymentRequest = components['schemas']['CreateScheduledPaymentRequest']
