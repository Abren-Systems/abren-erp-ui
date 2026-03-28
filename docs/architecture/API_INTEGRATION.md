# API Integration Architecture

> **Parent:** [Frontend Architecture](ARCHITECTURE.md)
> **Backend Contract:** [API Strategy](../../../abren-api/docs/architecture/API_STRATEGY.md)

---

## 1. Architecture Overview

    ↓  HTTP (JSON Response)

┌─────────────────────────────────────────────────────┐
│ Core HTTP Client (core/api/) │ ← Response Envelope Unwrap
├─────────────────────────────────────────────────────┤
│ Adapter (infrastructure/{m}.adapter.ts) │ ← Fetches **DTOs** from API
├─────────────────────────────────────────────────────┤
│ Mapper (infrastructure/{m}.mapper.ts) │ ← Converts **DTO** → **Domain Type**
├─────────────────────────────────────────────────────┤
│ Application (application/composables/use\*.ts) │ ← Orchestrates via **TanStack Query**
└─────────────────────────────────────────────────────┘
↓
Vue components (SFC)

---

## 2. Shared HTTP Client

All modules share a single Axios instance configured with interceptors for authentication, idempotency, error handling, and tenant context.

### 2.1 Base Configuration

```typescript
// core/api/http-client.ts
import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/core/auth/auth.store'
import { generateIdempotencyKey } from '@/core/composables/useIdempotencyKey'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const httpClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Request Interceptors ─────────────────────────────────

// 1. Auth: Attach Bearer token
httpClient.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }
  return config
})

// 2. Idempotency: Attach key for mutating requests
httpClient.interceptors.request.use((config) => {
  const mutatingMethods = ['post', 'put', 'patch']
  if (mutatingMethods.includes(config.method?.toLowerCase() ?? '')) {
    config.headers['Idempotency-Key'] = generateIdempotencyKey()
  }
  return config
})

// ── Response Headers & Unwrapping ────────────────────────

/**
 * Note: Our ResponseEnveloperMiddleware (Backend) wraps all JSON in:
 * { "success": true, "data": T }
 *
 * The apiGet/apiPost helpers are responsible for unwrapping this
 * and returning only the 'data' property to the caller.
 */

export { httpClient }
```

### 2.2 Error Types

```typescript
// core/api/types.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Backend response envelope types
export interface ApiResponse<T> {
  success: true
  data: T
  meta: Record<string, unknown> | null
}

export interface ApiErrorResponse {
  success: false
  detail: string
  code: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
}
```

---

## 3. Module API Clients

Each module has a typed API client that wraps the shared HTTP client with module-specific endpoint methods.

// modules/business/finance/ap/payment-requests/infrastructure/payment_request_adapter.ts
import { httpClient } from '@/core/api/http-client'
import type {
PaymentRequestRead,
PaymentRequestCreate,
PaymentRequestUpdate
} from '@/core/api/generated.types'

const BASE = '/payment-requests'

export const paymentRequestAdapter = {
// GET /api/v1/payment-requests
async list(): Promise<PaymentRequestRead[]> {
return httpClient.get(BASE)
},

// GET /api/v1/payment-requests/:id
async get(id: string): Promise<PaymentRequestRead> {
return httpClient.get(`${BASE}/${id}`)
},

// POST /api/v1/payment-requests
async create(dto: PaymentRequestCreateDTO): Promise<PaymentRequestDTO> {
return httpClient.post(BASE, dto)
},

// POST /api/v1/payment-requests/:id/submit
async submit(id: string): Promise<PaymentRequestDTO> {
return httpClient.post(`${BASE}/${id}/submit`)
},

// POST /api/v1/payment-requests/:id/approve
async approve(id: string): Promise<PaymentRequestDTO> {
return httpClient.post(`${BASE}/${id}/approve`)
},

// POST /api/v1/payment-requests/:id/reject
async reject(id: string, reason: string): Promise<PaymentRequestDTO> {
return httpClient.post(`${BASE}/${id}/reject`, { reason })
},

// POST /api/v1/payment-requests/:id/pay
async pay(id: string, dto: PaymentRequestPayDTO): Promise<PaymentRequestDTO> {
return httpClient.post(`${BASE}/${id}/pay`, dto)
},
}

````

### 3.2 Rules
- **One API client per module**. No shared "mega API" file.
- **Return raw DTOs**. Mappers are called by composables, not by the API client.
- **Use action-oriented method names** matching backend endpoint names (`submit`, `approve`, `reject`, `pay`).
- **No business logic** in API clients. They are pure I/O wrappers.

### 3.3 TanStack Query Wrappers

Instead of calling service clients directly from composables, use `useApiQuery` and `useApiMutation` wrappers:

```typescript
// core/composables/useApiQuery.ts
import { useQuery, type UseQueryOptions } from '@tanstack/vue-query'

export function useApiQuery<T>(
  key: string[],
  fetcher: () => Promise<T>,
  options?: Partial<UseQueryOptions<T>>,
) {
  return useQuery({
    queryKey: key,
    queryFn: fetcher,
    ...options,
  })
}

// core/composables/useApiMutation.ts
import { useMutation, useQueryClient } from '@tanstack/vue-query'

export function useApiMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: { invalidateKeys?: string[][] },
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,
    onSuccess: () => {
      options?.invalidateKeys?.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },
  })
}
````

**Usage in a module composable:**

```typescript
// modules/business/finance/ap/payment-requests/application/composables/usePaymentRequests.ts
import { useQuery } from '@tanstack/vue-query'
import { paymentRequestAdapter } from '../infrastructure/payment_request_adapter'
import { mapPaymentRequest } from '../infrastructure/payment_request.mapper'

