import type { Component } from 'vue'
import type { ModuleId } from '@/shared/types/brand.types'
import type { ScreenId } from './screen-id.types'
import type { ScreenViews } from './screen-view.types'
import type { ScreenCommand } from '../commands/command.types'
import type { SidePanelContract } from '../component-contracts'

// ── Screen Taxonomy ───────────────────────────────────────
// Maps directly to Acumatica form types.
// Each kind has distinct layout expectations and renderer behavior.

export type ScreenKind =
  | 'primaryList' // Dense list scanning, saved filters, navigation to dataEntry
  | 'dataEntry' // Transaction/profile creation and editing
  | 'setup' // Preferences, numbering, posting rules, governance
  | 'processing' // Select many records, execute server action, show result
  | 'inquiry' // Read-only filtered analysis and drilldown
  | 'report' // Parameterized report with templates
  | 'workboard' // Cross-screen operational launchpad

// ── Layout Templates ──────────────────────────────────────
// Named column templates equivalent to Acumatica's qp-template.
// Screens declare a template; the renderer handles the grid math.

export type LayoutTemplate =
  | '1'
  | '1-1'
  | '1-1-1'
  | '2-1'
  | '1-2'
  | '7-10-7'
  | '17-17-14'
  | '17-14-17'
  | '14-17-17'
  | '17-7'
  | '7-17'
  | '17-31'

export interface ScreenLayoutDefinition {
  /** The primary column template for the summary/header area */
  readonly summaryTemplate: LayoutTemplate
  /** The render target component — allows compatibility with existing SFCs during migration */
  readonly renderTarget?: Component
  /** The contextual right-pane side panel contract */
  readonly sidePanel?: SidePanelContract
}

// ── Route Binding ─────────────────────────────────────────

export interface ScreenRoute {
  /** The Vue Router path pattern (e.g., '/finance/ap/payment-requests/:id?') */
  readonly path: string
  /** Optional named route for programmatic navigation */
  readonly name?: string
}

// ── Permissions ───────────────────────────────────────────

export interface ScreenPermission {
  readonly key: string
  readonly description?: string
}

// ── Test Contract ─────────────────────────────────────────
// Every screen must declare stable IDs for Playwright/component tests.

export interface ScreenTestContract {
  /** Stable container name for the screen (e.g., 'PaymentRequestEntry') */
  readonly containerName: string
  /** Named view containers for targeting sub-sections */
  readonly viewNames: readonly string[]
  /** Named action identifiers for testing command interactions */
  readonly actionNames: readonly string[]
}

// ── Personalization Policy ────────────────────────────────

export interface ScreenPersonalizationPolicy {
  /** Whether users can reorder/hide tabs */
  readonly allowTabPersonalization: boolean
  /** Whether users can configure grid columns */
  readonly allowGridPersonalization: boolean
  /** Whether users can save personal/shared filters */
  readonly allowFilterSaving: boolean
  /** Whether users can collapse/reorder sections */
  readonly allowSectionPersonalization: boolean
}

// ── The Screen Definition ─────────────────────────────────
// This is the primary unit of the frontend. Routes, menus, permissions,
// test IDs, localization, commands, layouts, and personalization are
// all consumers of this metadata.

export interface ScreenDefinition<
  _TEntity = unknown,
  _TContext = unknown,
  TViews extends ScreenViews = ScreenViews,
> {
  /** Stable screen identifier (e.g., 'AP301000') */
  readonly id: ScreenId

  /** The module that owns this screen */
  readonly moduleId: ModuleId

  /** Acumatica-style screen taxonomy */
  readonly kind: ScreenKind

  /** Localization key for the screen title */
  readonly titleKey: string

  /** The primary view name for this screen */
  readonly primaryView: keyof TViews & string

  /** Route binding for Vue Router */
  readonly route: ScreenRoute

  /** Required permissions to access this screen */
  readonly permissions: readonly ScreenPermission[]

  /** Typed view descriptors (single records, collections, reports) */
  readonly views: TViews

  /** Layout metadata for the screen renderer */
  readonly layout: ScreenLayoutDefinition

  /** Commands available on this screen */
  readonly commands: readonly ScreenCommand[]

  /** Personalization policy governing what users can customize */
  readonly personalization: ScreenPersonalizationPolicy

  /** Stable test identifiers */
  readonly test: ScreenTestContract
}
