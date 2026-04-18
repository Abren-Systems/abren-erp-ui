---
title: "Error Handling & Loading States"
description: "In an ERP, errors are **expected operational events** — network failures, validation rejections, concurrent edit conflicts, permission denials. The error handling strategy must be:"
tier: frontend
tags: [frontend, architecture]
---

# Error Handling & Loading States

> **Parent:** [Frontend Architecture](ARCHITECTURE.md)
> **Technology:** TanStack Query (server errors) + Composables (orchestration) + Toast System (user feedback)

---

## 1. Philosophy

In an ERP, errors are **expected operational events** — network failures, validation rejections, concurrent edit conflicts, permission denials. The error handling strategy must be:

1. **Predictable:** Every error category has a single, documented handling path.
2. **Non-Destructive:** Errors never silently discard user work (unsaved form data, in-progress edits).
3. **Actionable:** Error messages tell the user **what to do**, not just what went wrong.

---

## 2. Error Categories & Handling Matrix

Our error handling logic uses a combination of **HTTP Status Codes** (transport) and **Error Codes** (domain) to resolve user-facing feedback. This ensures symmetry with the backend's `DomainError` system.

| HTTP Status | Domain Code         | Category        | User-Facing Behavior                                |
| ----------- | ------------------- | --------------- | --------------------------------------------------- |
| `401`       | —                   | Session Expired | Redirect to `/login`                                |
| `403`       | `PERMISSION_DENIED` | Forbidden       | Toast: "Access denied. Required: [permission]"      |
| `404`       | `RECORD_NOT_FOUND`  | Not Found       | Local state reset + "Record does not exist"         |
| `409`       | `CONFLICT`          | Concurrent Edit | Toast: "Record was modified. Please refresh."       |
| `422`       | `VALIDATION_ERROR`  | Input Integrity | Field-level inline errors (Zod + TanStack Form)     |
| `429`       | `RATE_LIMIT`        | Rate Limited    | Toast: "Too many requests. Please wait."            |
| `500`       | `INTERNAL_ERROR`    | Server Error    | Toast: "Something went wrong. Please try again."    |
| —           | `NETWORK_FAILURE`   | Connectivity    | Toast with retry: "Unable to reach the server."     |
| —           | `PROVIDER_DOWN`     | Integration     | Toast: "External service is currently unavailable." |

---

## 3. Error Handling Layers

### 3.1 Layer 1: HTTP Interceptor (Automatic Integration)

The core HTTP client handles infrastructure errors and unwraps the success/error envelopes. It populates an `ApiError` class with the specific backend error code.

```typescript
// core/api/http-client.ts — Response interceptor

httpClient.interceptors.response.use(
  (response) => response.data, // Unwrap Success Envelope: { data: T } -> T
  async (error) => {
    if (error.response) {
      const { status, data } = error.response as AxiosResponse<ApiErrorResponse>

      // Session expired — clear auth and redirect
      if (status === 401) {
        handleAuthExpiry()
        return Promise.reject(new ApiError('UNAUTHORIZED', 'Session expired.'))
      }

      // Handle Structured Error Envelopes: { detail: S, code: C }
      if (data && data.success === false) {
        return Promise.reject(new ApiError(data.code, data.detail, status))
      }
    }

    // Fallback for timeout/network failures
    return Promise.reject(new ApiError('NETWORK_FAILURE', error.message))
  },
)
```

### 3.2 Layer 2: Mutation Composable (Module-Specific)

Each mutation composable handles domain-specific error scenarios via TanStack Query's `onError` callback:

```typescript
// modules/.../application/composables/useSubmitRequest.ts
return useMutation({
  mutationFn: (id: string) => adapter.submit(id),
  onError: (error: Error) => {
    // Domain-specific error handling
    toast.error(error.message || 'Failed to submit the request.')
  },
  onSuccess: () => {
    toast.success('Request submitted successfully.')
    void queryClient.invalidateQueries({ queryKey: ['payment-requests'] })
  },
})
```

### 3.3 Layer 3: Component (Presentation)

Components display errors from the composable's reactive `error` state. They never catch or handle errors directly:

