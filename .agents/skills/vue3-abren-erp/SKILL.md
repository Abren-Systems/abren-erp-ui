---
name: Vue 3 Abren ERP Development
description: Comprehensive patterns, conventions, and code examples for developing the Abren ERP UI with Vue 3 Composition API, Pinia, TypeScript, and DDD-aligned module architecture. Use this skill for ALL Vue code generation in this project.
---

# Vue 3 Abren ERP Development Skill

## CRITICAL: Always Follow These Rules

1. **ALWAYS** use Vue 3 **Composition API** with `<script setup lang="ts">`. **NEVER** use Options API.
2. **ALWAYS** use TypeScript strict mode. **NEVER** use `any`.
3. **ALWAYS** use `ref()` for primitive values, `reactive()` for objects. **NEVER** mix them inconsistently.
4. **ALWAYS** use Pinia `defineStore()` with **setup function syntax** (not options syntax).
5. **ALWAYS** use scoped styles: `<style scoped>`.
6. **ALWAYS** use CSS custom properties from `src/styles/variables.css` for colors, spacing, and typography.
7. **NEVER** import from another module's internals. Only import from `@/shared/` or the current module.

---

## Project Structure

```
src/
├── app/              # Application shell (router, layouts, main.ts)
├── shared/           # Shared Kernel (cross-cutting concerns)
│   ├── api/          # HTTP client, error handling, generated types
│   ├── auth/         # Auth store, route guards
│   ├── components/   # Design system primitives (AppButton, AppModal, etc.)
│   ├── composables/  # Cross-cutting hooks (useFeatureGate, usePagination)
│   ├── domain/       # Value objects (Money, Currency) and branded types
│   ├── event-bus/    # Typed cross-module event bus
│   └── utils/        # Pure utility functions (formatDate, formatMoney)
├── modules/          # Bounded contexts (one per backend module)
│   ├── identity/
│   ├── accounting/
│   ├── workflows/
│   ├── payment-requests/
│   ├── banking/
│   ├── reporting/
│   ├── webhooks/
│   └── system/
└── styles/           # Design tokens (CSS custom properties)
```

Each module has this internal structure:
```
modules/{name}/
├── api/              → {name}.api.ts        (HTTP client)
├── components/       → {Entity}{Role}.vue   (UI components)
├── composables/      → use{Action}.ts       (business logic hooks)
├── mappers/          → {entity}.mapper.ts   (DTO → ViewModel)
├── pages/            → {Entity}Page.vue     (route-level views)
├── stores/           → {name}.store.ts      (Pinia state)
├── types/            → api.types.ts, view.types.ts
└── routes.ts         → lazy-loaded route definitions
```

---

## Pattern 1: Vue Component (SFC)

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { usePaymentRequests } from '../composables/usePaymentRequests'
import type { PaymentRequestViewModel } from '../types/view.types'

// ── Props ────────────────────────────────────────────────
interface Props {
  tenantId: string
  showDraftsOnly?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  showDraftsOnly: false,
})

// ── Emits ────────────────────────────────────────────────
interface Emits {
  (e: 'select', request: PaymentRequestViewModel): void
  (e: 'create'): void
}
const emit = defineEmits<Emits>()

// ── Composable (Use Case) ────────────────────────────────
const { requests, isLoading, error, refresh } = usePaymentRequests()

// ── Local State ──────────────────────────────────────────
const searchQuery = ref('')

// ── Computed ─────────────────────────────────────────────
const filteredRequests = computed(() => {
  let result = requests.value
  if (props.showDraftsOnly) {
    result = result.filter(r => r.status === 'DRAFT')
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(r => r.beneficiary.toLowerCase().includes(q))
  }
  return result
})

// ── Methods ──────────────────────────────────────────────
function handleSelect(request: PaymentRequestViewModel) {
  emit('select', request)
}
</script>

