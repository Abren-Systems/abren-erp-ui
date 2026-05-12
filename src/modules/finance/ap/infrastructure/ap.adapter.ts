import { apiGet, apiPost } from '@/shared/api/http-client'
import { PaymentRequestSchema, PaymentRequestStatsSchema, VendorBillSchema } from './api.schemas'
import type {
  CreatePaymentRequestDTO,
  RejectPaymentRequestDTO,
  CreateVendorBillDTO,
  PaymentRequestDTO,
  VendorBillDTO,
} from './api.types'
import type { ListQuery, ListResponse } from '@/shared/domain/pagination'
import type { Operational } from '@/platform/workflow-runtime/models/workflows.types'
import { apiGetEnvelope } from '@/shared/api/http-client'
import {
  mapOperational,
  mapOperationalList,
  type OperationalDTO,
  type OperationalListDTO,
} from '@/platform/workflow-runtime/utils/operational'
import { APMapper } from './mappers'
import { Money } from '@/shared/domain/money'
import type { PaymentRequest, PaymentRequestStats, VendorBill } from '../models/ap.types'
import type { PaymentRequestId, VendorBillId, UserId } from '@/shared/types/brand.types'

const REQUESTS_BASE = '/finance/ap/payment-requests'
const BILLS_BASE = '/finance/ap/vendor-bills'

/**
 * Accounts Payable API Adapter
 *
 * All incoming responses are parsed by Zod schemas to ensure runtime integrity and fail-fast debugging.
 */
export const apAdapter = {
  /**
   * Fetches a paginated list of Payment Requests.
   */
  async listRequests(query?: ListQuery): Promise<ListResponse<Operational<PaymentRequest>>> {
    const raw = await apiGetEnvelope<OperationalListDTO<PaymentRequestDTO>>(REQUESTS_BASE, {
      params: query,
    })
    return mapOperationalList(raw.data, (dto) => APMapper.toPaymentRequest(dto))
  },

  async getRequestsByUser(userId: UserId): Promise<ListResponse<Operational<PaymentRequest>>> {
    const raw = await apiGetEnvelope<OperationalListDTO<PaymentRequestDTO>>(
      `${REQUESTS_BASE}/user/${userId}`,
    )
    return mapOperationalList(raw.data, (dto) => APMapper.toPaymentRequest(dto))
  },

  /**
   * Fetches a single Payment Request by ID.
   */
  async getRequest(id: PaymentRequestId): Promise<Operational<PaymentRequest>> {
    const raw = await apiGetEnvelope<OperationalDTO<PaymentRequestDTO>>(`${REQUESTS_BASE}/${id}`)
    return mapOperational(raw.data, (dto) => APMapper.toPaymentRequest(dto))
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
      authorizedCount: parsed.authorized_count,
      cancelledCount: parsed.cancelled_count ?? 0,
      totalAmount: Money.from(Number(parsed.total_amount), 'ETB'),
    } as PaymentRequestStats
  },

  /**
   * Creates a new Payment Request.
   */
  async createRequest(dto: CreatePaymentRequestDTO): Promise<PaymentRequest> {
    const raw = await apiPost<unknown>(REQUESTS_BASE, dto)
    return APMapper.toPaymentRequest(PaymentRequestSchema.parse(raw))
  },

  /**
   * Submits a draft Payment Request for approval.
   */
  async submitRequest(id: PaymentRequestId, version: number): Promise<PaymentRequest> {
    const raw = await apiPost<unknown>(`${REQUESTS_BASE}/${id}/submit`, undefined, { version })
    return APMapper.toPaymentRequest(PaymentRequestSchema.parse(raw))
  },

  /**
   * Approves a submitted Payment Request.
   */
  async approveRequest(id: PaymentRequestId, version: number): Promise<PaymentRequest> {
    const raw = await apiPost<unknown>(`${REQUESTS_BASE}/${id}/approve`, undefined, { version })
    return APMapper.toPaymentRequest(PaymentRequestSchema.parse(raw))
  },

  /**
   * Rejects a submitted Payment Request with a reason.
   */
  async rejectRequest(
    id: PaymentRequestId,
    dto: RejectPaymentRequestDTO,
    version: number,
  ): Promise<PaymentRequest> {
    const raw = await apiPost<unknown>(`${REQUESTS_BASE}/${id}/reject`, dto, { version })
    return APMapper.toPaymentRequest(PaymentRequestSchema.parse(raw))
  },

  /**
   * Authorizes an approved Payment Request.
   */
  async authorizeRequest(id: PaymentRequestId, version: number): Promise<PaymentRequest> {
    const raw = await apiPost<unknown>(`${REQUESTS_BASE}/${id}/authorize`, undefined, { version })
    return APMapper.toPaymentRequest(PaymentRequestSchema.parse(raw))
  },

  /**
   * Cancels a Payment Request with a reason.
   */
  async cancelRequest(
    id: PaymentRequestId,
    reason: string,
    version: number,
  ): Promise<PaymentRequest> {
    const raw = await apiPost<unknown>(`${REQUESTS_BASE}/${id}/cancel`, { reason }, { version })
    return APMapper.toPaymentRequest(PaymentRequestSchema.parse(raw))
  },

  /**
   * Fetches a paginated list of Vendor Bills.
   */
  async listBills(query?: ListQuery): Promise<ListResponse<Operational<VendorBill>>> {
    const raw = await apiGetEnvelope<OperationalListDTO<VendorBillDTO>>(BILLS_BASE, {
      params: query,
    })
    return mapOperationalList(raw.data, (dto) => APMapper.toVendorBill(dto))
  },

  /**
   * Fetches a single Vendor Bill by ID.
   */
  async getBill(id: VendorBillId): Promise<Operational<VendorBill>> {
    const raw = await apiGetEnvelope<OperationalDTO<VendorBillDTO>>(`${BILLS_BASE}/${id}`)
    return mapOperational(raw.data, (dto) => APMapper.toVendorBill(dto))
  },

  /**
   * Validates a Vendor Bill.
   */
  async validateBill(id: VendorBillId): Promise<VendorBill> {
    const raw = await apiPost<unknown>(`${BILLS_BASE}/${id}/validate`)
    return APMapper.toVendorBill(VendorBillSchema.parse(raw))
  },

  /**
   * Rejects a Vendor Bill with a reason.
   */
  async rejectBill(id: VendorBillId, reason: string): Promise<VendorBill> {
    const raw = await apiPost<unknown>(`${BILLS_BASE}/${id}/reject`, {
      reason,
    })
    return APMapper.toVendorBill(VendorBillSchema.parse(raw))
  },

  /**
   * Creates a new Vendor Bill.
   */
  async createBill(dto: CreateVendorBillDTO): Promise<VendorBill> {
    const raw = await apiPost<unknown>(BILLS_BASE, dto)
    return APMapper.toVendorBill(VendorBillSchema.parse(raw))
  },

  /**
   * Cancels a Vendor Bill with a reason.
   */
  async cancelBill(id: VendorBillId, reason: string): Promise<VendorBill> {
    const raw = await apiPost<unknown>(`${BILLS_BASE}/${id}/cancel`, { reason })
    return APMapper.toVendorBill(VendorBillSchema.parse(raw))
  },
}
