---
title: 'Abren ERP UI — Naming Standard'
description: 'The authoritative naming standard for all folders, files, Vue components, and TypeScript identifiers in the Abren ERP frontend.'
tier: frontend
tags: [frontend, architecture, naming, standards]
---

# Abren ERP UI — Naming Standard

> **Status:** ✅ APPROVED — Ratified May 2026
> **Authority:** All rules in this document are non-negotiable. Deviations require an explicit ADR.
> **Companion:** [Architecture Blueprint](./ARCHITECTURE.md)

---

## Guiding Principles

1. **Entity before action.** A name must first identify the domain noun it belongs to.
2. **Role defines behavior.** The suffix communicates how the component behaves.
3. **Layer signals ownership.** The layer name (`domain/`, `application/`, `infrastructure/`, `ui/`) is the authoritative container. Sub-folders inside a layer must not duplicate that signal.
4. **Consistency over cleverness.** If a pattern exists, extend it — never invent a new one for a single case.
5. **Entity-first for discoverability.** Files are grouped by entity, not by action. In a codebase with 100+ screens, entity-first is the only naming that scales.
6. **`App*` means visible to the user.** The prefix is reserved for shared design-system UI primitives. It is never applied to composables, domain types, schemas, runtime objects, or domain selectors.
7. **File name provides context. Don't repeat it inside.** If the file is `account.types.ts`, the type inside is `Account`, not `AccountType` or `AccountData`.

---

## 1. Folder Naming

### 1.1 Module Root Structure

```
src/modules/{domain-group}/{module}/
├── domain/
├── application/          ← FLAT. No subfolders. Ever.
├── infrastructure/
│   └── __tests__/
└── ui/
    └── {ScreenID}/       ← e.g. AP301000, AP3010PL
        ├── grids/
        └── sidepanels/   ← SidePane content templates (not components)
```

**Rules:**

- All folder names: `kebab-case`
- `application/` is always flat — composables live directly here, never in subfolders
- **Module size pressure rule:** If `application/` approaches 30 files, the module must be split by domain boundary — not by adding subfolders. Adding `actions/`, `bulk/`, `queries/` etc. is file-type-first architecture in disguise and is prohibited.
- `ui/` contains only `{ScreenID}/` folders — no `pages/`, `components/`, or `grids/` at this level
- Screen IDs are the only UPPERCASE names in the entire folder tree
- `sidepanels/` contains content templates rendered inside `AppSidePane` — not standalone components

### 1.2 Shared Kernel Structure

```
src/shared/
├── api/            ← HTTP client, envelope types, generated types
├── auth/           ← Auth store, guards, tokens
├── composables/    ← Cross-cutting composables
├── domain/         ← Money, BusinessDate, branded types
├── event-bus/      ← Typed event bus
├── types/          ← Module contracts, shared type definitions
├── ui/             ← TARGET: Abren-owned design system (App* + DataGrid*)
│   └── finance/    ← Cross-module domain selectors (e.g. LedgerAccountSelector)
├── components/     ← COMPAT: Migration compatibility layer only
└── utils/          ← Pure utility functions (barrel exported)
```

**Rules:**

- `shared/lib/` does not exist — contents belong in `shared/utils/`
- `shared/ui/` is the eventual home for all Abren-owned components
- `shared/components/` is compatibility-only — no new components are added here
- `shared/ui/finance/` is the designated home for **cross-module domain selectors** — components that are domain-specific but used by multiple modules

---

## 2. TypeScript File Naming

### 2.1 General Rules

- All `.ts` files: `kebab-case`
- Namespaced qualifiers use dot-separation (e.g. `api.types.ts`, `api.schemas.ts`)
- **Maximum one dot qualifier before the extension.** `payment-request.types.ts` ✅ — `payment-request.api.types.ts` ❌. If multiple qualifiers seem necessary, restructure the file instead.

### 2.2 File Type → Name Mapping

