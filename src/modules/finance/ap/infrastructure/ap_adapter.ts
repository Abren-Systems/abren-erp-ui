import { apiGet, apiPost } from '@/shared/api/http-client'
import { PaymentRequestSchema, PaymentRequestStatsSchema, VendorBillSchema } from './api.schemas'
import type {
  PaymentRequestCreateDTO,
  PaymentRequestPayDTO,
  PaymentRequestRejectDTO,
  VendorBillCreateDTO,
} from './api.types'
import { APMapper } from './mappers'
import type { PaymentRequest, PaymentRequestStats, VendorBill } from '../domain/ap.types'
import { Money } from '@/shared/domain/money'

const REQUESTS_BASE = '/finance/ap/payment-requests'
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
  async listRequests(): Promise<PaymentRequest[]> {
    const raw = (await apiGet<unknown[]>(REQUESTS_BASE)) as unknown[]
    return raw.map((item) => APMapper.toPaymentRequest(PaymentRequestSchema.parse(item)))
  },

  /**
   * Fetches a single Payment Request by ID.
   */
  async getRequest(id: string): Promise<PaymentRequest> {
    const raw = await apiGet<unknown>(`${REQUESTS_BASE}/${id}`)
    return APMapper.toPaymentRequest(PaymentRequestSchema.parse(raw))
  },

  /**
   * Fetches Payment Request statistics.
   */
  async getStats(): Promise<PaymentRequestStats> {
    const raw = (await apiGet<unknown>(`${REQUESTS_BASE}/stats`)) as unknown
    const parsed = PaymentRequestStatsSchema.parse(raw)
    return {
      tenantId: parsed.tenant_id,
      totalCount: parsed.total_count,
      draftCount: parsed.draft_count,
      submittedCount: parsed.submitted_count,
      approvedCount: parsed.approved_count,
      rejectedCount: parsed.rejected_count,
      paidCount: parsed.paid_count,
      totalAmount: Money.from(Number(parsed.total_amount), 'ETB'),
    } as PaymentRequestStats
  },

  /**
   * Creates a new Payment Request.
   */
  async createRequest(dto: PaymentRequestCreateDTO): Promise<PaymentRequest> {
    const raw = await apiPost<unknown>(REQUESTS_BASE, dto)
    return APMapper.toPaymentRequest(PaymentRequestSchema.parse(raw))
  },

  /**
   * Submits a draft Payment Request for approval.
   */
  async submitRequest(id: string): Promise<PaymentRequest> {
    const raw = await apiPost<unknown>(`${REQUESTS_BASE}/${id}/submit`)
    return APMapper.toPaymentRequest(PaymentRequestSchema.parse(raw))
  },

  /**
   * Approves a submitted Payment Request.
   */
  async approveRequest(id: string): Promise<PaymentRequest> {
    const raw = await apiPost<unknown>(`${REQUESTS_BASE}/${id}/approve`)
    return APMapper.toPaymentRequest(PaymentRequestSchema.parse(raw))
  },

  /**
   * Rejects a submitted Payment Request with a reason.
   */
  async rejectRequest(id: string, dto: PaymentRequestRejectDTO): Promise<PaymentRequest> {
    const raw = await apiPost<unknown>(`${REQUESTS_BASE}/${id}/reject`, dto)
    return APMapper.toPaymentRequest(PaymentRequestSchema.parse(raw))
  },

  /**
   * Records a payment for an approved Payment Request.
   */
  async payRequest(id: string, dto: PaymentRequestPayDTO): Promise<PaymentRequest> {
    const raw = await apiPost<unknown>(`${REQUESTS_BASE}/${id}/pay`, dto)
    return APMapper.toPaymentRequest(PaymentRequestSchema.parse(raw))
  },

  /**
   * Fetches the list of all Vendor Bills.
   */
  async listBills(): Promise<VendorBill[]> {
    const raw = (await apiGet<unknown[]>(BILLS_BASE)) as unknown[]
    return raw.map((item) => APMapper.toVendorBill(VendorBillSchema.parse(item)))
  },

  /**
   * Fetches a single Vendor Bill by ID.
   */
  async getBill(id: string): Promise<VendorBill> {
    const raw = await apiGet<unknown>(`${BILLS_BASE}/${id}`)
    return APMapper.toVendorBill(VendorBillSchema.parse(raw))
  },

  /**
   * Validates a Vendor Bill.
   */
  async validateBill(id: string): Promise<VendorBill> {
    const raw = await apiPost<unknown>(`${BILLS_BASE}/${id}/validate`)
    return APMapper.toVendorBill(VendorBillSchema.parse(raw))
  },

  /**
   * Rejects a Vendor Bill with a reason.
   */
  async rejectBill(id: string, reason: string): Promise<VendorBill> {
    const raw = await apiPost<unknown>(`${BILLS_BASE}/${id}/reject`, {
      reason,
    })
    return APMapper.toVendorBill(VendorBillSchema.parse(raw))
  },

  /**
   * Creates a new Vendor Bill.
   */
  async createBill(dto: VendorBillCreateDTO): Promise<VendorBill> {
    const raw = await apiPost<unknown>(BILLS_BASE, dto)
    return APMapper.toVendorBill(VendorBillSchema.parse(raw))
  },
}