<template>
  <div class="payment-request-list">
    <header class="list-header">
      <h2>Payment Requests</h2>
      <div class="list-actions">
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Search beneficiary..."
          class="search-input"
          data-testid="search-requests"
        />
        <button
          class="btn btn-primary"
          data-testid="create-request"
          @click="emit('create')"
        >
          New Request
        </button>
      </div>
    </header>

    <div v-if="isLoading" class="loading-state" data-testid="loading">
      Loading...
    </div>

    <div v-else-if="error" class="error-state" data-testid="error">
      {{ error }}
      <button @click="refresh">Retry</button>
    </div>

    <table v-else class="data-table" data-testid="request-table">
      <thead>
        <tr>
          <th>Beneficiary</th>
          <th>Amount</th>
          <th>Status</th>
          <th>Submitted</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="request in filteredRequests"
          :key="request.id"
          class="clickable-row"
          :data-testid="`request-row-${request.id}`"
          @click="handleSelect(request)"
        >
          <td>{{ request.beneficiary }}</td>
          <td>{{ request.amount.format() }}</td>
          <td>
            <span :class="['status-badge', `status-${request.statusColor}`]">
              {{ request.statusLabel }}
            </span>
          </td>
          <td>{{ request.submittedAt ?? '—' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.payment-request-list {
  padding: var(--space-lg);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
}

.list-actions {
  display: flex;
  gap: var(--space-md);
}

.search-input {
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-md);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: var(--space-sm) var(--space-md);
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

.clickable-row {
  cursor: pointer;
}

.clickable-row:hover {
  background-color: var(--color-hover);
}

.status-badge {
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.status-gray { background: var(--color-gray-100); color: var(--color-gray-700); }
.status-blue { background: var(--color-blue-100); color: var(--color-blue-700); }
.status-green { background: var(--color-green-100); color: var(--color-green-700); }
.status-red { background: var(--color-red-100); color: var(--color-red-700); }
</style>
```

---

## Pattern 2: Pinia Store (Setup Syntax)

**ALWAYS use the setup function syntax (function-based), NOT the options syntax.**

```typescript
// modules/payment-requests/stores/payment-requests.store.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PaymentRequestViewModel } from '../types/view.types'

export const usePaymentRequestStore = defineStore('payment-requests', () => {
  // ── State (use ref for each) ───────────────────────────
  const requests = ref<PaymentRequestViewModel[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const selectedId = ref<string | null>(null)

  // ── Computed (derived state) ───────────────────────────
  const selectedRequest = computed(() =>
    requests.value.find(r => r.id === selectedId.value) ?? null
  )

  const draftCount = computed(() =>
    requests.value.filter(r => r.status === 'DRAFT').length
  )

  // ── Actions (plain functions) ──────────────────────────
  function setRequests(data: PaymentRequestViewModel[]) {
    requests.value = data
  }

  function updateRequest(updated: PaymentRequestViewModel) {
    const idx = requests.value.findIndex(r => r.id === updated.id)
    if (idx >= 0) {
      requests.value[idx] = updated
    }
  }

  function setLoading(state: boolean) {
    isLoading.value = state
  }

  function setError(msg: string | null) {
    error.value = msg
  }

  function clearSelection() {
    selectedId.value = null
  }

  function $reset() {
    requests.value = []
    isLoading.value = false
    error.value = null
    selectedId.value = null
  }

  return {
    // State
    requests, isLoading, error, selectedId,
    // Computed
    selectedRequest, draftCount,
    // Actions
    setRequests, updateRequest, setLoading, setError, clearSelection, $reset,
  }
})
```

**WRONG (Options syntax — NEVER use this):**
```typescript
// ❌ DO NOT USE THIS PATTERN
export const useStore = defineStore('name', {
  state: () => ({ ... }),
  getters: { ... },
  actions: { ... },
})
```

---

## Pattern 3: Composable (Use Case Hook)

Composables orchestrate: API call → Mapper → Store update → Side effects.

```typescript
// modules/payment-requests/composables/usePaymentRequests.ts
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { usePaymentRequestStore } from '../stores/payment-requests.store'
import { paymentRequestApi } from '../api/payment-requests.api'
import { toViewModel } from '../mappers/payment-request.mapper'

export function usePaymentRequests() {
  const store = usePaymentRequestStore()
  const { requests, isLoading, error } = storeToRefs(store)

  async function fetchRequests() {
    store.setLoading(true)
    store.setError(null)
    try {
      const dtos = await paymentRequestApi.list()
      store.setRequests(dtos.map(toViewModel))
    } catch (e: unknown) {
      store.setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      store.setLoading(false)
    }
  }

  onMounted(fetchRequests)

  return {
    requests,
    isLoading,
    error,
    refresh: fetchRequests,
  }
}
```

### Action-Oriented Composable (Mirrors Backend Action Endpoint)

```typescript
// modules/payment-requests/composables/useSubmitRequest.ts
import { usePaymentRequestStore } from '../stores/payment-requests.store'
import { paymentRequestApi } from '../api/payment-requests.api'
import { toViewModel } from '../mappers/payment-request.mapper'
import { eventBus } from '@/shared/event-bus/event-bus'

export function useSubmitRequest() {
  const store = usePaymentRequestStore()

  async function submit(id: string) {
    // 1. Call action endpoint
    const dto = await paymentRequestApi.submit(id)

    // 2. Map and update store
    const vm = toViewModel(dto)
    store.updateRequest(vm)

    // 3. Notify other modules via Event Bus
    eventBus.emit('payment-request:submitted', { id })

    return vm
  }

  return { submit }
}
```

---

## Pattern 4: API Client

```typescript
// modules/payment-requests/api/payment-requests.api.ts
import { httpClient } from '@/shared/api/http-client'
import type {
  PaymentRequestDTO,
  PaymentRequestCreateDTO,
  PaymentRequestPayDTO,
} from '../types/api.types'

const BASE = '/payment-requests'

export const paymentRequestApi = {
  list: (): Promise<PaymentRequestDTO[]> =>
    httpClient.get(BASE),

  get: (id: string): Promise<PaymentRequestDTO> =>
    httpClient.get(`${BASE}/${id}`),

  create: (dto: PaymentRequestCreateDTO): Promise<PaymentRequestDTO> =>
    httpClient.post(BASE, dto),

  submit: (id: string): Promise<PaymentRequestDTO> =>
    httpClient.post(`${BASE}/${id}/submit`),

  approve: (id: string): Promise<PaymentRequestDTO> =>
    httpClient.post(`${BASE}/${id}/approve`),

  reject: (id: string, reason: string): Promise<PaymentRequestDTO> =>
    httpClient.post(`${BASE}/${id}/reject`, { reason }),

  pay: (id: string, dto: PaymentRequestPayDTO): Promise<PaymentRequestDTO> =>
    httpClient.post(`${BASE}/${id}/pay`, dto),
}
```

---

## Pattern 5: Mapper (Anti-Corruption Layer)

Mappers are pure functions: DTO in → ViewModel out. No side effects.

```typescript
// modules/payment-requests/mappers/payment-request.mapper.ts
import { Money } from '@/shared/domain/money'
import { formatDate } from '@/shared/utils/date'
import type { PaymentRequestDTO } from '../types/api.types'
import type { PaymentRequestViewModel } from '../types/view.types'

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Pending Approval',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  PAID: 'Paid',
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'gray',
  SUBMITTED: 'blue',
  APPROVED: 'green',
  REJECTED: 'red',
  PAID: 'emerald',
}

export function toViewModel(dto: PaymentRequestDTO): PaymentRequestViewModel {
  return {
    id: dto.id,
    beneficiary: dto.beneficiary_name,
    amount: Money.from(dto.amount, dto.currency),
    status: dto.status,
    statusLabel: STATUS_LABELS[dto.status] ?? dto.status,
    statusColor: STATUS_COLORS[dto.status] ?? 'gray',
    canSubmit: dto.status === 'DRAFT',
    canApprove: dto.status === 'SUBMITTED',
    canReject: dto.status === 'SUBMITTED',
    canPay: dto.status === 'APPROVED',
    submittedAt: dto.submitted_at ? formatDate(dto.submitted_at) : null,
    paidAt: dto.paid_at ? formatDate(dto.paid_at) : null,
  }
}

export function toCreateDTO(form: PaymentRequestFormData): PaymentRequestCreateDTO {
  return {
    beneficiary_name: form.beneficiary,
    amount: form.amount,
    currency: form.currency,
    description: form.description,
  }
}
```

---

## Pattern 6: Types (API DTOs + View Models)

```typescript
// modules/payment-requests/types/api.types.ts
// These mirror backend Pydantic DTOs (ideally auto-generated from OpenAPI)
export interface PaymentRequestDTO {
  id: string
  beneficiary_name: string
  amount: number
  currency: string
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PAID'
  description: string | null
  bank_account_id: string | null
  submitted_at: string | null
  paid_at: string | null
  current_approval_step: number
  assigned_approver_id: string | null
}

export interface PaymentRequestCreateDTO {
  beneficiary_name: string
  amount: number
  currency: string
  description: string | null
}

export interface PaymentRequestPayDTO {
  payment_method: string
  disbursement_reference: string
}
```

```typescript
// modules/payment-requests/types/view.types.ts
// These are what Vue components consume — UI-optimized
import type { Money } from '@/shared/domain/money'

export interface PaymentRequestViewModel {
  id: string
  beneficiary: string                // Renamed for UI clarity
  amount: Money                       // Value Object, not raw number
  status: string
  statusLabel: string                 // "Draft", "Pending Approval"
  statusColor: string                 // CSS class name
  canSubmit: boolean                  // Derived UI permission
  canApprove: boolean
  canReject: boolean
  canPay: boolean
  submittedAt: string | null          // Formatted date string
  paidAt: string | null
}

export interface PaymentRequestFormData {
  beneficiary: string
  amount: number
  currency: string
  description: string
}
```

---

## Pattern 7: Route Definition

```typescript
// modules/payment-requests/routes.ts
import type { RouteRecordRaw } from 'vue-router'

export const paymentRequestRoutes: RouteRecordRaw[] = [
  {
    path: '/payments',
    meta: { requiresAuth: true, feature: 'payment_requests' },
    children: [
      {
        path: '',
        name: 'payments.list',
        component: () => import('./pages/PaymentRequestListPage.vue'),
      },
      {
        path: ':id',
        name: 'payments.detail',
        component: () => import('./pages/PaymentRequestDetailPage.vue'),
        props: true,
      },
      {
        path: 'create',
        name: 'payments.create',
        component: () => import('./pages/PaymentRequestCreatePage.vue'),
      },
    ],
  },
]
```

---

## Pattern 8: Page Component

Pages are thin — they compose components and call composables.

```vue
<!-- modules/payment-requests/pages/PaymentRequestListPage.vue -->
<script setup lang="ts">
import { useRouter } from 'vue-router'
import { usePaymentRequests } from '../composables/usePaymentRequests'
import PaymentRequestList from '../components/PaymentRequestList.vue'
import type { PaymentRequestViewModel } from '../types/view.types'

const router = useRouter()
const { requests, isLoading, error, refresh } = usePaymentRequests()

function handleSelect(request: PaymentRequestViewModel) {
  router.push({ name: 'payments.detail', params: { id: request.id } })
}

function handleCreate() {
  router.push({ name: 'payments.create' })
}
</script>

<template>
  <div class="page">
    <PaymentRequestList
      :requests="requests"
      :is-loading="isLoading"
      :error="error"
      @select="handleSelect"
      @create="handleCreate"
      @refresh="refresh"
    />
  </div>
</template>

<style scoped>
.page {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
```

---

## Pattern 9: Shared Kernel Value Object

```typescript
// shared/domain/money.ts
export enum Currency {
  ETB = 'ETB',
  USD = 'USD',
  EUR = 'EUR',
}

export class Money {
  private constructor(
    public readonly amount: number,
    public readonly currency: Currency | string
  ) {}

  static from(amount: number, currency: Currency | string): Money {
    return new Money(amount, currency)
  }

  static zero(currency: Currency | string): Money {
    return new Money(0, currency)
  }

  format(locale: string = 'en-ET'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: String(this.currency),
      minimumFractionDigits: 2,
    }).format(this.amount)
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error(`Cannot add ${this.currency} and ${other.currency}`)
    }
    return new Money(this.amount + other.amount, this.currency)
  }

  subtract(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error(`Cannot subtract ${this.currency} and ${other.currency}`)
    }
    return new Money(this.amount - other.amount, this.currency)
  }

  isZero(): boolean {
    return this.amount === 0
  }

  isPositive(): boolean {
    return this.amount > 0
  }
}
```

---

## Pattern 10: Typed Event Bus

```typescript
// shared/event-bus/event-bus.ts
import type { Money } from '@/shared/domain/money'

