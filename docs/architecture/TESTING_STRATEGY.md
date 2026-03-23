# Frontend Testing Strategy

> **Parent:** [Frontend Architecture](ARCHITECTURE.md)
> **Backend Companion:** [Backend Testing Strategy](../../../abren-erp-api/docs/architecture/TESTING_STRATEGY.md)

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

| Layer             | Type        | What to Test                                    | Tool                    | Coverage Target |
| ----------------- | ----------- | ----------------------------------------------- | ----------------------- | --------------- |
| **Mappers**       | Unit        | DTO → Entity transformation correctness         | Vitest                  | **100%**        |
| **Grid Configs**  | Unit        | Column definitions, formatting logic            | Vitest                  | **100%**        |
| **Composables**   | Unit        | Application orchestration, Query state          | Vitest + Vue Test Utils | **90%+**        |
| **Components**    | Component   | Render output, user interactions (Tier 1-3)     | Vitest + Vue Test Utils | **80%+**        |
| **Feature Pages** | Integration | Full flow: API (MSW) → Composable → Grid        | Vitest + MSW            | Key workflows   |
| **User Journeys** | E2E         | Login → Navigate → Create → Submit → Approve    | Playwright              | Critical paths  |

---

## 3. Unit Tests

### 3.1 Mapper Tests (Highest Priority)

Mappers are pure functions — they're the cheapest, fastest, and most impactful tests.

```typescript
// modules/business/finance/ap/payment-requests/domain/mappers/__tests__/payment-request.mapper.test.ts
import { describe, it, expect } from "vitest";
import { toEntity } from "../payment-request.mapper";
import type { PaymentRequestDTO } from "../../infrastructure/api.types";

describe("PaymentRequest Mapper", () => {
  const baseDTO: PaymentRequestDTO = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    beneficiary_name: "Acme Corp",
    amount: 15000.5,
    currency: "ETB",
    status: "DRAFT",
    bank_account_id: null,
    submitted_at: null,
    paid_at: null,
    current_approval_step: 0,
    assigned_approver_id: null,
  };

  it("maps beneficiary_name to beneficiary", () => {
    const vm = toViewModel(baseDTO);
    expect(vm.beneficiary).toBe("Acme Corp");
  });

  it("converts amount to Money value object", () => {
    const vm = toViewModel(baseDTO);
    expect(vm.amount.format()).toContain("15,000.50");
  });

  it("derives canSubmit from DRAFT status", () => {
    const vm = toViewModel(baseDTO);
    expect(vm.canSubmit).toBe(true);
    expect(vm.canApprove).toBe(false);
  });

  it("derives canApprove from SUBMITTED status", () => {
    const vm = toViewModel({ ...baseDTO, status: "SUBMITTED" });
    expect(vm.canSubmit).toBe(false);
    expect(vm.canApprove).toBe(true);
  });

  it("formats submitted_at date when present", () => {
    const vm = toViewModel({
      ...baseDTO,
      submitted_at: "2026-03-20T15:30:00Z",
    });
    expect(vm.submittedAt).toBeTruthy();
  });

  it("leaves submittedAt null when not submitted", () => {
    const vm = toViewModel(baseDTO);
    expect(vm.submittedAt).toBeNull();
  });
});
```

### 3.2 Value Object Tests

```typescript
// core/domain/__tests__/money.test.ts
import { describe, it, expect } from "vitest";
import { Money, Currency } from "../money";

describe("Money", () => {
  it("adds same-currency amounts", () => {
    const a = Money.from(100, Currency.ETB);
    const b = Money.from(50.25, Currency.ETB);
    expect(a.add(b).amount).toBe(150.25);
  });

  it("throws when adding different currencies", () => {
    const etb = Money.from(100, Currency.ETB);
    const usd = Money.from(50, Currency.USD);
    expect(() => etb.add(usd)).toThrow("different currencies");
  });

  it("formats in locale", () => {
    const m = Money.from(1234.56, Currency.ETB);
    expect(m.format("en-US")).toContain("1,234.56");
  });
});
```

### 3.3 Composable Tests (Application Orchestration)

Composables should be tested by mocking the Infrastructure layer (API calls) and asserting on the returned reactive states from TanStack Query.

```typescript
// modules/business/finance/ap/payment-requests/application/composables/__tests__/useSubmitRequest.test.ts
import { describe, it, expect, vi } from "vitest";
import { useSubmitRequest } from "../useSubmitRequest";

describe("useSubmitRequest", () => {
  it("transitions to success state after API call", async () => {
    // ... test Query status (isPending -> isSuccess)
  });
});
```

### 3.4 Grid Configuration Tests (UI Layer)

Tests that the column definitions have correct formatters and alignment.

```typescript
// modules/business/finance/ledger/ui/grids/__tests__/account.grid.test.ts
import { describe, it, expect } from "vitest";
import { accountColumns } from "../account.grid";

describe("Account Grid Configuration", () => {
  it("defines the Code column with correct alignment", () => {
    const col = accountColumns.find(c => c.id === 'code');
    expect(col.meta?.align).toBe('left');
  });

  it("assigns the Currency formatter to the balance column", () => {
    // ... verify formatter logic
  });
});
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
import { test, expect } from "@playwright/test";

test("complete payment request lifecycle", async ({ page }) => {
  // Login
  await page.goto("/login");
  await page.fill('[data-testid="email"]', "finance@acme.com");
  await page.fill('[data-testid="password"]', "test123");
  await page.click('[data-testid="login-button"]');
  await expect(page).toHaveURL("/app/dashboard");

  // Create request
  await page.click('[data-testid="nav-payment-requests"]');
  await page.click('[data-testid="create-request"]');
  await page.fill('[data-testid="beneficiary"]', "Supplier XYZ");
  await page.fill('[data-testid="amount"]', "50000");
  await page.click('[data-testid="save-draft"]');
  await expect(page.locator('[data-testid="status-badge"]')).toHaveText("Draft");

  // Submit for approval
  await page.click('[data-testid="submit-button"]');
  await expect(page.locator('[data-testid="status-badge"]')).toHaveText("Submitted");
});
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
