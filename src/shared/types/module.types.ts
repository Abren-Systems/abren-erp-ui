/**
 * Module type contracts for the Abren ERP module registry.
 *
 * Every feature module (business or platform) must export an object that satisfies
 * `ModuleDefinition`. The registry (`src/modules/index.ts`) splits these into
 * `BusinessDomain` and `PlatformEngine` arrays, which drive both the router and
 * the sidebar navigation in `AuthenticatedLayout`.
 *
 * Adding a new module requires only:
 *   1. Implementing `ModuleDefinition` (or its narrowed subtype)
 *   2. Registering it in `src/modules/index.ts`
 */
import type { RouteRecordRaw } from 'vue-router'
import type { Component } from 'vue'

export type ModuleCategory = 'business' | 'platform'

export interface MenuItem {
  label: string
  route?: string
  href?: string
  icon?: Component | string
  permissions?: string[]
}

export interface ModuleDefinition {
  id: string
  name: string
  category: ModuleCategory
  routes: RouteRecordRaw[]
  permissions: string[]
  menuItems: MenuItem[]
  /**
   * Optional providers for cross-module communication (Adapter pattern)
   */
  providers?: Record<string, unknown>
}

export interface BusinessDomain extends ModuleDefinition {
  category: 'business'
}

export interface PlatformEngine extends ModuleDefinition {
  category: 'platform'
}
