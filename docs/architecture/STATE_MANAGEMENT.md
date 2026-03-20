# State Management Architecture

> **Parent:** [Frontend Architecture](ARCHITECTURE.md)
> **Technology:** Pinia (TypeScript-first Vue Store)

---

## 1. Dual-State Philosophy

We distinguish between two types of state to ensure high performance and reliability:

1.  **Server State (TanStack Query)**: Data that lives on the server and is fetched via API (e.g., Accounts, Payment Requests). TanStack Query handles caching, refetching, and optimistic updates.
2.  **Client State (Pinia)**: Ephemeral UI state (e.g., "is sidebar open") or cross-cutting configuration (e.g., "current tenant").

### 1.1 Store Boundaries
Each module has a dedicated Pinia store for its **Client State**. Server State is co-located with components or orchestrated via module-level composables using TanStack Query.

---

## 2. Store Anatomy

### 2.1 Standard Store Template

```typescript
// modules/payment-requests/stores/payment-requests.store.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PaymentRequestViewModel } from '../types/view.types'

export const usePaymentRequestStore = defineStore('payment-requests', () => {
  // ── State ──────────────────────────────────────────────
  const requests = ref<PaymentRequestViewModel[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const selectedId = ref<string | null>(null)

  // ── Computed (Derived State) ───────────────────────────
  const selectedRequest = computed(() =>
    requests.value.find(r => r.id === selectedId.value) ?? null
  )
  const draftRequests = computed(() =>
    requests.value.filter(r => r.status === 'DRAFT')
  )
  const pendingApproval = computed(() =>
    requests.value.filter(r => r.status === 'SUBMITTED')
  )

  // ── Actions ────────────────────────────────────────────
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

  function $reset() {
    requests.value = []
    isLoading.value = false
    error.value = null
    selectedId.value = null
  }

  return {
    // State
    requests,
    isLoading,
    error,
    selectedId,
    // Computed
    selectedRequest,
    draftRequests,
    pendingApproval,
    // Actions
    setRequests,
    updateRequest,
    setLoading,
    setError,
    $reset,
  }
})
```

### 2.2 Key Rules
- **Setup Store syntax** (function-based) over Options API for full TypeScript inference.
- **Stores hold ViewModels**, not raw DTOs. The mapper transforms data before it enters the store.
- **No API calls in stores**. Stores are passive state containers. Composables orchestrate data flow.
- **Always expose `$reset()`** for logout cleanup and testing.

---

## 3. Data Flow: API → Store → Component

```mermaid
sequenceDiagram
    participant C as Component
    participant H as Composable (Use Case)
    participant A as API Client
    participant M as Mapper
    participant S as Pinia Store

    C->>H: onMounted → fetchRequests()
    H->>S: store.setLoading(true)
    H->>A: paymentRequestApi.list()
    A-->>H: PaymentRequestDTO[]
    H->>M: dtos.map(toViewModel)
    M-->>H: PaymentRequestViewModel[]
    H->>S: store.setRequests(viewModels)
    H->>S: store.setLoading(false)
    S-->>C: Reactive update via storeToRefs()
```

### 3.1 Composable Orchestrating the Flow

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
    } catch (e) {
      store.setError(e instanceof Error ? e.message : 'Failed to load requests')
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

---

## 4. Cross-Module Reactivity via Event Bus

Stores **never** import other stores. When Module A's action should refresh Module B's data, use the Event Bus:

```typescript
// modules/payment-requests/composables/usePayRequest.ts
import { eventBus } from '@/shared/event-bus/event-bus'

export function usePayRequest() {
  async function payRequest(id: string, dto: PayRequestDTO) {
    const result = await paymentRequestApi.pay(id, dto)
    store.updateRequest(toViewModel(result))

    // Notify other modules without importing them
    eventBus.emit('payment-request:paid', {
      id: result.id,
      amount: Money.from(result.amount, result.currency),
    })
  }

  return { payRequest }
}

// modules/accounting/composables/useJournalEntries.ts
// Subscribes to the event — refreshes its own data
eventBus.on('payment-request:paid', () => {
  fetchJournalEntries()  // Refresh accounting data
})
```

---

## 5. Optimistic Updates Pattern

For actions that should feel instant (like submitting a request), apply state changes before the API confirms:

```typescript
export function useSubmitRequest() {
  const store = usePaymentRequestStore()

  async function submit(id: string) {
    const previousState = { ...store.requests }

    // 1. Optimistic update
    store.updateRequest({
      ...store.selectedRequest!,
      status: 'SUBMITTED',
      canSubmit: false,
    })

    try {
      // 2. Confirm with server
      const confirmed = await paymentRequestApi.submit(id)
      store.updateRequest(toViewModel(confirmed))
    } catch (error) {
      // 3. Rollback on failure
      store.setRequests(previousState)
      throw error
    }
  }

  return { submit }
}
```

---

## 6. Auth Store (Shared Cross-Cutting Concern)

The auth store is the **only** store in `shared/`. It holds identity state consumed by all modules:

```typescript
// shared/auth/auth.store.ts
export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const currentUser = ref<CurrentUser | null>(null)
  const currentTenant = ref<TenantInfo | null>(null)

  const isAuthenticated = computed(() => !!token.value)
  const tenantFeatures = computed(() =>
    currentTenant.value?.features ?? {}
  )

  function hasFeature(feature: string): boolean {
    return tenantFeatures.value[feature] === true
  }

  return {
    token,
    currentUser,
    currentTenant,
    isAuthenticated,
    tenantFeatures,
    hasFeature,
  }
})
```

This store is not a bounded context — it's infrastructure that enables module isolation by providing identity context to route guards and API interceptors.
