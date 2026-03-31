# Shared Kernel (`src/shared/`)

> **Architectural Boundary:** This folder contains the purely technical infrastructure and presentation primitives of the Abren ERP frontend.

## The Leaf Node Rule 🍃

The Shared Kernel is the base layer of the application. To prevent it from becoming a tangled "big ball of mud", it must strictly adhere to the Leaf Node Rule:

**Code in `src/shared/` must NEVER import anything from `src/modules/`.**

The dependency graph must always flow in one direction:
`Module` ➔ `Module` (via Event Bus only)
`Module` ➔ `Shared`
~~`Shared` ➔ `Module`~~ (BANNED)

## What belongs here?

- **Technical Infrastructure:** `api/` (HTTP Client), `auth/` (Stores/Session), `event-bus/`
- **Domain Primitives:** Application-wide value objects like `Money`
- **Base Components:** Reusable, dumb UI components (Tables, Buttons, Inputs, Layouts) in `components/`
- **Utilities:** Global helper functions (e.g., date formats, currency formatters)

## What does NOT belong here?

- **Business Domain Logic:** No logic specific to Ledger, Accounts Payable, Tenants, etc.
- **Feature-Specific Types:** Do not put `VendorBill` interfaces here. They belong in their respective module's `domain/` folder.
- **Module Orchestration:** Do not place feature-level state management or route guards here, unless they universally govern platform access (e.g., Authentication).