export type EventMap = {
  'payment-request:submitted': { id: string }
  'payment-request:approved': { id: string }
  'payment-request:rejected': { id: string; reason: string }
  'payment-request:paid': { id: string; amount: Money }
  'journal-entry:posted': { id: string; entryNumber: string }
  'journal-entry:voided': { id: string }
  'tenant:switched': { tenantId: string }
  'tenant:feature-toggled': { feature: string; enabled: boolean }
  'auth:logged-out': Record<string, never>
}

type EventHandler<T> = (payload: T) => void

class TypedEventBus {
  private listeners = new Map<string, Set<Function>>()

  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void {
    const handlers = this.listeners.get(event as string)
    if (handlers) {
      handlers.forEach(handler => handler(payload))
    }
  }

  on<K extends keyof EventMap>(
    event: K,
    handler: EventHandler<EventMap[K]>
  ): () => void {
    if (!this.listeners.has(event as string)) {
      this.listeners.set(event as string, new Set())
    }
    this.listeners.get(event as string)!.add(handler)

    // Return unsubscribe function
    return () => this.off(event, handler)
  }

  off<K extends keyof EventMap>(
    event: K,
    handler: EventHandler<EventMap[K]>
  ): void {
    this.listeners.get(event as string)?.delete(handler)
  }

