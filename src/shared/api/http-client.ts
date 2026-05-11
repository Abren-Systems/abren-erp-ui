import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'

/**
 * Abren ERP — Shared HTTP Client
 *
 * Responsibilities:
 * - Unwrap the backend's { success, data, meta } envelope
 * - Attach Authorization header from auth store
 * - Attach Idempotency-Key for mutating requests
 * - Attach X-Tenant-ID header for multi-tenancy
 * - Centralized error handling
 */

// ── Types ─────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean
  data: T
  operations?: unknown // Will be strongly typed by consumers using OperationalEntity
  meta?: Record<string, unknown>
}

export interface ApiFieldError {
  code: string
  field: string
  message: string
}

export class ApiError extends Error {
  success: false
  code: string
  details?: ApiFieldError[] | undefined

  constructor(message: string, code: string = 'UNKNOWN_ERROR', details?: ApiFieldError[]) {
    super(message)
    this.name = 'ApiError'
    this.success = false
    this.code = code
    this.details = details
  }
}

/**
 * ConflictError — Thrown when an OCC version mismatch (HTTP 409) is detected.
 * The controller should catch this and display a degraded UX banner.
 */
export class ConflictError extends ApiError {
  constructor(
    message: string = 'This record was modified by another user. Please refresh and try again.',
  ) {
    super(message, 'VERSION_CONFLICT')
    this.name = 'ConflictError'
  }
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

const USER_KEY = 'abren_current_user'
const TENANT_KEY = 'abren_current_tenant'

function clearStoredAuth() {
  sessionStorage.removeItem(USER_KEY)
  sessionStorage.removeItem(TENANT_KEY)
}

// ── Client Instance ───────────────────────────────────
const httpClient = axios.create({
  baseURL: '/api/v1',
  timeout: 30_000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Abren-Response-Profile': 'operational', // Opt into the Platform Workflow Runtime capability sidecar
  },
})

// ── Request Interceptor: Auth + Tenant + Idempotency ──
httpClient.interceptors.request.use((config) => {
  // ── Multi-Tenancy ──
  const storedTenant = sessionStorage.getItem(TENANT_KEY)
  if (storedTenant) {
    try {
      const tenant = JSON.parse(storedTenant)
      if (tenant?.id) {
        config.headers['X-Tenant-ID'] = tenant.id
      }
    } catch {
      // Ignore parse errors, let backend handle missing tenant
    }
  }

  // ── Idempotency ──
  // Idempotency key for mutating requests
  const method = config.method?.toUpperCase()
  if (method && ['POST', 'PUT', 'PATCH'].includes(method)) {
    config.headers['Idempotency-Key'] = crypto.randomUUID()
  }

  return config
})

// ── Response Interceptor: Envelope Unwrap ─────────────
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      const { status, data } = error.response

      if (status === 401) {
        clearStoredAuth()
        if (window.location.pathname !== '/login') {
          window.location.assign('/login')
        }
      }

      // OCC: Version conflict (HTTP 409/412)
      if (status === 409 || status === 412) {
        return Promise.reject(new ConflictError(data?.error?.message))
      }

      // Structured error envelope from backend (The Error Contract)
      if (data?.error) {
        return Promise.reject(new ApiError(data.error.message, data.error.code, data.error.details))
      }

      // Fallback for raw FastAPI errors missing the envelope
      if (data?.detail) {
        const message = typeof data.detail === 'string' ? data.detail : 'Validation failed'
        return Promise.reject(new ApiError(message, 'UNKNOWN_ERROR'))
      }
    }

    return Promise.reject(error)
  },
)

/**
 * Performs an authenticated GET request and unwraps the { success, data } envelope.
 *
 * @template T - The expected type of the 'data' property in the response.
 * @param {string} url - The endpoint URL (relative to /api/v1).
 * @param {AxiosRequestConfig} [config] - Optional Axios configuration.
 * @returns {Promise<T>} - The unwrapped 'data' payload.
 */
export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await httpClient.get<ApiResponse<T>>(url, config)
  // If operations exist, we return the whole enveloped entity (OperationalEntity<T> equivalent), otherwise just data
  if (response.data.operations) {
    return { data: response.data.data, operations: response.data.operations } as unknown as T
  }
  return response.data.data
}

/**
 * Performs an authenticated POST request and unwraps the { success, data } envelope.
 *
 * @template T - The expected type of the 'data' property in the response.
 * @param {string} url - The endpoint URL (relative to /api/v1).
 * @param {unknown} [body] - The data to send in the request body.
 * @param {AxiosRequestConfig} [config] - Optional Axios configuration.
 * @returns {Promise<T>} - The unwrapped 'data' payload.
 */
export async function apiPost<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig & { version?: number },
): Promise<T> {
  const { version, ...axiosConfig } = config ?? {}
  if (version != null) {
    axiosConfig.headers = Object.assign({}, axiosConfig.headers, {
      'If-Match': `"v${version}"`,
    })
  }
  const response = await httpClient.post<ApiResponse<T>>(url, body, axiosConfig)
  if (response.data.operations) {
    return { data: response.data.data, operations: response.data.operations } as unknown as T
  }
  return response.data.data
}

/**
 * Performs an authenticated PUT request and unwraps the { success, data } envelope.
 *
 * @template T - The expected type of the 'data' property in the response.
 * @param {string} url - The endpoint URL (relative to /api/v1).
 * @param {unknown} [body] - The data to send in the request body.
 * @param {AxiosRequestConfig} [config] - Optional Axios configuration.
 * @returns {Promise<T>} - The unwrapped 'data' payload.
 */
export async function apiPut<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig & { version?: number },
): Promise<T> {
  const { version, ...axiosConfig } = config ?? {}
  if (version != null) {
    axiosConfig.headers = Object.assign({}, axiosConfig.headers, {
      'If-Match': `"v${version}"`,
    })
  }
  const response = await httpClient.put<ApiResponse<T>>(url, body, axiosConfig)
  if (response.data.operations) {
    return { data: response.data.data, operations: response.data.operations } as unknown as T
  }
  return response.data.data
}

/**
 * Performs an authenticated PATCH request and unwraps the { success, data } envelope.
 *
 * @template T - The expected type of the 'data' property in the response.
 * @param {string} url - The endpoint URL (relative to /api/v1).
 * @param {unknown} [body] - The data to send in the request body.
 * @param {AxiosRequestConfig} [config] - Optional Axios configuration.
 * @returns {Promise<T>} - The unwrapped 'data' payload.
 */
export async function apiPatch<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig & { version?: number },
): Promise<T> {
  const { version, ...axiosConfig } = config ?? {}
  if (version != null) {
    axiosConfig.headers = Object.assign({}, axiosConfig.headers, {
      'If-Match': `"v${version}"`,
    })
  }
  const response = await httpClient.patch<ApiResponse<T>>(url, body, axiosConfig)
  if (response.data.operations) {
    return { data: response.data.data, operations: response.data.operations } as unknown as T
  }
  return response.data.data
}

/**
 * Performs an authenticated DELETE request and unwraps the { success, data } envelope.
 *
 * @template T - The expected type of the 'data' property in the response.
 * @param {string} url - The endpoint URL (relative to /api/v1).
 * @param {AxiosRequestConfig} [config] - Optional Axios configuration.
 * @returns {Promise<T>} - The unwrapped 'data' payload.
 */
export async function apiDelete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await httpClient.delete<ApiResponse<T>>(url, config)
  if (response.data.operations) {
    return { data: response.data.data, operations: response.data.operations } as unknown as T
  }
  return response.data.data
}

export { httpClient }
