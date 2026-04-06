import { apiGet, apiPost } from '@/shared/api/http-client'
import { PaymentRequestSchema, PaymentRequestStatsSchema, VendorBillSchema } from './api.schemas'
import type {
  PaymentRequestDTO,
  PaymentRequestCreateDTO,
  PaymentRequestPayDTO,
  PaymentRequestRejectDTO,
  PaymentRequestStatsDTO,
  VendorBillDTO,
} from './api.types'

const REQUESTS_BASE = '/finance/ap/requests'
const BILLS_BASE = '/finance/ap/vendor-bills'

/**
 * Accounts Payable API Adapter — Gold Standard Implementation.
 *
 * Boundary Shielding: Every incoming response is parsed by a Zod schema
 * to ensure runtime integrity and fail-fast debugging.
 */
export const apAdapter = {
  /**
   * Fetches the list of all Payment Requests.
   */
  async listRequests(): Promise<PaymentRequestDTO[]> {
    const raw = (await apiGet<PaymentRequestDTO[]>(REQUESTS_BASE)) as unknown[]
    return raw.map((item) => PaymentRequestSchema.parse(item))
  },

  /**
   * Fetches a single Payment Request by ID.
   */
  async getRequest(id: string): Promise<PaymentRequestDTO> {
    const raw = await apiGet<PaymentRequestDTO>(`${REQUESTS_BASE}/${id}`)
    return PaymentRequestSchema.parse(raw)
  },

  /**
   * Fetches Payment Request statistics.
   */
  async getStats(): Promise<PaymentRequestStatsDTO> {
    const raw = await apiGet<PaymentRequestStatsDTO>(`${REQUESTS_BASE}/stats`)
    return PaymentRequestStatsSchema.parse(raw)
  },

  /**
   * Creates a new Payment Request.
   */
  async createRequest(dto: PaymentRequestCreateDTO): Promise<PaymentRequestDTO> {
    const raw = await apiPost<PaymentRequestDTO>(REQUESTS_BASE, dto)
    return PaymentRequestSchema.parse(raw)
  },

  /**
   * Submits a draft Payment Request for approval.
   */
  async submitRequest(id: string): Promise<PaymentRequestDTO> {
    const raw = await apiPost<PaymentRequestDTO>(`${REQUESTS_BASE}/${id}/submit`)
    return PaymentRequestSchema.parse(raw)
  },

  /**
   * Approves a submitted Payment Request.
   */
  async approveRequest(id: string): Promise<PaymentRequestDTO> {
    const raw = await apiPost<PaymentRequestDTO>(`${REQUESTS_BASE}/${id}/approve`)
    return PaymentRequestSchema.parse(raw)
  },

  /**
   * Rejects a submitted Payment Request with a reason.
   */
  async rejectRequest(id: string, dto: PaymentRequestRejectDTO): Promise<PaymentRequestDTO> {
    const raw = await apiPost<PaymentRequestDTO>(`${REQUESTS_BASE}/${id}/reject`, dto)
    return PaymentRequestSchema.parse(raw)
  },

  /**
   * Records a payment for an approved Payment Request.
   */
  async payRequest(id: string, dto: PaymentRequestPayDTO): Promise<PaymentRequestDTO> {
    const raw = await apiPost<PaymentRequestDTO>(`${REQUESTS_BASE}/${id}/pay`, dto)
    return PaymentRequestSchema.parse(raw)
  },

  /**
   * Fetches the list of all Vendor Bills.
   */
  async listBills(): Promise<VendorBillDTO[]> {
    const raw = (await apiGet<VendorBillDTO[]>(BILLS_BASE)) as unknown[]
    return raw.map((item) => VendorBillSchema.parse(item))
  },

  /**
   * Fetches a single Vendor Bill by ID.
   */
  async getBill(id: string): Promise<VendorBillDTO> {
    const raw = await apiGet<VendorBillDTO>(`${BILLS_BASE}/${id}`)
    return VendorBillSchema.parse(raw)
  },

  /**
   * Validates a Vendor Bill.
   */
  async validateBill(id: string): Promise<VendorBillDTO> {
    const raw = await apiPost<VendorBillDTO>(`${BILLS_BASE}/${id}/validate`)
    return VendorBillSchema.parse(raw)
  },

  /**
   * Rejects a Vendor Bill with a reason.
   */
  async rejectBill(id: string, reason: string): Promise<VendorBillDTO> {
    const raw = await apiPost<VendorBillDTO>(`${BILLS_BASE}/${id}/reject`, { reason })
    return VendorBillSchema.parse(raw)
  },

  /**
   * Creates a new Vendor Bill.
   */
  async createBill(dto: unknown): Promise<VendorBillDTO> {
    const raw = await apiPost<VendorBillDTO>(BILLS_BASE, dto)
    return VendorBillSchema.parse(raw)
  },
}
