# Frontend Testing Strategy

> **Parent:** [Frontend Architecture](ARCHITECTURE.md)
> **Backend Companion:** [Backend Testing Strategy](../../../abren-api/docs/architecture/TESTING_STRATEGY.md)

---

## 1. Testing Pyramid

```
          ┌─────────┐
          │  E2E    │  Playwright — Critical user journeys
          │ (few)   │  ← Expensive, slow, but highest confidence
         ┌┴─────────┴┐
         │Integration │  Vitest + MSW — Module workflows
         │ (moderate) │  ← Store + API + Component together
        ┌┴────────────┴┐
        │  Component    │  Vitest + Vue Test Utils
        │  (many)       │  ← Individual component behavior
       ┌┴───────────────┴┐
       │  Unit            │  Vitest — Mappers, VOs, Composables
       │  (most)          │  ← Fastest, cheapest, most valuable
       └──────────────────┘
```

---

## 2. Layer Breakdown

| Layer             | Type        | What to Test                                 | Tool                    | Coverage Target      |
| ----------------- | ----------- | -------------------------------------------- | ----------------------- | -------------------- |
| **Mappers**       | Unit        | DTO ↔ Model transformation (The Firewall)    | Vitest                  | **100% (MANDATORY)** |
| **Grid Configs**  | Unit        | Column definitions, formatting logic         | Vitest                  | **100%**             |
| **Composables**   | Unit        | Application orchestration (Side-effects)     | Vitest + Vue Test Utils | **90%+**             |
| **Components**    | Component   | Render output, user interactions (Tier 1-3)  | Vitest + Vue Test Utils | **80%+**             |
| **Feature Pages** | Integration | Full flow: API (MSW) → Composable → Grid     | Vitest + MSW            | Key workflows        |
| **User Journeys** | E2E         | Login → Navigate → Create → Submit → Approve | Playwright              | Critical paths       |

---

## 3. Unit Tests

### 3.1 Mapper Tests (The Integrity Firewall)

Mappers are the most critical unit tests. They ensure that backend changes to DTOs are caught immediately before they reach the UI. **100% branch and statement coverage is mandatory.**

```typescript
// modules/business/finance/ap/payment-requests/infrastructure/__tests__/payment-request.mapper.test.ts
import { describe, it, expect } from 'vitest'
import { toViewModel, toDTO } from '../payment_request.mapper'
import type { PaymentRequestDTO } from '../api.types'

describe('PaymentRequest Mapper (Factory)', () => {
  const baseDTO: PaymentRequestDTO = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    beneficiary_name: 'Acme Corp',
    amount: 15000.5,
    currency: 'ETB',
    status: 'DRAFT',
    bank_account_id: null,
    submitted_at: null,
    paid_at: null,
    current_approval_step: 0,
    assigned_approver_id: null,
  }

  it('maps DTO to ViewModel (toViewModel)', () => {
    const vm = toViewModel(baseDTO)
    expect(vm.beneficiary).toBe('Acme Corp')
    expect(vm.amount.amount).toBe(15000.5)
    expect(vm.canSubmit).toBe(true)
  })

  it('maps Form Values to DTO (toDTO)', () => {
    const formValues = { beneficiaryName: 'New Corp', amount: 500 }
    const dto = toDTO(formValues)
    expect(dto.beneficiary_name).toBe('New Corp')
    expect(dto.amount).toBe(500)
  })

  it('handles edge cases (e.g. null dates)', () => {
    const vm = toViewModel(baseDTO)
    expect(vm.submittedAt).toBeNull()
  })
})
```

### 3.2 Value Object Tests

```typescript
// core/domain/__tests__/money.test.ts
import { describe, it, expect } from 'vitest'
import { Money, Currency } from '../money'

describe('Money (Value Object)', () => {
  it('adds same-currency amounts', () => {
    const a = Money.from(100, Currency.ETB)
    const b = Money.from(50.25, Currency.ETB)
    expect(a.add(b).amount).toBe(150.25)
  })

  it('throws on cross-currency addition', () => {
    const etb = Money.from(100, Currency.ETB)
    const usd = Money.from(50, Currency.USD)
    expect(() => etb.add(usd)).toThrow()
  })
})
```

### 3.3 Composable Tests (Application Side-Effects)

Testing a Composable (UI Facade) requires asserting that the correct **Side Effects** were triggered.

