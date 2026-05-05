---
title: 'API Integration Architecture'
description: 'Data flow from backend APIs to screen controllers, covering the HTTP client, adapters, schemas, mappers, and TanStack Query composables.'
tier: frontend
tags: [frontend, architecture, api-integration]
---

# API Integration Architecture

> **Parent:** [Frontend Architecture](ARCHITECTURE.md)
> **Companion:** [Acumatica Alignment](ACUMATICA_ALIGNMENT.md) — maps Data Views to TanStack Query
> **Backend Contract:** Abren API's Envelope Response format
> **Last Updated:** May 2026

---

## 1. Architecture Overview

Data flows through a strict 5-layer pipeline from backend JSON to Vue component rendering. Each layer has exactly one responsibility.

```
Backend API (JSON Response)
    ↓  HTTP
┌─────────────────────────────────────────────────────────────┐
│ 1. Core HTTP Client (shared/api/)         Envelope unwrap   │
├─────────────────────────────────────────────────────────────┤
│ 2. Module Adapter (infrastructure/*_adapter.ts)   Fetch     │
├─────────────────────────────────────────────────────────────┤
│ 3. Schemas (infrastructure/schemas.ts)    Zod validation    │
├─────────────────────────────────────────────────────────────┤
│ 4. Mapper (infrastructure/mappers.ts)     DTO → Domain      │
├─────────────────────────────────────────────────────────────┤
│ 5. Composable (application/use*.ts)       TanStack Query    │
└─────────────────────────────────────────────────────────────┘
    ↓  Reactive refs
Screen Controller (controller.ts) → View (view.vue)
```

### Layer Responsibilities

| Layer       | File Location                             | Input               | Output                        | Allowed Imports                 |
| ----------- | ----------------------------------------- | ------------------- | ----------------------------- | ------------------------------- |
| HTTP Client | `shared/api/`                             | URL + config        | Raw JSON (envelope unwrapped) | Axios, auth store               |
| Adapter     | `modules/{m}/infrastructure/*_adapter.ts` | Method args         | Validated DTOs                | HTTP client, Zod schemas        |
| Schemas     | `modules/{m}/infrastructure/schemas.ts`   | Raw JSON            | Typed DTOs                    | Zod only                        |
| Mapper      | `modules/{m}/infrastructure/mappers.ts`   | DTOs                | Domain types                  | Domain types, value objects     |
| Composable  | `modules/{m}/application/use*.ts`         | Record ID / filters | Reactive refs                 | Adapter, mapper, TanStack Query |

---

## 2. Core HTTP Client

All modules share a single Axios instance configured with interceptors for authentication, idempotency, and error handling.

### 2.1 Base Configuration

```typescript
// shared/api/http-client.ts
import axios, { type AxiosInstance } from 'axios'
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
```

### 2.2 Response Envelope Handling

The backend uses a unified response envelope. The HTTP client unwraps it before data reaches adapters.

**Success Envelope:**

```json
{
  "success": true,
  "data": { ... },
  "meta": { "total": 100, "page": 1 }
}
```

**Error Envelope:**

```json
{
  "success": false,
  "detail": "Descriptive error message",
  "code": "ERROR_CODE_STRING"
}
```

### 2.3 Envelope Types & Unwrapping

```typescript
// shared/api/types.ts

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

// Helpers that unwrap the envelope automatically
export async function apiGet<T>(url: string): Promise<T> {
  const response = await httpClient.get<ApiResponse<T>>(url)
  return response.data.data
}

export async function apiPost<T>(url: string, payload?: unknown): Promise<T> {
  const response = await httpClient.post<ApiResponse<T>>(url, payload)
  return response.data.data
}

export async function apiPut<T>(url: string, payload?: unknown): Promise<T> {
  const response = await httpClient.put<ApiResponse<T>>(url, payload)
  return response.data.data
}

export async function apiDelete<T>(url: string): Promise<T> {
  const response = await httpClient.delete<ApiResponse<T>>(url)
  return response.data.data
}
```

---

## 3. Module Adapters

Each module has a typed **Adapter** that wraps the HTTP client helpers. Adapters fetch raw DTOs — they never call mappers.

### 3.1 Rules

