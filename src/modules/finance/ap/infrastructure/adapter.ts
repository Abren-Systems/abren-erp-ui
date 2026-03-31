import { apiGet, apiPost } from '@/shared/api/http-client'
import type {
  PaymentRequestDTO,
  PaymentRequestCreateDTO,
  PaymentRequestPayDTO,
  PaymentRequestRejectDTO,
  VendorBillDTO,
  VendorBillCreateDTO,
} from './api.types'

const REQUESTS_BASE = '/finance/ap/requests'
const BILLS_BASE = '/finance/ap/vendor-bills'

export const apAdapter = {
  // --- Payment Requests ---
  listRequests: (): Promise<PaymentRequestDTO[]> => apiGet(REQUESTS_BASE),

  getRequest: (id: string): Promise<PaymentRequestDTO> => apiGet(`${REQUESTS_BASE}/${id}`),

  createRequest: (dto: PaymentRequestCreateDTO): Promise<PaymentRequestDTO> =>
    apiPost(REQUESTS_BASE, dto),

  submitRequest: (id: string): Promise<PaymentRequestDTO> =>
    apiPost(`${REQUESTS_BASE}/${id}/submit`),

  approveRequest: (id: string): Promise<PaymentRequestDTO> =>
    apiPost(`${REQUESTS_BASE}/${id}/approve`),

  rejectRequest: (id: string, dto: PaymentRequestRejectDTO): Promise<PaymentRequestDTO> =>
    apiPost(`${REQUESTS_BASE}/${id}/reject`, dto),

  payRequest: (id: string, dto: PaymentRequestPayDTO): Promise<PaymentRequestDTO> =>
    apiPost(`${REQUESTS_BASE}/${id}/pay`, dto),

  // --- Vendor Bills ---
  listBills: (): Promise<VendorBillDTO[]> => apiGet(BILLS_BASE),

  getBill: (id: string): Promise<VendorBillDTO> => apiGet(`${BILLS_BASE}/${id}`),

  createBill: (dto: VendorBillCreateDTO): Promise<VendorBillDTO> => apiPost(BILLS_BASE, dto),

  validateBill: (id: string): Promise<VendorBillDTO> => apiPost(`${BILLS_BASE}/${id}/validate`),
}
