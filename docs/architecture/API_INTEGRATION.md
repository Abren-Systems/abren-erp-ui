---
title: "API Integration Architecture"
description: "┌─────────────────────────────────────────────────────┐"
tier: frontend
tags: [frontend, architecture]
---

# API Integration Architecture

> **Parent:** [Frontend Architecture](ARCHITECTURE.md)
> **Backend Contract:** [API Strategy](../../../abren-api/docs/architecture/API_STRATEGY.md)

---

## 1. Architecture Overview

    ↓  HTTP (JSON Response)

┌─────────────────────────────────────────────────────┐
│ Core HTTP Client (shared/api/) │ ← Response Envelope Unwrap
├─────────────────────────────────────────────────────┤
│ Adapter (infrastructure/{m}\_adapter.ts) │ ← Fetches & **Parses (Zod)**
├─────────────────────────────────────────────────────┤
│ Schemas (infrastructure/schemas.ts) │ ← Fail-Fast Boundary
├─────────────────────────────────────────────────────┤
│ Mapper (infrastructure/mappers.ts) │ ← Converts **DTO** ↔ **Domain**
├─────────────────────────────────────────────────────┤
│ Application (application/composables/use\*.ts) │ ← Orchestrates via **TanStack Query**
└─────────────────────────────────────────────────────┘
↓
Vue components (SFC)

---

## 2. Shared HTTP Client

All modules share a single Axios instance configured with interceptors for authentication, idempotency, error handling, and tenant context.

### 2.1 Base Configuration

````typescript
// shared/api/http-client.ts
import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/shared/auth/auth.store'

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
    config.headers['Idempotency-Key'] = crypto.randomUUID()
  }
  return config
})

### 2.2 Response Envelope Handling [MANDATORY]

The backend provides a unified response envelope. The Core HTTP Client is responsible for unwrapping these envelopes before they reach the module Adapters.

**Success Envelope:**
```json
{
  "success": true,
  "data": { ... }, // The actual payload (DTO)
  "meta": { "total": 100, "page": 1 } // Pagination or secondary context
}
````

**Error Envelope:**

```json
{
  "success": false,
  "detail": "Descriptive error message",
  "code": "ERROR_CODE_STRING" // Symmetric with backend DomainError
}
```

### 2.3 Response Types & Unwrapping Logic

```typescript
// shared/api/types.ts

/**
 * Standard Success Envelope
 * T is the DTO shape (e.g., PaymentRequestDTO)
 */
export interface ApiResponse<T> {
  success: true
  data: T
  meta: Record<string, unknown> | null
}

/**
 * Standard Error Envelope
 * Symmetric with the backend's ErrorDetail schema.
 */
export interface ApiErrorResponse {
  success: false
  detail: string
  code: string
}

/**
 * The apiGet/apiPost helpers unwrap the data field automatically.
 */
export async function apiGet<T>(url: string): Promise<T> {
  const response = await httpClient.get<ApiResponse<T>>(url)
  return response.data.data
}
```

---

## 3. Module API Adapters

Each module has a typed **Adapter** that wraps the shared HTTP client. Adapters are responsible for path resolution and fetching raw DTOs.

### 3.1 Rules

- **Return raw DTOs**: Adapters must never call Mappers or return ViewModels.
- **Fail-Fast Validation**: All incoming data MUST be validated via Zod schemas before being returned.
- **One Adapter per module**: No shared "mega API" files.
- **Action-Oriented Names**: Method names must match backend endpoints (`submit`, `void`, `post`).

### 3.2 Gold Standard Adapter Implementation

```typescript
// modules/inventory/infrastructure/inventory_adapter.ts
import { apiGet, apiPost } from '@/shared/api/http-client'
import { WarehouseSchema, ItemSchema } from './schemas'
import type { WarehouseDTO, ItemDTO } from './api.types'

export const inventoryAdapter = {
  async getWarehouses(): Promise<WarehouseDTO[]> {
    // 1. Fetch raw data from shared client
    const raw = await apiGet<unknown[]>('/inventory/warehouses')

    // 2. Validate and cast at the boundary (Fail-Fast)
    return raw.map((item) => WarehouseSchema.parse(item))
  },
}
```

---

## 4. The Mapper-as-Factory Pattern

### 4.1 Purpose [MANDATORY]

Mappers are the **Integrity Firewall** // modules/finance/ap/infrastructure/payment_request_adapter.ts
import { apiGet, apiPost } from '@/shared/api/http-client'
import type {
PaymentRequestRead,
PaymentRequestCreate,
PaymentRequestDTO
} from './api.types'

const BASE = '/payment-requests'

export const paymentRequestAdapter = {
// GET /api/v1/payment-requests
async list(): Promise<PaymentRequestRead[]> {
return apiGet<PaymentRequestRead[]>(BASE)
},

// GET /api/v1/payment-requests/:id
async get(id: string): Promise<PaymentRequestRead> {
return apiGet<PaymentRequestRead>(`${BASE}/${id}`)
},

// POST /api/v1/payment-requests
async create(dto: PaymentRequestCreate): Promise<PaymentRequestDTO> {
return apiPost<PaymentRequestDTO>(BASE, dto)
},

// POST /api/v1/payment-requests/:id/submit
async submit(id: string): Promise<PaymentRequestDTO> {
return apiPost<PaymentRequestDTO>(`${BASE}/${id}/submit`)
},

// POST /api/v1/payment-requests/:id/pay
async pay(id: string, dto: any): Promise<PaymentRequestDTO> {
return apiPost<PaymentRequestDTO>(`${BASE}/${id}/pay`, dto)
},
}

```

### 3.2 Rules
- **One API client per module**. No shared "mega API" file.
- **Return raw DTOs**. Mappers are called by composables, not by the API client.
- **Use action-oriented method names** matching backend endpoint names (`submit`, `approve`, `reject`, `pay`).
- **Use apiGet/apiPost helpers**. Never call the raw `httpClient` instance from a module.

async reject(id: string, reason: string): Promise<PaymentRequestDTO> {
return httpClient.post(`${BASE}/${id}/reject`, { reason })
},

// POST /api/v1/payment-requests/:id/pay
async pay(id: string, dto: PaymentRequestPayDTO): Promise<PaymentRequestDTO> {
return httpClient.post(`${BASE}/${id}/pay`, dto)
},
}

```

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
```

**Usage in a module composable:**

```typescript
// modules/finance/ap/application/composables/usePaymentRequests.ts
import { useQuery } from '@tanstack/vue-query'
import { paymentRequestAdapter } from '../infrastructure/payment_request_adapter'
import { APMapper } from '../infrastructure/mappers'

export function usePaymentRequests() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['payment-requests'],
    queryFn: async () => {
      const dtos = await paymentRequestAdapter.list()
      return dtos.map(APMapper.toPaymentRequest)
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
  "generate-types": "openapi-typescript http://localhost:8000/api/v1/openapi.json -o src/shared/api/generated.types.ts"
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
import type { components } from '@/shared/api/generated.types'

// Reference specific DTOs
type PaymentRequestDTO = components['schemas']['PaymentRequestRead']
type PaymentRequestCreateDTO = components['schemas']['PaymentRequestCreate']

/**
 * Note: Generated types go into shared/api/generated.types.ts.
 * Module-level infrastructure/api.types.ts files re-export relevant types for encapsulation.
 */

---

## 6. Error Handling Strategy

### 6.1 Error Flow

```

API Call → Axios Error → ApiError class → Composable catch → Store error state → Component display

````

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
````