  clear(): void {
    this.listeners.clear()
  }
}

export const eventBus = new TypedEventBus()
```

---

## Pattern 11: Unit Test (Mapper)

```typescript
// modules/payment-requests/mappers/__tests__/payment-request.mapper.test.ts
import { describe, it, expect } from 'vitest'
import { toViewModel } from '../payment-request.mapper'
import type { PaymentRequestDTO } from '../../types/api.types'

const baseDTO: PaymentRequestDTO = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  beneficiary_name: 'Acme Corp',
  amount: 15000.50,
  currency: 'ETB',
  status: 'DRAFT',
  description: 'Office supplies',
  bank_account_id: null,
  submitted_at: null,
  paid_at: null,
  current_approval_step: 0,
  assigned_approver_id: null,
}

describe('PaymentRequest Mapper', () => {
  it('maps beneficiary_name to beneficiary', () => {
    const vm = toViewModel(baseDTO)
    expect(vm.beneficiary).toBe('Acme Corp')
  })

  it('wraps amount in Money value object', () => {
    const vm = toViewModel(baseDTO)
    expect(vm.amount.amount).toBe(15000.50)
    expect(vm.amount.format()).toContain('15,000.50')
  })

  it('derives canSubmit=true for DRAFT', () => {
    const vm = toViewModel(baseDTO)
    expect(vm.canSubmit).toBe(true)
    expect(vm.canApprove).toBe(false)
    expect(vm.canPay).toBe(false)
  })

  it('derives canApprove=true for SUBMITTED', () => {
    const vm = toViewModel({ ...baseDTO, status: 'SUBMITTED' })
    expect(vm.canApprove).toBe(true)
    expect(vm.canSubmit).toBe(false)
  })

  it('derives canPay=true for APPROVED', () => {
    const vm = toViewModel({ ...baseDTO, status: 'APPROVED' })
    expect(vm.canPay).toBe(true)
    expect(vm.canApprove).toBe(false)
  })

  it('formats submittedAt when present', () => {
    const vm = toViewModel({
      ...baseDTO,
      status: 'SUBMITTED',
      submitted_at: '2026-03-20T15:30:00Z',
    })
    expect(vm.submittedAt).toBeTruthy()
    expect(vm.submittedAt).not.toBe('2026-03-20T15:30:00Z') // Should be formatted
  })

  it('leaves submittedAt null when not set', () => {
    const vm = toViewModel(baseDTO)
    expect(vm.submittedAt).toBeNull()
  })
})
```

---

## Import Aliases

Always use these path aliases:

```typescript
// ✅ Correct imports
import { Money } from '@/shared/domain/money'
import { httpClient } from '@/shared/api/http-client'
import { eventBus } from '@/shared/event-bus/event-bus'
import { useAuthStore } from '@/shared/auth/auth.store'