```typescript
// modules/business/finance/ap/payment-requests/application/composables/__tests__/usePayRequest.test.ts
import { describe, it, expect, vi } from 'vitest'
import { usePayRequest } from '../usePayRequest'

describe('usePayRequest (Application Facade)', () => {
  it('triggers toast and cache invalidation on success', async () => {
    const { payRequest } = usePayRequest()
    const toast = useToast() // mocked
    const queryClient = useQueryClient() // mocked

    await payRequest('123', { amount: 500 })

    // Verify Side Effects
    expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('Success'))
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['payment-requests'],
    })
  })
})
```

### 3.4 Grid Configuration Tests (UI Layer)

Tests that the column definitions have correct formatters and alignment.

```typescript
// modules/business/finance/ledger/ui/grids/__tests__/account.grid.test.ts
import { describe, it, expect } from 'vitest'
import { accountColumns } from '../account.grid'

describe('Account Grid Configuration', () => {
  it('defines the Code column with correct alignment', () => {
    const col = accountColumns.find((c) => c.id === 'code')
    expect(col.meta?.align).toBe('left')
  })

  it('assigns the Currency formatter to the balance column', () => {
    // ... verify formatter logic
  })
})
```

---

## 4. Integration Tests (with MSW)

Use [Mock Service Worker](https://mswjs.io/) to intercept HTTP requests and return realistic backend responses without a running server.

```typescript
// tests/integration/payment-request-flow.test.ts
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

const server = setupServer(
  http.get('/api/v1/payment-requests', () => {
    return HttpResponse.json({
      success: true,
      data: [
        { id: '1', beneficiary_name: 'Supplier A', status: 'DRAFT', ... }
      ],
    })
  }),

  http.post('/api/v1/payment-requests/:id/submit', () => {
    return HttpResponse.json({
      success: true,
      data: { id: '1', status: 'SUBMITTED', ... },
    })
  }),
)

beforeAll(() => server.listen())
afterAll(() => server.close())
afterEach(() => server.resetHandlers())

describe('Payment Request Flow', () => {
  it('loads requests and renders them in the table', async () => {
    // Mount page component, assert table renders DTO data via mapper
  })

  it('submits a draft request and updates the UI', async () => {
    // Click submit, verify store state changes, verify button disabled
  })
})
```

---

## 5. E2E Tests (Playwright)

E2E tests cover **critical business paths** only. They run against the actual backend.

### 5.1 Critical Paths to Cover

| Journey                       | Steps                                                 |
| ----------------------------- | ----------------------------------------------------- |
| **Authentication**            | Login → Dashboard → Logout                            |
| **Payment Request Lifecycle** | Create PR → Submit → Approve → Pay                    |
| **Journal Entry Posting**     | Create Entry → Add Lines → Post → Verify balance      |
| **Feature Gate**              | Login as tenant without module → Verify route blocked |

### 5.2 Example

```typescript
// tests/e2e/payment-request-lifecycle.spec.ts
import { test, expect } from '@playwright/test'

test('complete payment request lifecycle', async ({ page }) => {
  // Login
  await page.goto('/login')
  await page.fill('[data-testid="email"]', 'finance@acme.com')
  await page.fill('[data-testid="password"]', 'test123')
  await page.click('[data-testid="login-button"]')
  await expect(page).toHaveURL('/app/dashboard')

  // Create request
  await page.click('[data-testid="nav-payment-requests"]')
  await page.click('[data-testid="create-request"]')
  await page.fill('[data-testid="beneficiary"]', 'Supplier XYZ')
  await page.fill('[data-testid="amount"]', '50000')
  await page.click('[data-testid="save-draft"]')
  await expect(page.locator('[data-testid="status-badge"]')).toHaveText('Draft')

  // Submit for approval
  await page.click('[data-testid="submit-button"]')
  await expect(page.locator('[data-testid="status-badge"]')).toHaveText('Submitted')
})
```

---

## 6. Testing Conventions

### 6.1 File Location

- **Unit tests**: Co-located in `__tests__/` subdirectory within the module
- **Integration tests**: `tests/integration/`
- **E2E tests**: `tests/e2e/`

### 6.2 Naming

- Unit: `{file-under-test}.test.ts`
- Integration: `{module}-{flow}.test.ts`
- E2E: `{journey-name}.spec.ts`

### 6.3 Test IDs

All interactive elements must have unique `data-testid` attributes for E2E stability:

```html
<button data-testid="submit-request-button">Submit</button>
```