- **Return validated DTOs**: Adapters call Zod schemas to validate incoming data at the boundary.
- **One adapter per module**: No shared "mega API" files.
- **Action-oriented method names**: Match backend endpoints (`submit`, `approve`, `void`, `pay`).
- **No business logic**: Pure I/O wrappers with schema validation.
- **Use `apiGet`/`apiPost` helpers**: Never call the raw `httpClient` from a module.

### 3.2 Canonical Adapter (AP Module)

```typescript
// modules/finance/ap/infrastructure/payment_request_adapter.ts
import { apiGet, apiPost } from '@/shared/api/http-client'
import { PaymentRequestReadSchema } from './schemas'
import type { PaymentRequestRead, PaymentRequestCreate, PaymentRequestDTO } from './api.types'

const BASE = '/payment-requests'

export const paymentRequestAdapter = {
  // GET /api/v1/payment-requests
  async list(): Promise<PaymentRequestRead[]> {
    const raw = await apiGet<unknown[]>(BASE)
    return raw.map((item) => PaymentRequestReadSchema.parse(item))
  },

  // GET /api/v1/payment-requests/:id
  async get(id: string): Promise<PaymentRequestRead> {
    const raw = await apiGet<unknown>(`${BASE}/${id}`)
    return PaymentRequestReadSchema.parse(raw)
  },

  // POST /api/v1/payment-requests
  async create(dto: PaymentRequestCreate): Promise<PaymentRequestDTO> {
    return apiPost<PaymentRequestDTO>(BASE, dto)
  },

  // POST /api/v1/payment-requests/:id/submit
  async submit(id: string): Promise<PaymentRequestDTO> {
    return apiPost<PaymentRequestDTO>(`${BASE}/${id}/submit`)
  },

  // POST /api/v1/payment-requests/:id/approve
  async approve(id: string): Promise<PaymentRequestDTO> {
    return apiPost<PaymentRequestDTO>(`${BASE}/${id}/approve`)
  },

  // POST /api/v1/payment-requests/:id/reject
  async reject(id: string, reason: string): Promise<PaymentRequestDTO> {
    return apiPost<PaymentRequestDTO>(`${BASE}/${id}/reject`, { reason })
  },
}
```

---

## 4. Zod Schemas (Fail-Fast Boundary)

Schemas validate data at the **exact boundary** between untrusted network data and trusted application types.

### 4.1 Rules

- Schemas live in `infrastructure/schemas.ts` within each module.
- Every field from the API must be explicitly listed — no `z.passthrough()`.
- Schema parse failures are **loud** — they throw immediately (fail-fast).

### 4.2 Example

```typescript
// modules/finance/ap/infrastructure/schemas.ts
import { z } from 'zod'

export const PaymentRequestReadSchema = z.object({
  id: z.string().uuid(),
  reference_number: z.string(),
  beneficiary_name: z.string(),
  amount: z.number(),
  currency: z.string().length(3),
  status: z.enum(['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PAID']),
  bank_account_id: z.string().uuid().nullable(),
  submitted_at: z.string().nullable(),
  paid_at: z.string().nullable(),
  created_at: z.string(),
})

export type PaymentRequestRead = z.infer<typeof PaymentRequestReadSchema>
```

---

## 5. The Mapper-as-Factory Pattern

Mappers are the **integrity firewall** between backend DTOs and frontend domain types.

### 5.1 Purpose

1. **Isolation**: Backend field renames propagate only to the mapper file — not to components or controllers.
2. **Domain Construction**: Branded IDs, value objects (Money), and computed properties are created here.
3. **Null Safety**: Mappers provide defaults before data enters reactive state.

### 5.2 Anatomy

```typescript
// modules/finance/ap/infrastructure/mappers.ts
import type { PaymentRequestRead } from './schemas'
import type { PaymentRequest } from '../domain/payment-request.types'
import { Money } from '@/shared/domain/value-objects'
import type { PaymentRequestId, VendorId } from '@/shared/domain/branded-types'

export const APMapper = {
  toPaymentRequest(dto: PaymentRequestRead): PaymentRequest {
    return {
      id: dto.id as PaymentRequestId,
      referenceNumber: dto.reference_number,
      vendor: dto.beneficiary_name,
      vendorId: dto.bank_account_id as VendorId | null,
      amount: Money.from(dto.amount, dto.currency),
      status: dto.status,
      submittedAt: dto.submitted_at,
      paidAt: dto.paid_at,
      createdAt: dto.created_at,
    }
  },
}
```