// ✅ Module-internal (relative)
import { usePaymentRequestStore } from '../stores/payment-requests.store'
import { toViewModel } from '../mappers/payment-request.mapper'

// ❌ BANNED: Cross-module imports
import { useAccountingStore } from '@/modules/accounting/stores/accounting.store'
```

---

## Common Reactivity Mistakes to Avoid

```typescript
// ❌ WRONG: Destructuring loses reactivity
const { requests } = usePaymentRequestStore()

// ✅ CORRECT: Use storeToRefs for reactive destructuring
const { requests } = storeToRefs(usePaymentRequestStore())

// ❌ WRONG: ref for complex objects
const formData = ref({ name: '', amount: 0 })

// ✅ CORRECT: reactive for objects, ref for primitives
const formData = reactive({ name: '', amount: 0 })
const isSubmitting = ref(false)

// ❌ WRONG: Forgetting .value in script
if (isLoading) { ... }

// ✅ CORRECT: Always use .value in <script>, never in <template>
if (isLoading.value) { ... }
```

---

## Backend API Conventions

The backend uses these patterns that the UI must align with:

- **Action-oriented endpoints**: `POST /{resource}/{id}/{action}` (never `PATCH` for state changes)
- **Response envelope**: `{ success: true, data: { ... } }` or `{ success: false, detail: "...", code: "..." }`
- **Idempotency**: All mutating requests must send an `Idempotency-Key` header
- **Tenant context**: Always include tenant ID in auth headers
- **Date format**: All dates are UTC ISO 8601 strings
