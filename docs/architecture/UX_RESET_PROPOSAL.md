---
title: 'Abren ERP - UX Reset Proposal'
description: 'A practical proposal to reimagine the Abren ERP UX architecture, visual language, and design-system ownership.'
tier: frontend
tags: [frontend, architecture, ux]
---

# Abren ERP - UX Reset Proposal

> **Update:** This proposal captured the turning point before the primitive clean sweep. The repo has since removed Fluent-backed shared primitives, but the reasoning below remains the basis for that decision.

## 1. Executive Recommendation

Abren ERP should stop trying to be a visual imitation of other enterprise products and instead become a **calm operational workspace** built around three promises:

1. **Work is obvious**: the system always shows what requires attention now.
2. **Numbers are trustworthy**: every metric and amount has visible provenance.
3. **Complexity is staged**: dense by default, but never noisy.

The current codebase already has a strong technical backbone:

- A clean module registry
- A solid 4-layer module architecture
- TanStack Query and TanStack Table for data-heavy workflows
- A growing shared component system

The problem is not the domain architecture. The problem is that the UX layer currently has **conflicting philosophies**:

- The docs say "anti-dashboard", but the app lands on a generic dashboard.
- The docs say "priority-driven workspace", but the shell mostly exposes navigation.
- The docs say "native Fluent", but the actual app is a hybrid of Fluent wrappers and custom/Reka components.
- The docs describe a strict density and action grammar, but pages still feel like isolated prototypes instead of one operating system.

## 2. Diagnosis of the Current State

### 2.1. Identity drift

The product currently reads as:

- part Dynamics imitation
- part Tailwind prototype
- part unfinished admin panel

That creates a UI that is styled, but not truly designed.

### 2.2. Information hierarchy drift

The current shell gives too much weight to:

- static navigation
- decorative chrome
- placeholder dashboard cards

And not enough weight to:

- urgent work queues
- role/context switching
- state transitions
- traceability

### 2.3. Foundation drift

The repo has two competing primitive stories:

- Fluent web components for some atoms
- Custom/Reka-style shared components for other surfaces

That is manageable temporarily, but it is not a durable UX foundation for a large ERP.

### 2.4. Documentation drift

Several docs and repo descriptions no longer match the real implementation:

- `README.md` still describes old structure and outdated ownership boundaries
- `docs/README.md` points to paths that do not reflect the current repo
- `.agents/skills/vue3-abren-erp/SKILL.md` still reinforces an older UI philosophy instead of the UX the app now needs

## 3. Recommendation: A Better UX Philosophy

I recommend that Abren ERP adopt this product stance:

> **Abren is not a dashboard product. It is a decision-and-execution workspace for operational finance.**

That translates into five UX principles.

### 3.1. Workboard first, analytics second

The home experience should be a **workboard**, not a vanity dashboard.

The first screen after login should answer:

- What needs my attention?
- What is blocked?
- What changed since I was last here?
- What risk requires escalation?

Charts and broad KPIs belong in reporting views or in narrow decision-support panels, not as the default center of gravity.

### 3.2. Calm operational density

ERP users do need density, but not chaos. The right target is:

- compact spacing
- strong alignment
- deliberate grouping
- quiet surfaces
- limited accent color
- extremely clear primary actions

Dense does not mean cramped, and minimal does not mean empty.

### 3.3. Route-driven focus, drawer-driven context

Transactional work should follow a stable grammar:

`Workboard/Queue -> Record Focus -> Trace/Support Context -> Confirmed Action`

That means:

- lists and queues live on routes
- focused editing and review live on routes
- provenance, related history, and support context live in drawers
- destructive transitions live in explicit confirmation dialogs

### 3.4. Trust over decoration

Fake metrics, placeholder cards, and decorative management-dashboard tropes should be removed aggressively. For an ERP, false precision is worse than empty states.

If data is not real yet, the UI should say:

- "Not connected yet"
- "No activity yet"
- "Awaiting backend source"

That builds trust faster than invented numbers.

### 3.5. Abren-owned design language

Abren needs its own visual language rather than a vendor cosplay layer.

That means:

- keep accessibility and behavior primitives
- own the shell, density system, spacing, color semantics, page grammar, and motion
- treat third-party primitives as implementation details, not product identity

## 4. Architectural Proposal

## 4.1. Separate the UX into four surface types

Every page in the app should declare itself as one of these surface types:

1. **Workboard**
   - Time-sensitive queues, exceptions, approvals, alerts, next actions
2. **Workspace**
   - Dense list and filter screens for scanning and triage
3. **Focus**
   - A single-record page for doing consequential work
4. **Setup**
   - Administrative configuration, taxonomies, settings, and governance

This is more useful than treating every route as a generic "page".

## 4.2. Rebuild the shell around work, not chrome

`AuthenticatedLayout.vue` should become a real workspace shell with:

- a collapsible navigation rail
- a context-aware top bar
- a global command/search entry point
- a notification and approval tray
- a persistent page action slot
- responsive behavior that degrades intentionally on tablet/mobile

The current shell is structurally close, but it is still mostly a container. It needs to become a workflow instrument.

