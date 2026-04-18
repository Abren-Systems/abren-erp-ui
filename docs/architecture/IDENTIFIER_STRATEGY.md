---
title: "Architectural Decision Record - Entity Identifier Strategy (ID vs UUID)"
description: "The Abren ERP strictly enforces the use of **UUIDs (v7)** for all database primary and foreign keys. This design ensures global uniqueness, simplifies distributed database replication, and introduces "
tier: frontend
tags: [frontend, architecture]
---

# Architectural Decision Record: Entity Identifier Strategy (ID vs UUID)

## 1. Context & Problem Statement

The Abren ERP strictly enforces the use of **UUIDs (v7)** for all database primary and foreign keys. This design ensures global uniqueness, simplifies distributed database replication, and introduces an inherent layer of security by mitigating Insecure Direct Object Reference (IDOR) attacks via ID enumeration.

However, UUIDs present significant UI/UX challenges:

- **Low Readability**: `f47ac10b-58cc-4372-a567-0e02b2c3d479` is impossible for a human to memorize, communicate verbally over a phone, or type manually.
- **Poor Aesthetics**: In routing, ugly UUIDs reduce the professional feel of the application (`/orders/f47ac10b...`).
- **End-User Frustration**: ERP systems heavily rely on support staff reading order numbers, invoice references, and customer numbers to one another.

---

## Related References

- [Frontend Architecture Hub](ARCHITECTURE.md)
- [Backend Data Architecture](../../../abren-api/docs/architecture/DATA_ARCHITECTURE.md)
- [Backend Reference Validation Pattern](../../../abren-api/docs/architecture/REFERENCE_VALIDATION_PATTERN.md)

---

### Document Objective

Establish an architectural standard and engineering guidelines to resolve the gap between **backend UUID enforcement** and **frontend UI/UX readability requirements**, avoiding exposing UUIDs to end users.

---

## 2. Identifier Comparison Matrix & Trade-offs

| Feature / Trait             | **Meaningful IDs** (e.g., `ORD-24-001`)            | **Semantic Slugs** (e.g., `apple-macbook-pro`) | **Database UUIDs** (e.g., `uuidv7()`)   |
| :-------------------------- | :------------------------------------------------- | :--------------------------------------------- | :-------------------------------------- |
| **Primary Use Case**        | Transactional & Operational entities               | Catalog, Public-facing, or Content entities    | System internals, API Data passing      |
| **Examples**                | Invoices, Orders, Employee ID, POs                 | Products, Categories, Brands, Pages            | Internal DB PKs/FKs, Logs, Audits       |
| **UX / Readability**        | **Excellent** – Easy to read and communicate       | **Excellent** – Predictable context            | **Poor** – Impossible for humans        |
| **URL Routing**             | **Excellent** (`/ap/vendor_bills/INV-001`)         | **Excellent** (`/products/macbook-pro`)        | **Poor** (`.../f47ac10b-58cc...`)       |
| **Security / URL Guessing** | Vulnerable to enumeration (if strictly sequential) | Moderate enumeration risk                      | **Highly Secure** (Zero predictability) |
| **Database Collision Risk** | High (Requires DB locks, serial sequences)         | High (Requires suffix appending algorithms)    | **Zero**                                |
| **SEO Value**               | Minimal                                            | **High**                                       | Zero                                    |

### 2.1 Enterprise Industry Benchmarks

How Tier-1 ERPs handle the UUID vs Meaningful ID dichotomy:

- **Microsoft Dynamics 365**: Uses a `GUID` as the immutable primary key in the Dataverse. They provide an "Auto-Numbering" feature that generates human-readable IDs (like `TicketNumber`, e.g., `CAS-01234`). Their API allows lookup via the UUID _or_ an Alternate Key: `GET /api/v9.0/incidents(ticketnumber='CAS-01234')`.
- **Oracle NetSuite**: Every record has an `internalid` (immutable PK). In the UI and printed forms, they expose a `tranid` (Transaction ID, e.g., `INV10023`) or `entityid`. Users and external integrations search using the `tranid`, while background relationships use the `internalid`.
- **SAP S/4HANA**: While old SAP architectures used alphanumeric semantic keys (e.g. `MATNR`), modern SAP Cloud and Fiori UI architectures rely on surrogate UUIDs for OData integration/replication, paired with separate semantic Application Object IDs for display.

Our strategy strictly mirrors **Microsoft Dynamics 365's Alternate Key methodology** — utilizing absolute internal UUIDs for structural integrity while resolving human-readable routing parameters seamlessly at the edge.

---

## 3. Exposure Guidelines

| Strategy Layer        | Standard Operating Procedure                                                                                                                                                       |
| :-------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **URLs & Routing**    | Paths **must** rely on Meaningful IDs or Slugs. Example: Use `/procurement/orders/PO-1024`, never `/procurement/orders/123e4567...`                                                |
| **API Endpoints**     | Endpoints should ideally accept both. The best practice is `GET /api/v1/orders/{identifier}` where the backend detects whether the param is a UUID (length 36) or a string/Slug.   |
| **Forms (Relations)** | Comboboxes and Select options must **display** the human identifier or Name but **bind** the UUID to the internal form model to send to the backend via POST/PUT.                  |
| **State (Pinia)**     | The normalized Pinia state dict must be keyed by the UUID to prevent any edge-case collisions, supplemented with a secondary indexing map (e.g., mapping `PO-1024` -> `UUID-XYZ`). |

---

## 4. Frontend Architectural Impact

### 4.1 Routing & Route Resolution