| File type                                | Pattern                 | Example                                        |
| ---------------------------------------- | ----------------------- | ---------------------------------------------- |
| Domain types (single entity)             | `{entity}.types.ts`     | `account.types.ts`, `payment-request.types.ts` |
| Domain types (whole module, single file) | `{module}.types.ts`     | `ap.types.ts`, `tax.types.ts`                  |
| Infrastructure adapter                   | `{module}.adapter.ts`   | `ledger.adapter.ts`, `ap.adapter.ts`           |
| API DTO types                            | `api.types.ts`          | (consistent across all modules)                |
| API Zod schemas                          | `api.schemas.ts`        | (consistent across all modules)                |
| Mappers                                  | `mappers.ts`            | (consistent across all modules)                |
| Query keys                               | `query-keys.ts`         | (one per module, flat in `application/`)       |
| Grid definitions                         | `{entity}.grid.ts`      | `account.grid.ts`, `payment-request.grid.ts`   |
| Formatter                                | `{entity}.formatter.ts` | `account.formatter.ts`                         |
| Module barrel                            | `index.ts`              | (module root)                                  |
| Screen barrel                            | `index.ts`              | (inside `{ScreenID}/`)                         |
| Screen definition                        | `screen.ts`             | (inside `{ScreenID}/`)                         |
| Screen controller                        | `controller.ts`         | (inside `{ScreenID}/`)                         |
| Field definitions                        | `fields.ts`             | (inside `{ScreenID}/`)                         |
| Command definitions                      | `commands.ts`           | (inside `{ScreenID}/`)                         |
| Screen registry                          | `screens.ts`            | (module root)                                  |
| Workspace entries                        | `workspace.ts`          | (module root — replaces `menu.ts`)             |
| Router bindings                          | `routes.ts`             | (module root, transitional)                    |

### 2.3 Composable Naming

Pattern: `use{Entity/Entities}[Action].ts`

| Composable type    | Pattern                     | Example                                                     |
| ------------------ | --------------------------- | ----------------------------------------------------------- |
| Read (list)        | `use{Entities}.ts`          | `usePaymentRequests.ts`, `useLedgerAccounts.ts`             |
| Read (single)      | `use{Entity}.ts`            | `usePaymentRequest.ts`                                      |
| Mutation           | `use{Action}{Entity}.ts`    | `useCreatePaymentRequest.ts`, `useApprovePaymentRequest.ts` |
| Bulk actions       | `useBulk{Entity}Actions.ts` | `useBulkPaymentRequestActions.ts`                           |
| Stats / aggregates | `use{Entity}Stats.ts`       | `usePaymentRequestStats.ts`                                 |

### 2.4 Prohibited Patterns

| ❌ Banned                  | ✅ Correct            | Reason                                                         |
| -------------------------- | --------------------- | -------------------------------------------------------------- |
| `keys.ts`                  | `query-keys.ts`       | Descriptive — intent is clear                                  |
| `types.ts` (no prefix)     | `{entity}.types.ts`   | Non-discoverable without prefix                                |
| `menu.ts`                  | `workspace.ts`        | Aligns with architecture vocabulary                            |
| `{module}_adapter.ts`      | `{module}.adapter.ts` | Consistent with dot-namespace pattern                          |
| `application/composables/` | flat `application/`   | Layer must be flat                                             |
| Multiple dot qualifiers    | one qualifier max     | `payment-request.types.ts`, not `payment-request.api.types.ts` |

---

## 3. Vue Component Naming

### 3.1 General Rule

All `.vue` files: `PascalCase`. No exceptions. No dots, no hyphens, no lowercase characters in Vue filenames.

### 3.2 The `App*` Prefix — Scope and Boundary

`App*` is reserved for **shared design-system components that are directly visible to the user**. It communicates layer membership within the design system — distinguishing `AppField.vue` from a feature component like `PaymentRequestFilterPane.vue`.

**`App*` is applied to:**

- Design system primitives: `AppButton`, `AppInput`, `AppBadge`, `AppDialog`, `AppSelect`, `AppCheckbox`, `AppTextarea`, `AppSidePane`
- Field system: `AppField`, `AppFieldset`, `AppTabs`

**`App*` is never applied to:**

- Composables, domain types, schemas, or runtime objects
- Domain selectors (`LedgerAccountSelector` — no `App*` prefix)
- Module-level feature components

### 3.3 The `DataGrid*` Platform — An Intentional Separate Brand

`DataGrid*` is not an `App*` component. The DataGrid is a complete subsystem — a platform, not a primitive. It carries its own namespace by design.

| Namespace   | Tier                     | Examples                                                                             |
| ----------- | ------------------------ | ------------------------------------------------------------------------------------ |
| `App*`      | Design system primitives | `AppButton`, `AppField`, `AppSidePane`                                               |
| `DataGrid*` | Grid platform            | `DataGrid`, `DataGridToolbar`, `DataGridEmpty`, `DataGridSkeleton`, `DataGridFooter` |
| `Screen*`   | Screen chrome            | `ScreenTitleBar`, `ScreenToolbar`                                                    |

**Rule:** Do not unify `DataGrid*` under `App*`. The distinction is intentional and must be preserved.

### 3.4 Internal Reka/Headless Wrappers

Raw vendor wrappers (`Card`, `Dialog`, `Sheet`, `Table`, `Label`) retain unprefixed names. They are **internal building blocks** — never imported directly by business modules. All business module code uses `App*` components only.

