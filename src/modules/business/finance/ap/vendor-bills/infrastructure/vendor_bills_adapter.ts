import { apiGet, apiPost } from '@/core/api/http-client'
import type { VendorBillDTO, VendorBillCreateDTO } from './api.types'

const BASE = '/finance/ap/vendor-bills'

export const vendorBillsAdapter = {
  list: (): Promise<VendorBillDTO[]> => apiGet(BASE),

  get: (id: string): Promise<VendorBillDTO> => apiGet(`${BASE}/${id}`),

  create: (dto: VendorBillCreateDTO): Promise<VendorBillDTO> => apiPost(BASE, dto),

  validate: (id: string): Promise<VendorBillDTO> => apiPost(`${BASE}/${id}/validate`),
}
