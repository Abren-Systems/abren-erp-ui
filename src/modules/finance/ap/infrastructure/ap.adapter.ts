import { apiGet, apiGetEnvelope, apiPostEnvelope } from '@/shared/api/http-client'
import { PaymentRequestStatsSchema } from './api.schemas'
import type {
  CreatePaymentRequestDTO,
  RejectPaymentRequestDTO,
  CreateVendorBillDTO,
  PaymentRequestDTO,
  VendorBillDTO,
} from './api.types'
import type { ListQuery, ListResponse } from '@/shared/domain/pagination'
import type {
  OperationalEntity,
  LightweightOperationalEntity,
} from '@/platform/workflow-runtime/models/workflows.types'
import {
  mapOperational,
  mapLightweightOperationalList,
  type OperationalDTO,
  type LightweightOperationalListDTO,
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
  async listRequests(
    query?: ListQuery,
  ): Promise<ListResponse<LightweightOperationalEntity<PaymentRequest>>> {
    const raw = await apiGetEnvelope<LightweightOperationalListDTO<PaymentRequestDTO>>(
      REQUESTS_BASE,
      {
        params: query,
      },
    )
    return mapLightweightOperationalList(raw.data, (dto) => APMapper.toPaymentRequest(dto))
  },

  async getRequestsByUser(
    userId: UserId,
  ): Promise<ListResponse<LightweightOperationalEntity<PaymentRequest>>> {
    const raw = await apiGetEnvelope<LightweightOperationalListDTO<PaymentRequestDTO>>(
      `${REQUESTS_BASE}/user/${userId}`,
    )
    return mapLightweightOperationalList(raw.data, (dto) => APMapper.toPaymentRequest(dto))
  },

  /**
   * Fetches a single Payment Request by ID.
   */
  async getRequest(id: PaymentRequestId): Promise<OperationalEntity<PaymentRequest>> {
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
  async createRequest(dto: CreatePaymentRequestDTO): Promise<OperationalEntity<PaymentRequest>> {
    const raw = await apiPostEnvelope<OperationalDTO<PaymentRequestDTO>>(REQUESTS_BASE, dto)
    return mapOperational(raw.data, (parsed) => APMapper.toPaymentRequest(parsed))
  },

  /**
   * Submits a draft Payment Request for approval.
   */
  async submitRequest(
    id: PaymentRequestId,
    version: number,
  ): Promise<OperationalEntity<PaymentRequest>> {
    const raw = await apiPostEnvelope<OperationalDTO<PaymentRequestDTO>>(
      `${REQUESTS_BASE}/${id}/submit`,
      undefined,
      { version },
    )
    return mapOperational(raw.data, (parsed) => APMapper.toPaymentRequest(parsed))
  },

  /**
   * Approves a submitted Payment Request.
   */
  async approveRequest(
    id: PaymentRequestId,
    version: number,
  ): Promise<OperationalEntity<PaymentRequest>> {
    const raw = await apiPostEnvelope<OperationalDTO<PaymentRequestDTO>>(
      `${REQUESTS_BASE}/${id}/approve`,
      undefined,
      { version },
    )
    return mapOperational(raw.data, (parsed) => APMapper.toPaymentRequest(parsed))
  },

  /**
   * Rejects a submitted Payment Request with a reason.
   */
  async rejectRequest(
    id: PaymentRequestId,
    dto: RejectPaymentRequestDTO,
    version: number,
  ): Promise<OperationalEntity<PaymentRequest>> {
    const raw = await apiPostEnvelope<OperationalDTO<PaymentRequestDTO>>(
      `${REQUESTS_BASE}/${id}/reject`,
      dto,
      { version },
    )
    return mapOperational(raw.data, (parsed) => APMapper.toPaymentRequest(parsed))
  },

  /**
   * Authorizes an approved Payment Request.
   */
  async authorizeRequest(
    id: PaymentRequestId,
    version: number,
  ): Promise<OperationalEntity<PaymentRequest>> {
    const raw = await apiPostEnvelope<OperationalDTO<PaymentRequestDTO>>(
      `${REQUESTS_BASE}/${id}/authorize`,
      undefined,
      { version },
    )
    return mapOperational(raw.data, (parsed) => APMapper.toPaymentRequest(parsed))
  },

  /**
   * Cancels a Payment Request with a reason.
   */
  async cancelRequest(
    id: PaymentRequestId,
    reason: string,
    version: number,
  ): Promise<OperationalEntity<PaymentRequest>> {
    const raw = await apiPostEnvelope<OperationalDTO<PaymentRequestDTO>>(
      `${REQUESTS_BASE}/${id}/cancel`,
      { reason },
      { version },
    )
    return mapOperational(raw.data, (parsed) => APMapper.toPaymentRequest(parsed))
  },

  /**
   * Executes a generic workflow action on a Payment Request.
   */
  async executeRequestAction(
    id: string,
    action: string,
    version: number,
    payload?: Record<string, unknown>,
  ): Promise<OperationalEntity<PaymentRequest>> {
    const raw = await apiPostEnvelope<OperationalDTO<PaymentRequestDTO>>(
      `${REQUESTS_BASE}/${id}/${action}`,
      payload,
      { version },
    )
    return mapOperational(raw.data, (parsed) => APMapper.toPaymentRequest(parsed))
  },

  /**
   * Executes a generic workflow action on a Vendor Bill.
   */
  async executeBillAction(
    id: string,
    action: string,
    version: number,
    payload?: Record<string, unknown>,
  ): Promise<OperationalEntity<VendorBill>> {
    const raw = await apiPostEnvelope<OperationalDTO<VendorBillDTO>>(
      `${BILLS_BASE}/${id}/${action}`,
      payload,
      { version },
    )
    return mapOperational(raw.data, (parsed) => APMapper.toVendorBill(parsed))
  },

  /**
   * Fetches a paginated list of Vendor Bills.
   */
  async listBills(
    query?: ListQuery,
  ): Promise<ListResponse<LightweightOperationalEntity<VendorBill>>> {
    const raw = await apiGetEnvelope<LightweightOperationalListDTO<VendorBillDTO>>(BILLS_BASE, {
      params: query,
    })
    return mapLightweightOperationalList(raw.data, (dto) => APMapper.toVendorBill(dto))
  },

  /**
   * Fetches a single Vendor Bill by ID.
   */
  async getBill(id: VendorBillId): Promise<OperationalEntity<VendorBill>> {
    const raw = await apiGetEnvelope<OperationalDTO<VendorBillDTO>>(`${BILLS_BASE}/${id}`)
    return mapOperational(raw.data, (dto) => APMapper.toVendorBill(dto))
  },

  /**
   * Validates a Vendor Bill.
   */
  async validateBill(id: VendorBillId): Promise<OperationalEntity<VendorBill>> {
    const raw = await apiPostEnvelope<OperationalDTO<VendorBillDTO>>(`${BILLS_BASE}/${id}/validate`)
    return mapOperational(raw.data, (parsed) => APMapper.toVendorBill(parsed))
  },

  /**
   * Rejects a Vendor Bill with a reason.
   */
  async rejectBill(id: VendorBillId, reason: string): Promise<OperationalEntity<VendorBill>> {
    const raw = await apiPostEnvelope<OperationalDTO<VendorBillDTO>>(`${BILLS_BASE}/${id}/reject`, {
      reason,
    })
    return mapOperational(raw.data, (parsed) => APMapper.toVendorBill(parsed))
  },

  /**
   * Creates a new Vendor Bill.
   */
  async createBill(dto: CreateVendorBillDTO): Promise<OperationalEntity<VendorBill>> {
    const raw = await apiPostEnvelope<OperationalDTO<VendorBillDTO>>(BILLS_BASE, dto)
    return mapOperational(raw.data, (parsed) => APMapper.toVendorBill(parsed))
  },

  /**
   * Cancels a Vendor Bill with a reason.
   */
  async cancelBill(id: VendorBillId, reason: string): Promise<OperationalEntity<VendorBill>> {
    const raw = await apiPostEnvelope<OperationalDTO<VendorBillDTO>>(`${BILLS_BASE}/${id}/cancel`, {
      reason,
    })
    return mapOperational(raw.data, (parsed) => APMapper.toVendorBill(parsed))
  },
}
