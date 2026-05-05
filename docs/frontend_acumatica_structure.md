# Acumatica Frontend Architecture Standards

To achieve a true Acumatica-style architecture, the frontend must be organized by **Screen Types** rather than generic Vue features. Each screen is an autonomous, self-contained module.

## 1. Top-Level Module Structure

Every business domain (e.g., Accounts Payable) contains its domain logic, application state, and the `ui/` layer.

```text
src/modules/finance/ap/
├── domain/             # Types, Enums, DTOs (The "DAC" layer)
├── application/        # API calls, TanStack Queries (The "Data Access" layer)
└── ui/                 # The Presentation & Graph layer
    ├── transactions/   # Document-centric screens (300000 series)
    ├── profiles/       # Master data maintenance (300000 series, nouns)
    ├── processing/     # Bulk processing screens (500000 series)
    ├── setup/          # Configuration and preferences (100000 series)
    └── inquiries/      # Generic inquiries and analysis (GI)
```

## 2. Screen-as-a-Module (The Screen Folder)

Inside the `ui/` archetypes, every single screen gets its own folder named after its **Screen ID**. This folder contains everything required to render and operate the screen.

```text
ui/transactions/AP301000/
├── screen.ts          # The SiteMap & Screen Contract (ScreenDefinition)
├── controller.ts      # The "PXGraph" (Behavior, State, Actions)
├── view.vue           # The "ASPX" (Pure presentation, Layout)
├── commands.ts        # Workflow Action definitions
├── fields.ts          # Lookups, Dropdown constants
├── grids/             # Grid column definitions
│   └── lines.grid.ts
└── sidepanels/        # Side panel content
    └── trace.vue
```

## 3. Acumatica Concept Mapping

### The `PXGraph` ➔ `controller.ts`

In Acumatica, the `PXGraph` handles all business logic, data fetching, state transitions, and action execution. In our frontend, `controller.ts` serves the exact same purpose.

- It extends `useScreenController` (the base graph).
- It executes `useQuery` / `useMutation` to fetch DACs.
- It exposes pure state (`entity.value`, `isDraft.value`) to the view.
- **Rule:** It must never contain HTML/DOM logic.

### The `ASPX` Page ➔ `view.vue`

In Acumatica, the `.aspx` page is purely declarative XML defining the layout. In our frontend, `view.vue` serves this purpose.

- It consists of `AppFieldset`, `AppField`, and `DataGrid` primitives.
- It imports `usePaymentRequestEntry()` from the controller.
- **Rule:** It must never contain API calls, complex state, or business logic. If it is more than 150-200 lines, logic needs to be moved to the controller.

### The Site Map ➔ `screen.ts`

In Acumatica, screens are registered in the Site Map to define their URL, Title, and Workspace location.

- `screen.ts` defines the `ScreenDefinition` contract.
- It configures the URL route, the layout type, and the Side Panel contracts.
- The `ScreenRenderer` platform component uses this file to mount the screen.

### The `PXAction` ➔ `commands.ts`

In Acumatica, buttons like "Approve", "Release", or "Hold" are defined as `PXAction` methods on the graph.

- `commands.ts` exports an array of `ActionContract` objects (Label, Icon, Variant).
- The `controller.ts` registers these actions and handles their execution.

## 4. The Screen Pairing Rule (Primary Lists)

In Acumatica, every Data Entry screen (e.g., `AP301000`) has an associated Entry Point / Generic Inquiry used to search for records. We denote these with the `PL` (Primary List) suffix.

They must live side-by-side in the same archetype folder:

```text
ui/transactions/
├── AP301000/       # The Data Entry Focus screen (Edit/Create)
└── AP3010PL/       # The Primary List Workspace (Search/Filter)
```

- `AP3010PL` has its own controller, handling grid state, bulk selection, and bucket filtering.
- Clicking a row in `AP3010PL` routes the user to `AP301000`.
