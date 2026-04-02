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

/**
 * Accounts Payable API Adapter.
 *
 * Provides typed HTTP methods for interacting with Payment Requests and Vendor Bills.
 */
export const apAdapter = {
  /**
   * Fetches the list of all Payment Requests.
   *
   * @returns A promise resolving to an array of PaymentRequestDTOs.
   */
  async listRequests(): Promise<PaymentRequestDTO[]> {
    return apiGet(REQUESTS_BASE)
  },

  /**
   * Fetches a single Payment Request by ID.
   *
   * @param id - The unique identifier of the payment request.
   * @returns A promise resolving to the PaymentRequestDTO.
   */
  async getRequest(id: string): Promise<PaymentRequestDTO> {
    return apiGet(`${REQUESTS_BASE}/${id}`)
  },

  /**
   * Creates a new Payment Request.
   *
   * @param dto - The raw payment request creation data.
   * @returns A promise resolving to the created PaymentRequestDTO.
   */
  async createRequest(dto: PaymentRequestCreateDTO): Promise<PaymentRequestDTO> {
    return apiPost(REQUESTS_BASE, dto)
  },

  /**
   * Submits a draft Payment Request for approval.
   *
   * @param id - The unique identifier of the payment request.
   * @returns A promise resolving to the updated PaymentRequestDTO.
   */
  async submitRequest(id: string): Promise<PaymentRequestDTO> {
    return apiPost(`${REQUESTS_BASE}/${id}/submit`)
  },

  /**
   * Approves a submitted Payment Request.
   *
   * @param id - The unique identifier of the payment request.
   * @returns A promise resolving to the updated PaymentRequestDTO.
   */
  async approveRequest(id: string): Promise<PaymentRequestDTO> {
    return apiPost(`${REQUESTS_BASE}/${id}/approve`)
  },

  /**
   * Rejects a submitted Payment Request with a reason.
   *
   * @param id - The unique identifier of the payment request.
   * @param dto - The rejection data containing the reason.
   * @returns A promise resolving to the updated PaymentRequestDTO.
   */
  async rejectRequest(id: string, dto: PaymentRequestRejectDTO): Promise<PaymentRequestDTO> {
    return apiPost(`${REQUESTS_BASE}/${id}/reject`, dto)
  },

  /**
   * Records a payment for an approved Payment Request.
   *
   * @param id - The unique identifier of the payment request.
   * @param dto - The payment details (method, reference).
   * @returns A promise resolving to the updated PaymentRequestDTO.
   */
  async payRequest(id: string, dto: PaymentRequestPayDTO): Promise<PaymentRequestDTO> {
    return apiPost(`${REQUESTS_BASE}/${id}/pay`, dto)
  },

  /**
   * Fetches the list of all Vendor Bills.
   *
   * @returns A promise resolving to an array of VendorBillDTOs.
   */
  async listBills(): Promise<VendorBillDTO[]> {
    return apiGet(BILLS_BASE)
  },

  /**
   * Fetches a single Vendor Bill by ID.
   *
   * @param id - The unique identifier of the vendor bill.
   * @returns A promise resolving to the VendorBillDTO.
   */
  async getBill(id: string): Promise<VendorBillDTO> {
    return apiGet(`${BILLS_BASE}/${id}`)
  },

  /**
   * Creates a new Vendor Bill.
   *
   * @param dto - The raw vendor bill creation data.
   * @returns A promise resolving to the created VendorBillDTO.
   */
  async createBill(dto: VendorBillCreateDTO): Promise<VendorBillDTO> {
    return apiPost(BILLS_BASE, dto)
  },

  /**
   * Validates and posts a Vendor Bill to the ledger.
   *
   * @param id - The unique identifier of the vendor bill.
   * @returns A promise resolving to the updated VendorBillDTO.
   */
  async validateBill(id: string): Promise<VendorBillDTO> {
    return apiPost(`${BILLS_BASE}/${id}/validate`)
  },
}