```vue
<template>
  <!-- Query error — inline fallback -->
  <div v-if="error" class="rounded-lg border border-danger-200 bg-danger-50 p-4">
    <p class="text-sm text-danger-700">{{ error.message }}</p>
    <Button variant="outline" size="sm" @click="refetch">Retry</Button>
  </div>

  <!-- Normal data rendering -->
  <DataGrid v-else :data="data ?? []" :loading="isPending" ... />
</template>
```

---

## 4. Toast Notification System

### 4.1 Contract

A global toast composable provides consistent user feedback for mutations:

```typescript
// core/composables/useToast.ts (prescribed interface)
export function useToast() {
  function success(message: string): void {
    /* ... */
  }
  function error(message: string): void {
    /* ... */
  }
  function warning(message: string): void {
    /* ... */
  }
  function info(message: string): void {
    /* ... */
  }

  return { success, error, warning, info }
}
```

### 4.2 Rules

| Scenario                      | Toast Type | Duration                  |
| ----------------------------- | ---------- | ------------------------- |
| Mutation succeeded            | `success`  | 3 seconds, auto-dismiss   |
| Mutation failed (recoverable) | `error`    | 5 seconds, manual dismiss |
| Mutation failed (permission)  | `warning`  | 5 seconds, manual dismiss |
| Background sync info          | `info`     | 3 seconds, auto-dismiss   |

### 4.3 Anti-Patterns

- **🚫 Never show toasts for query loading.** Use skeleton states.
- **🚫 Never show success toasts for page navigations.** Only for mutations.
- **🚫 Never stack more than 3 toasts.** Older toasts are replaced.

---

## 5. Loading State Strategy

### 5.1 The Three Loading States

| State                  | Mechanism                                   | Visual                                        |
| ---------------------- | ------------------------------------------- | --------------------------------------------- |
| **Initial Load**       | `isPending === true && data === undefined`  | Full skeleton (shimmer rows in DataGrid)      |
| **Background Refetch** | `isFetching === true && data !== undefined` | Subtle top progress bar, data remains visible |
| **Mutation In-Flight** | `mutation.isPending`                        | Button disabled + spinner, form stays visible |

### 5.2 Skeleton Convention

DataGrid components handle their own skeleton state internally when `loading` is `true`. For non-grid pages, use dedicated skeleton components:

```vue
<template>
  <!-- Skeleton for initial load -->
  <div v-if="isPending" class="space-y-3 animate-pulse">
    <div class="h-4 bg-neutral-200 rounded w-3/4" />
    <div class="h-4 bg-neutral-200 rounded w-1/2" />
    <div class="h-4 bg-neutral-200 rounded w-5/6" />
  </div>

  <!-- Real content -->
  <div v-else>
    <!-- ... -->
  </div>
</template>
```

### 5.3 Rules

1. **Never show a blank white screen.** Every loading state must have a visual indicator.
2. **Never replace visible data with a spinner.** Background refetches must preserve the current view.
3. **Disable mutation buttons during in-flight requests.** Show a spinner inside the button.
4. **Use `refetchOnWindowFocus: false`** (configured globally) to prevent surprising data refreshes in ERP workflows.

---

## 6. Error Boundary Pattern

For catastrophic rendering errors (component crash, unhandled exceptions), Vue's `onErrorCaptured` hook provides a module-level boundary:

```typescript
// core/composables/useErrorBoundary.ts (prescribed interface)
export function useErrorBoundary() {
  const hasError = ref(false)
  const errorMessage = ref('')

  onErrorCaptured((err: Error) => {
    hasError.value = true
    errorMessage.value = err.message
    // Log to monitoring service
    console.error('[ErrorBoundary]', err)
    return false // Prevent propagation
  })

  return { hasError, errorMessage }
}
```

Pages can use this to show a recovery UI instead of crashing the entire application:

```vue
<template>
  <div v-if="hasError" class="flex flex-col items-center justify-center h-full gap-4">
    <p class="text-neutral-600">Something went wrong in this module.</p>
    <Button @click="() => window.location.reload()">Reload Page</Button>
  </div>
  <slot v-else />
</template>
```