### 5.3 Data Flow Summary

```
Backend JSON
    ↓ apiGet (envelope unwrap)
PaymentRequestRead (Zod-validated DTO)
    ↓ APMapper.toPaymentRequest
PaymentRequest (domain type with branded IDs, Money values)
    ↓ TanStack Query (reactive ref)
Screen Controller (controller.ts)
    ↓ useField / useGrid bindings
Vue Component (view.vue — pure render)
```

---

## 6. TanStack Query Composables

Composables orchestrate data fetching via TanStack Query, calling adapters and mappers.

### 6.1 Rules

- **Query keys** must match `ScreenDefinition.views[].queryKey` for controller binding.
- **Mappers called here** — adapters return DTOs, composables transform to domain types.
- **No direct component usage** — composables are consumed by controllers only.

### 6.2 Query Example

```typescript
// modules/finance/ap/application/usePaymentRequests.ts
import { useQuery } from '@tanstack/vue-query'
import { paymentRequestAdapter } from '../../infrastructure/payment_request_adapter'
import { APMapper } from '../../infrastructure/mappers'

export function usePaymentRequests() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['ap', 'payment-requests'],
    queryFn: async () => {
      const dtos = await paymentRequestAdapter.list()
      return dtos.map(APMapper.toPaymentRequest)
    },
  })

  return { requests: data, isLoading, error }
}
```

### 6.3 Mutation Example

```typescript
// modules/finance/ap/application/usePaymentRequestActions.ts
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { paymentRequestAdapter } from '../../infrastructure/payment_request_adapter'

export function usePaymentRequestActions() {
  const queryClient = useQueryClient()

  const submitMutation = useMutation({
    mutationFn: (id: string) => paymentRequestAdapter.submit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ap', 'payment-requests'] })
    },
  })

  return { submit: submitMutation }
}
```

---

## 7. OpenAPI Type Generation

The backend's OpenAPI spec is the **single source of truth** for API types.

### 7.1 Setup

```bash
# Install the generator
npm install -D openapi-typescript

# Add script to package.json
"generate-types": "openapi-typescript http://localhost:8000/api/v1/openapi.json -o src/shared/api/generated.types.ts"
```

### 7.2 Workflow

```
1. Backend developer adds/changes a DTO
2. Backend starts locally (uvicorn)
3. Frontend runs: npm run generate-types
4. TypeScript compiler detects breaking type changes
5. Only mapper files need updating — components remain untouched
```

### 7.3 Generated Type Usage

```typescript
// Reference specific DTOs from generated types
import type { components } from '@/shared/api/generated.types'

type PaymentRequestDTO = components['schemas']['PaymentRequestRead']
type PaymentRequestCreateDTO = components['schemas']['PaymentRequestCreate']
```

> Generated types go into `shared/api/generated.types.ts`. Module-level `infrastructure/api.types.ts` files re-export relevant types for encapsulation.

---

## 8. Error Handling

### 8.1 Error Flow

```
API Call → Axios Error → Interceptor → ApiError class → Composable catch → Controller error state → View display
```

### 8.2 Global vs Local Error Handling

| Error Type              | Handling                                   | Example                          |
| ----------------------- | ------------------------------------------ | -------------------------------- |
| `401 Unauthorized`      | **Global**: Auto-redirect to login         | Token expired                    |
| `403 Forbidden`         | **Global**: Show "access denied" toast     | Feature not enabled              |
| `429 Too Many Requests` | **Global**: Show rate limit warning        | Rapid API calls                  |
| `404 Not Found`         | **Local**: Module composable handles it    | Entity deleted                   |
| `422 Validation`        | **Local**: Show field-level errors on form | Invalid form data                |
| `409 Conflict`          | **Local**: Show conflict resolution UI     | Optimistic concurrency violation |
| `5xx Server Error`      | **Global**: Show generic error banner      | Backend down                     |

### 8.3 Global Error Interceptor

```typescript
// shared/api/error-handler.ts
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
