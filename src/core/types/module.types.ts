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
  routes: () => Promise<RouteRecordRaw[]>
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
