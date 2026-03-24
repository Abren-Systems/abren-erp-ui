import { apiGet, apiPost } from '@/core/api/http-client'
import type { PaymentRequestDTO, PaymentRequestCreateDTO, PaymentRequestPayDTO } from './api.types'

const BASE = '/finance/ap/requests'

export const paymentsAdapter = {
  list: (): Promise<PaymentRequestDTO[]> => apiGet(BASE),

  get: (id: string): Promise<PaymentRequestDTO> => apiGet(`${BASE}/${id}`),

  create: (dto: PaymentRequestCreateDTO): Promise<PaymentRequestDTO> => apiPost(BASE, dto),

  submit: (id: string): Promise<PaymentRequestDTO> => apiPost(`${BASE}/${id}/submit`),

  pay: (id: string, dto: PaymentRequestPayDTO): Promise<PaymentRequestDTO> =>
    apiPost(`${BASE}/${id}/pay`, dto),
}
