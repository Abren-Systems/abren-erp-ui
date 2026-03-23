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
  meta?: Record<string, unknown>
}

export interface ApiError {
  success: false
  detail: string
  code: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

// ── Client Instance ───────────────────────────────────
const httpClient = axios.create({
  baseURL: '/api/v1',
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Refresh State ─────────────────────────────────────
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: any) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else if (token) {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// ── Request Interceptor: Auth + Tenant + Idempotency ──
httpClient.interceptors.request.use((config) => {
  // Auth token (will be set by auth store)
  const token = localStorage.getItem('abren_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // Tenant ID
  const tenantId = localStorage.getItem('abren_tenant_id')
  if (tenantId) {
    config.headers['X-Tenant-ID'] = tenantId
  }

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
    const originalRequest = error.config

    if (error.response) {
      const { status, data } = error.response

      // 401: Token expired or invalid
      if (status === 401 && originalRequest && !originalRequest._retry) {
        // Prevent infinite loops if the refresh itself fails
        if (originalRequest.url?.includes('/auth/refresh')) {
          localStorage.removeItem('abren_token')
          window.location.href = '/login'
          return Promise.reject(error)
        }

        if (isRefreshing) {
          return new Promise(function (resolve, reject) {
            failedQueue.push({ resolve, reject })
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`
              return httpClient(originalRequest)
            })
            .catch((err) => {
              return Promise.reject(err)
            })
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
          // Attempt purely httpOnly refresh endpoints or standard endpoint
          // (assuming the API reads a refresh token from cookies, or if not, adjust here)
          const response = await axios.post('/api/v1/auth/refresh', {}, { withCredentials: true })
          const newToken = response.data.data?.access_token
          
          if (newToken) {
            localStorage.setItem('abren_token', newToken)
            httpClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            
            processQueue(null, newToken)
            return httpClient(originalRequest)
          } else {
            throw new Error('No token returned from refresh')
          }
        } catch (refreshError) {
          processQueue(refreshError, null)
          localStorage.removeItem('abren_token')
          window.location.href = '/login'
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      }

      // Structured error from backend
      if (data?.detail) {
        return Promise.reject(new Error(data.detail))
      }
    }

    return Promise.reject(error)
  },
)

// ── Typed Request Helpers ─────────────────────────────
export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await httpClient.get<ApiResponse<T>>(url, config)
  return response.data.data
}

export async function apiPost<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await httpClient.post<ApiResponse<T>>(url, body, config)
  return response.data.data
}

export async function apiPut<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await httpClient.put<ApiResponse<T>>(url, body, config)
  return response.data.data
}

export async function apiPatch<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await httpClient.patch<ApiResponse<T>>(url, body, config)
  return response.data.data
}

export async function apiDelete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await httpClient.delete<ApiResponse<T>>(url, config)
  return response.data.data
}

export { httpClient }