To successfully utilize Meaningful IDs in the URL while fetching data that relies on UUIDs, components must map the URL param back to a domain object. We utilize a **Resolver Pattern**.

Instead of passing the UUID in the router:

```typescript
// BAD: Unreadable
router.push({ name: 'InvoiceDetails', params: { id: invoice.id } })

// GOOD: Readable
router.push({ name: 'InvoiceDetails', params: { reference: invoice.referenceNumber } })
```

### 4.2 State Management (Pinia)

Store implementation requires dual indexing. The primary source of truth is always the UUID dictionary to guarantee uniqueness and streamline API PATCH requests.

```typescript
// stores/useInvoiceStore.ts
export const useInvoiceStore = defineStore('invoices', () => {
  // Primary index driven by UUID
  const entities = ref<Record<string, Invoice>>({})

  // Secondary lookup mapping Reference ID -> UUID
  const indexByRefNumber = computed(() => {
    return Object.values(entities.value).reduce(
      (acc, invoice) => {
        acc[invoice.referenceNumber] = invoice.id
        return acc
      },
      {} as Record<string, string>,
    )
  })

  return { entities, indexByRefNumber }
})
```

---

## 5. Vue Implementation Examples

Here is a robust implementation demonstrating **ID-to-UUID resolution, loading states, and error boundary handling on invalid IDs**.

### Composable: ID Resolver

```typescript
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import api from '@/core/api'

/**
 * Resolves a human-readable display ID (or Slug) to its full Entity via backend.
 */
export function useEntityResolver<T>(endpoint: string, displayId: string) {
  const router = useRouter()

  const {
    data: entity,
    isLoading,
    isError,
    error,
  } = useQuery<T>({
    queryKey: [endpoint, displayId],
    queryFn: async () => {
      // Note: The API must support finding by displayId
      const response = await api.get(`/${endpoint}/resolve/${displayId}`)
      return response.data.data
    },
    retry: false, // Fail fast if ID is invalid
  })

  // Derived state for routing/error boundaries
  const showNotFound = computed(() => isError.value && error.value?.response?.status === 404)

  return { entity, isLoading, isError, showNotFound }
}
```

### Vue Component: Entity Details View

```vue
<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useEntityResolver } from '@/composables/useEntityResolver'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import NotFoundBoundary from '@/components/error/NotFoundBoundary.vue'
import InvoiceDisplay from './InvoiceDisplay.vue'

const route = useRoute()
const referenceNumber = route.params.reference as string

const { entity: invoice, isLoading, showNotFound } = useEntityResolver('invoices', referenceNumber)
</script>

<template>
  <div class="invoice-details-page">
    <!-- 1. Resolution Loading State -->
    <template v-if="isLoading">
      <SkeletonLoader type="page-header" />
      <SkeletonLoader type="details-grid" />
    </template>

    <!-- 2. Error Boundary for Invalid Identifier -->
    <template v-else-if="showNotFound">
      <NotFoundBoundary
        title="Invoice Not Found"
        :message="`We could not find an invoice with reference ${referenceNumber}`"
        action-text="Return to Accounts Payable"
        action-route="/finance/ap/invoices"
      />
    </template>

    <!-- 3. Success State - Data Successfully Hydrated by UUID/DisplayID -->
    <template v-else-if="invoice">
      <InvoiceDisplay :invoice="invoice" />
    </template>
  </div>
</template>
```

---

## 6. Form Handling & Data Synchronization

When a user selects an entity (e.g., A Supplier for a Purchase Order), the dropdown naturally exposes the `Name` or `Meaningful ID` to the user, but the Vue model binding must capture the `UUID` to comply with the backend contract.

```vue
<script setup lang="ts">
import { ref } from 'vue'

// The form payload relies strictly on UUIDs for foreign keys
const purchaseOrderForm = ref({
  supplier_id: null, // UUID expected here
  expected_delivery: '',
})

// Dropdown options populate locally, storing UUID as the value
const suppliers = ref([
  { id: '1111-2222-3333-4444', name: 'Global Tech Supplies', displayId: 'SUP-001' },
  { id: '5555-6666-7777-8888', name: 'Office Depot', displayId: 'SUP-002' },
])
</script>

<template>
  <!-- UI shows supplier Name/ID, but binds UUID to the form transparently -->
  <CustomSelect
    v-model="purchaseOrderForm.supplier_id"
    :options="suppliers"
    option-label="name"
    option-value="id"
  />
</template>
```

---

## 7. Quality Assurance & Testing Protocols

To prevent regressions, the following testing protocols must be implemented for Identifier Strategy evaluation:

### 7.1 Data Integrity Matrix (Unit Tests)

- **Pinia Normalization**: Assert that inserting `Invoice { id: 'UUID-1', reference: 'INV-1' }` properly indexes under both the UUID main map and the secondary reference map.
- **Cache Persistence**: Ensure the mapping index updates correctly when an optimistic update temporarily leverages a client-side generic ID before receiving the server-side generated Display ID.

### 7.2 Session & Deep Link Tests (E2E / Cypress)

- **Deep Linking**: Directly navigate to a Display ID URL (`/invoices/INV-5092`) bypassing the grid. Verify the `resolve` endpoint successfully fetches the UUID-based entity and hydrates the forms.
- **Browser Refresh Resilience**: Assert that performing a hard refresh on `/invoices/INV-5092` does not crash due to missing UUID context mapping in transient Vuex/Pinia state.
- **Cache Invalidations**: Verify if switching from `INV-001` to `INV-002` appropriately triggers reactivity, overriding older UUID data in the primary detail view instead of displaying stale data.