### 3.5 Cross-Module Domain Selectors (`shared/ui/finance/`)

Domain-specific selectors shared across multiple modules live in `shared/ui/finance/`. They do **not** carry the `App*` prefix — they are domain components, not design system primitives. They follow entity-first naming.

```
shared/ui/finance/
└── LedgerAccountSelector.vue
```

### 3.6 Components in Business Modules

**Rule: `{Entity}{Qualifier?}{Action?}{Role}.vue` — Entity-first, always.**

Where:

- **Entity:** required (e.g., `PaymentRequest`)
- **Qualifier:** optional, for disambiguation (e.g., `Batch`)
- **Action:** required for action components (e.g., `Release`)
- **Role:** required, from the closed vocabulary (e.g., `Dialog`)

Grouping files by entity enables instant discovery of everything related to a domain noun (`PaymentRequest*`) without folder hierarchies.

#### Qualifiers

Qualifiers refine the entity when multiple sub-entities exist or the action targets a specific aspect.
Examples:

- `PaymentBatchReleaseDialog.vue`
- `UserPermissionUpdateDrawer.vue`

Qualifiers must be:

- Singular
- Domain-specific
- Placed exactly between the Entity and the Action

#### Closed Action Vocabulary

All action terms used in component naming MUST come from this list. No synonyms are allowed (e.g., use `DELETE`, not `REMOVE`).

- `CREATE`
- `UPDATE`
- `DELETE`
- `APPROVE`
- `REJECT`
- `RELEASE`
- `POST`
- `VOID`
- `CANCEL`
- `ASSIGN`
- `INVITE`

#### Closed Role Vocabulary

Role suffixes are **behavioral contracts**, not just visual indicators.

| Role suffix      | Semantic Rule / When to use                                         | Example                          |
| ---------------- | ------------------------------------------------------------------- | -------------------------------- |
| `Drawer.vue`     | **Non-blocking.** Used for create/edit forms. Extended interaction. | `AccountCreateDrawer.vue`        |
| `Dialog.vue`     | **Blocking.** Irreversible action, confirmation. NEVER for editing. | `PaymentRequestRejectDialog.vue` |
| `FilterPane.vue` | Docked filter side panel                                            | `PaymentRequestFilterPane.vue`   |
| `ActionBar.vue`  | Floating bulk action toolbar                                        | `PaymentRequestActionBar.vue`    |
| `Timeline.vue`   | Chronological event list                                            | `PaymentRequestTimeline.vue`     |
| `Badge.vue`      | Inline status/type display                                          | `PaymentRequestBadge.vue`        |
| `ListPage.vue`   | **Transitional only.** MUST NOT be used in new screens.             | `PaymentRequestListPage.vue`     |
| `Focus.vue`      | **Transitional only.** MUST NOT be used in new screens.             | `VendorBillFocus.vue`            |

> **`view.vue`** — Reserved exclusively for Screen ID folders. Never entity-prefixed.

#### Internal Sub-components

When a component requires extraction of sub-parts, extract as **named sibling files** using entity-first naming — not nested folders.

```
PaymentRequestFilterPane.vue
PaymentRequestFilterSection.vue   ← sibling, not subfolder
PaymentRequestFilterItem.vue      ← sibling, not subfolder
```

**Exception — Feature Folders:** A component folder is justified only when ALL three conditions are met: (1) 5+ sub-parts, (2) local composables or types, (3) reused across multiple screens. In that case it is a _feature_, not a component:

```
PaymentRequestWizard/
  PaymentRequestWizard.vue
  steps/
  composables/
  types.ts
```

This exception is rare. When in doubt, use siblings.

### 3.7 The SidePane Pattern

**`AppSidePane`** is the single docked side panel primitive. `AppSidePanel` does not exist.

`AppSidePane` is contextual to the working area of a screen. Its content is tab-driven via templates in `{ScreenID}/sidepanels/`:

```
AppSidePane (docked, contextual to working area)
  └── Tab: "Audit"       → sidepanels/audit.vue
  └── Tab: "Files"       → sidepanels/files.vue
  └── Tab: "Activity"    → sidepanels/activity.vue
```

**SidePane Content Rule:**
These templates are content slots — not standalone components. There is no `Trace*`, no `Drawer*` suffix. Audit/trace functionality is a content tab, not a component type.
All contextual side-pane content MUST live in `{ScreenID}/sidepanels/*.vue`. No entity-prefixed SidePane components (e.g., `PaymentRequestAuditSidePane.vue`) are allowed.

### 3.8 Prohibited Patterns