export function usePaymentRequests() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['payment-requests'],
    queryFn: async () => {
      const dtos = await paymentRequestAdapter.list()
      return dtos.map(mapPaymentRequest)
    },
  })

  return { requests: data, isLoading, error }
}
```

---

### 4.1 Purpose [MANDATORY]

Mappers are the **firewall** and **primary domain factory** between backend DTOs and frontend ViewModels. In the Abren ERP, we follow the **Mapper-as-Factory** pattern:

1. **Isolation**: Backend field renames only propagate to the mapper file, not to components.
2. **Domain Logic**: UI-specific computed values (colors, labels, permissions) are derived during mapping.
3. **Data Integrity**: Mapping provides a final chance to enforce null-safety (e.g., providing defaults) before data enters the reactive state.

### 4.2 Anatomy of a Mapper

```typescript
// modules/payment-requests/types/api.types.ts (from OpenAPI codegen)
export interface PaymentRequestDTO {
  id: string
  beneficiary_name: string
  amount: number
  currency: string
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PAID'
  bank_account_id: string | null
  submitted_at: string | null
  paid_at: string | null
  current_approval_step: number
  assigned_approver_id: string | null
}

// modules/payment-requests/types/view.types.ts
export interface PaymentRequestViewModel {
  id: string
  beneficiary: string // renamed for UI clarity
  amount: Money // Value Object, not raw number
  status: PaymentRequestStatus
  statusLabel: string // "Draft", "Pending Approval", etc.
  statusColor: string // CSS class for badge color
  canSubmit: boolean // Derived permission
  canApprove: boolean // Derived permission
  canReject: boolean // Derived permission
  canPay: boolean // Derived permission
  submittedAt: string | null // Formatted date string
  paidAt: string | null // Formatted date string
}
```

### 4.3 Data Flow Summary

```
Backend JSON → PaymentRequestDTO (api.types.ts)
                    ↓ mapper
              PaymentRequestViewModel (view.types.ts)
                    ↓ store
              Pinia Store (reactive state)
                    ↓ storeToRefs
              Vue Component (render)
```

---

## 5. OpenAPI Type Generation

### 5.1 Setup

The backend's OpenAPI spec is the **single source of truth** for API types. Rather than manually writing `api.types.ts` files, we generate them:

```bash
# Install the generator
npm install -D openapi-typescript

# Add script to package.json
"scripts": {
  "generate-types": "openapi-typescript http://localhost:8000/api/v1/openapi.json -o src/core/api/generated.types.ts"
}
```

### 5.2 Workflow

```
1. Backend developer adds/changes a DTO
2. Backend starts locally (uvicorn)
3. Frontend runs: npm run generate-types
4. TypeScript compiler detects any breaking type changes
5. Only mapper files need updating — components remain untouched
```

### 5.3 Generated Type Usage

```typescript
// The generated file provides all backend schemas
import type { components } from '@/core/api/generated.types'

// Reference specific DTOs
type PaymentRequestDTO = components['schemas']['PaymentRequestDTO']
type PaymentRequestCreateDTO = components['schemas']['PaymentRequestCreateDTO']
type PaymentRequestPayDTO = components['schemas']['PaymentRequestPayDTO']
```

> **Note:** Generated types go into `core/api/generated.types.ts`. Module-level `api.types.ts` files re-export relevant types for encapsulation. This way, if you switch from OpenAPI codegen to manual types later, only the re-export file changes.

---

## 6. Error Handling Strategy

### 6.1 Error Flow

```
API Call → Axios Error → ApiError class → Composable catch → Store error state → Component display
```

### 6.2 Global vs Local Error Handling

| Error Type              | Handling                                   | Example                          |
| ----------------------- | ------------------------------------------ | -------------------------------- |
| `401 Unauthorized`      | **Global**: Auto-redirect to login         | Token expired                    |
| `403 Forbidden`         | **Global**: Show "access denied" toast     | Feature not enabled              |
| `429 Too Many Requests` | **Global**: Show rate limit warning        | Rapid API calls                  |
| `404 Not Found`         | **Local**: Module composable handles it    | Entity deleted                   |
| `422 Validation`        | **Local**: Show field-level errors on form | Invalid form data                |
| `409 Conflict`          | **Local**: Show conflict resolution UI     | Optimistic concurrency violation |
| `5xx Server Error`      | **Global**: Show generic error banner      | Backend down                     |

### 6.3 Global Error Interceptor

```typescript
// core/api/error-handler.ts
httpClient.interceptors.response.use(null, (error) => {
  if (error.response?.status === 401) {
    const authStore = useAuthStore()
    authStore.$reset()
    router.push({ name: 'login' })
  }

  if (error.response?.status === 429) {
    toast.warning('Rate limit reached. Please wait a moment.')
  }

  if (error.response?.status >= 500) {
    toast.error('Server error. Please try again later.')
  }

  return Promise.reject(error)
})
```