## 4.3. Introduce a page-kit layer above primitives

Right now there are primitives, but not enough repeatable page-level composition. Add a shared page-kit layer for:

- `PageHeader`
- `PageSection`
- `PageToolbar`
- `MetricStrip`
- `EmptyState`
- `RecordHero`
- `StateTimeline`
- `TraceDrawerSection`
- `ExceptionBanner`

This is the missing layer between low-level atoms and full module pages.

## 4.4. Standardize action hierarchy

Every page should expose actions in exactly four tiers:

1. **Primary**: state-advancing actions
2. **Secondary**: helpful adjacent actions
3. **Contextual**: row-level or drawer-level actions
4. **Destructive**: confirmation-gated actions only

This should be visible in code structure, not just in design language.

## 4.5. Make traceability a permanent product capability

Every financially meaningful entity should have a standard trace model:

- lifecycle timeline
- upstream source
- downstream effects
- approvals
- attachments
- financial impact

This should not be re-invented per module. It should be a platform UX capability with module-provided content.

## 5. Design-System Recommendation

## 5.1. Stop centering the design philosophy on Fluent

My recommendation is:

- **Do not rewrite everything immediately**
- **Do stop treating Fluent as the product identity**

Pragmatically:

- freeze expansion of raw Fluent-first patterns
- remove or replace existing wrappers as shared primitives are rebuilt
- build new UX architecture around Abren-owned Vue components
- gradually replace brittle or restrictive primitive wrappers over time

This avoids a disruptive rewrite while giving the product a coherent future.

## 5.2. Move to a warmer, more distinctive visual system

The current indigo-heavy palette reads like a generic SaaS admin product. A better visual direction would be:

- warm canvas and surface neutrals
- a darker ink color for hierarchy
- one restrained brand accent
- semantic colors reserved for status and finance meaning
- richer contrast through surfaces and spacing, not constant borders and white cards

The visual goal should be:

**serious, modern, grounded, and trustworthy**

not

**generic enterprise blue/purple dashboard**

## 5.3. Typography recommendation

The current stack is serviceable but generic. For a product trying to feel intentional and regionally ready:

- choose a more distinctive primary sans stack
- keep a reliable numeric mono
- explicitly support future Amharic/Ethiopic fallback in the token strategy

Typography should help the product feel owned, not default.

## 6. Product Structure Recommendation

The route structure should reflect mental models of work:

### 6.1. Home

Replace the current dashboard with a **Workboard** made of:

- My approvals
- Exceptions and blockers
- Recently changed financial events
- Cash and payment risk
- Team activity requiring attention

### 6.2. Module workspaces

Each module should expose:

- a queue/workspace route
- a focused detail route
- optional creation route
- trace and support drawers

### 6.3. Reporting

Reporting should be separated from execution surfaces. Users should feel when they are:

- analyzing
- configuring
- acting

Those modes should not blur together.

## 7. Proposed Delivery Plan

## Phase 0 - Reset the doctrine

Update the repo's source of truth:

- replace the outdated skill guidance
- refresh the UX architecture manifesto
- refresh the design-system doctrine
- fix stale root/docs README references

This phase prevents future drift.

## Phase 1 - Rebuild the shell

Implement the new operating frame:

- `AuthenticatedLayout.vue`
- `PublicLayout.vue`
- command/search entry
- navigation rail behavior
- header/action slots
- notification and approval surfaces

This will create leverage for every module after it.

## Phase 2 - Replace the fake dashboard with a workboard

Rebuild `DashboardPage.vue` into:

- attention queues
- real event-driven summaries
- truthful empty states
- quick actions
- risk and exception panels

This is the single highest-trust UX improvement available in the current app.

## Phase 3 - Create the page-kit layer

Add reusable shared composition components for:

- headers
- toolbars
- metric strips
- empty states
- focus heroes
- trace sections

This will make the app feel like one system instead of multiple experiments.

## Phase 4 - Apply the grammar to key modules

Roll the new structure through the highest-value flows first:

1. Payment Requests
2. Vendor Bills
3. Journal Entries
4. Bank Transactions

Those are the flows where UX clarity matters most.

## Phase 5 - Rationalize primitives

After the shell and page architecture stabilize:

- complete the primitive clean sweep
- remove stale vendor dependencies and leftover assumptions
- standardize on one owned primitive story

## 8. What I Would Keep vs Change

### Keep

- module boundaries
- 4-layer architecture
- TanStack Query
- TanStack Table/DataGrid investment
- route-driven module registration
- shared-kernel discipline

### Change

- the default home experience
- the visual identity
- the shell hierarchy
- the page-level composition layer
- the "Fluent as philosophy" framing
- stale developer guidance and docs

## 9. Strong Opinion, Loosely Held

If I were steering this ERP, I would make one hard product call:

**Do not optimize the UX around looking like enterprise software. Optimize it around helping operators clear work with confidence.**

That means the winning direction is not "more enterprise chrome". It is:

- sharper prioritization
- cleaner focus states
- stronger provenance
- calmer density
- more truthful product surfaces

That is the difference between an admin panel and an actual ERP workspace.