| ❌ Banned                                | ✅ Correct                            |
| ---------------------------------------- | ------------------------------------- |
| `CreateAccountDrawer.vue` (action-first) | `AccountCreateDrawer.vue`             |
| `InviteUserDialog.vue` (action-first)    | `UserInviteDialog.vue`                |
| `CreateRoleDialog.vue` (action-first)    | `RoleCreateDialog.vue`                |
| `RejectModal.vue` (`Modal` suffix)       | `PaymentRequestRejectDialog.vue`      |
| `filters.panel.vue` (dots + lowercase)   | `FilterPane.vue`                      |
| `bulk-actions.vue` (lowercase + hyphens) | `BulkActionBar.vue`                   |
| `TraceSidePane.vue` / `TraceDrawer.vue`  | content tab in `sidepanels/audit.vue` |
| `AppSidePanel.vue`                       | `AppSidePane.vue`                     |
| `SelectLedgerAccount.vue`                | `LedgerAccountSelector.vue`           |
| `App*` on non-design-system components   | never                                 |

---

## 4. TypeScript Identifier Naming

| Identifier                 | Convention                   | Example                           |
| -------------------------- | ---------------------------- | --------------------------------- |
| Domain entity interface    | `PascalCase`                 | `PaymentRequest`, `LedgerAccount` |
| Branded ID type            | `{Entity}Id`                 | `PaymentRequestId`, `TenantId`    |
| DTO type (read)            | `{Entity}Read`               | `PaymentRequestRead`              |
| DTO type (write)           | `Create{Entity}Payload`      | `CreatePaymentRequestPayload`     |
| Zod schema constant        | `{entity}Schema` (camelCase) | `paymentRequestSchema`            |
| Query keys object          | `{module}Keys`               | `apKeys`, `ledgerKeys`            |
| Adapter export             | `{module}Adapter`            | `apAdapter`, `ledgerAdapter`      |
| Screen definition constant | `{SCREENID}Screen`           | `AP301000Screen`                  |
| Enum                       | `PascalCase`                 | `PaymentRequestStatus`            |
| Enum member                | `SCREAMING_SNAKE_CASE`       | `DRAFT`, `SUBMITTED`, `APPROVED`  |

**Anti-redundancy rule:** The filename provides namespace context. Do not repeat it in type names.

```ts
// File: account.types.ts
interface Account { ... }       // ✅
interface AccountType { ... }   // ❌ — redundant
interface AccountData { ... }   // ❌ — redundant

// File: payment-request.types.ts
type PaymentRequestStatus = ... // ✅
type PRStatus = ...             // ❌ — abbreviation
```

---

## 5. Existing Inconsistencies (Backlog)

These are the known deviations from this standard. They are fixed when the relevant module is next touched — not as a big-bang refactor.

### High — Structural

| Current                                                                                   | Target                     |
| ----------------------------------------------------------------------------------------- | -------------------------- |
| `bank/`, `ledger/`, `inventory/`, `workflows/`, `reporting/` — `application/composables/` | flatten to `application/`  |
| `shared/lib/`                                                                             | merge into `shared/utils/` |

### Medium — Naming Correctness

| Current                                             | Target                                        |
| --------------------------------------------------- | --------------------------------------------- |
| All `{module}_adapter.ts`                           | `{module}.adapter.ts`                         |
| `bank/application/keys.ts`                          | `query-keys.ts`                               |
| `ledger/application/keys.ts`                        | `query-keys.ts`                               |
| `inventory/application/keys.ts`                     | `query-keys.ts`                               |
| `reporting/application/keys.ts`                     | `query-keys.ts`                               |
| `workflows/application/keys.ts`                     | `query-keys.ts`                               |
| `ledger/menu.ts`                                    | `workspace.ts`                                |
| `inventory/domain/types.ts`                         | `inventory.types.ts`                          |
| `shared/components/finance/SelectLedgerAccount.vue` | `shared/ui/finance/LedgerAccountSelector.vue` |

### Low — Component Naming

| Current                                 | Target                              |
| --------------------------------------- | ----------------------------------- |
| `core/ui/CreateRoleDialog.vue`          | `RoleCreateDialog.vue`              |
| `core/ui/InviteUserDialog.vue`          | `UserInviteDialog.vue`              |
| `ledger/ui/.../CreateAccountDrawer.vue` | `AccountCreateDrawer.vue`           |
| `AP301000/reject-modal.vue`             | `RejectDialog.vue`                  |
| `AP3010PL/filters.panel.vue`            | `FilterPane.vue`                    |
| `AP3010PL/bulk-actions.vue`             | `BulkActionBar.vue`                 |
| `AP301000/sidepanels/trace.vue`         | `audit.vue`                         |
| `VendorBillTraceSidePane.vue`           | fold into SidePane pattern          |
| `AppSidePanel.vue` (workspace/)         | remove — `AppSidePane` is canonical |
