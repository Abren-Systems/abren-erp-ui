<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import type { Component } from 'vue'
import { businessModules, platformModules } from '@/modules'
import type { BusinessDomain, PlatformEngine, MenuItem } from '@/shared/types/module.types'
import { useAuthStore } from '@/shared/auth/auth.store'
import {
  BarChart3,
  BookOpen,
  Box,
  Boxes,
  Building,
  Calendar,
  CalendarDays,
  CalendarRange,
  ChevronRight,
  CreditCard,
  FileText,
  GitBranch,
  Inbox,
  Landmark,
  LayoutGrid,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Percent,
  RefreshCw,
  Settings,
  Shield,
  Users,
  Warehouse,
} from 'lucide-vue-next'

interface Props {
  collapsed: boolean
  mobileOpen: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:collapsed': [value: boolean]
  'update:mobileOpen': [value: boolean]
  logout: []
}>()

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

interface NavigationItem {
  label: string
  icon?: Component
  href?: string
  to?: { name?: string; path?: string }
  permissions?: string[]
}

interface NavigationGroup {
  title: string
  items: NavigationItem[]
}

function canAccess(item: NavigationItem): boolean {
  if (!item.permissions?.length) return true
  return item.permissions.every((permission) => authStore.hasPermission(permission))
}

const iconMap: Record<string, Component> = {
  users: Users,
  shield: Shield,
  building: Building,
  'credit-card': CreditCard,
  'file-text': FileText,
  'book-open': BookOpen,
  calendar: Calendar,
  'calendar-days': CalendarDays,
  'calendar-range': CalendarRange,
  settings: Settings,
  inbox: Inbox,
  'git-branch': GitBranch,
  percent: Percent,
  'layout-grid': LayoutGrid,
  landmark: Landmark,
  'bar-chart-3': BarChart3,
  warehouse: Warehouse,
  boxes: Boxes,
  box: Box,
  'refresh-cw': RefreshCw,
}

function resolveIcon(icon?: string | Component): Component | undefined {
  if (!icon) return undefined
  if (typeof icon !== 'string') return icon
  return iconMap[icon]
}

function toNavigationItem(moduleId: string, item: MenuItem): NavigationItem {
  if (item.href) {
    return {
      label: item.label,
      icon: resolveIcon(item.icon),
      permissions: item.permissions,
      href: item.href,
    }
  }
  if (item.route) {
    return {
      label: item.label,
      icon: resolveIcon(item.icon),
      permissions: item.permissions,
      to: { name: item.route },
    }
  }
  return {
    label: item.label,
    icon: resolveIcon(item.icon),
    permissions: item.permissions,
    to: { path: `/app/${moduleId}` },
  }
}

const businessGroups = computed<NavigationGroup[]>(() =>
  businessModules.map((module: BusinessDomain) => ({
    title: module.name,
    items: module.menuItems.map((item) => toNavigationItem(module.id, item)),
  })),
)

const businessGroupsVisible = computed(() =>
  businessGroups.value
    .map((g) => ({ ...g, items: g.items.filter(canAccess) }))
    .filter((g) => g.items.length > 0),
)

const platformGroups = computed<NavigationGroup[]>(() =>
  platformModules.map((module: PlatformEngine) => ({
    title: module.name,
    items: module.menuItems.map((item) => toNavigationItem(module.id, item)),
  })),
)

const platformGroupsVisible = computed(() =>
  platformGroups.value
    .map((g) => ({ ...g, items: g.items.filter(canAccess) }))
    .filter((g) => g.items.length > 0),
)

function isItemActive(item: NavigationItem): boolean {
  if (item.href) {
    return route.path === item.href
  }
  if (item.to?.name) {
    const resolved = router.resolve({ name: item.to.name })
    const base = resolved.path.replace(/\/$/, '') || '/'
    const current = route.path.replace(/\/$/, '') || '/'
    if (current === base) return true
    if (base.length > 1 && current.startsWith(`${base}/`)) return true
    return route.name === item.to.name
  }
  if (item.to?.path) {
    const normalized = item.to.path.replace(/\/$/, '') || '/'
    const current = route.path.replace(/\/$/, '') || '/'
    if (current === normalized) return true
    if (normalized.length > 1 && current.startsWith(`${normalized}/`)) return true
    return false
  }
  return false
}

function closeMobileSidebar() {
  emit('update:mobileOpen', false)
}

function toggleSidebar() {
  emit('update:collapsed', !props.collapsed)
}
</script>

<template>
  <aside
    :class="[
      'fixed inset-y-0 left-0 z-40 flex w-[19rem] flex-col border-r border-[color:var(--color-neutral-200)] bg-[linear-gradient(180deg,#ffffff,rgba(248,250,252,0.96))] transition-transform duration-200 lg:static lg:translate-x-0',
      mobileOpen ? 'translate-x-0' : '-translate-x-full',
      collapsed ? 'lg:w-[5.5rem]' : 'lg:w-[19rem]',
    ]"
  >
    <div
      class="flex items-center justify-between border-b border-[color:var(--color-neutral-200)] px-4 py-3"
    >
      <div class="flex min-w-0 items-center gap-3">
        <div
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary-600)] text-sm font-semibold text-white shadow-[0_12px_24px_rgba(79,70,229,0.22)]"
        >
          AB
        </div>
        <div v-if="!collapsed" class="min-w-0">
          <p class="truncate text-sm font-semibold text-[var(--color-neutral-900)]">Abren ERP</p>
          <p class="mt-0.5 truncate text-xs text-[var(--color-neutral-500)]">
            Finance operations workspace
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[color:var(--color-neutral-200)] bg-white text-[var(--color-neutral-600)] lg:hidden"
          type="button"
          @click="closeMobileSidebar"
        >
          <PanelLeftClose class="h-4 w-4" />
        </button>
        <button
          class="hidden h-9 w-9 items-center justify-center rounded-xl border border-[color:var(--color-neutral-200)] bg-white text-[var(--color-neutral-600)] lg:inline-flex"
          type="button"
          @click="toggleSidebar"
        >
          <component :is="collapsed ? PanelLeftOpen : PanelLeftClose" class="h-4 w-4" />
        </button>
      </div>
    </div>

    <nav class="flex-1 space-y-4 overflow-y-auto px-3 py-3">
      <div class="space-y-3">
        <div v-for="group in businessGroupsVisible" :key="group.title" class="space-y-1.5">
          <p
            v-if="!collapsed"
            class="px-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-neutral-500)]"
          >
            {{ group.title }}
          </p>
          <RouterLink
            v-for="item in group.items"
            :key="`${group.title}-${item.label}`"
            :to="item.href || item.to!"
            :class="[
              'group flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition-colors',
              isItemActive(item)
                ? 'bg-[var(--color-neutral-900)] text-white'
                : 'text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-100)]',
              collapsed ? 'justify-center px-0' : '',
            ]"
            @click="closeMobileSidebar"
          >
            <component :is="item.icon || ChevronRight" class="h-4 w-4 shrink-0" />
            <span v-if="!collapsed" class="truncate">{{ item.label }}</span>
          </RouterLink>
        </div>
      </div>

      <div
        v-if="platformGroupsVisible.length > 0"
        class="space-y-3 border-t border-[color:var(--color-neutral-200)] pt-4"
      >
        <div v-for="group in platformGroupsVisible" :key="group.title" class="space-y-1.5">
          <p
            v-if="!collapsed"
            class="px-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-neutral-500)]"
          >
            {{ group.title }}
          </p>
          <RouterLink
            v-for="item in group.items"
            :key="`${group.title}-${item.label}`"
            :to="item.href || item.to!"
            :class="[
              'group flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition-colors',
              isItemActive(item)
                ? 'bg-[var(--color-neutral-900)] text-white'
                : 'text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-neutral-900)]',
              collapsed ? 'justify-center px-0' : '',
            ]"
            @click="closeMobileSidebar"
          >
            <component :is="item.icon || ChevronRight" class="h-4 w-4 shrink-0" />
            <span v-if="!collapsed" class="truncate">{{ item.label }}</span>
          </RouterLink>
        </div>
      </div>
    </nav>

    <div class="border-t border-[color:var(--color-neutral-200)] p-3">
      <button
        type="button"
        :class="[
          'flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium text-[var(--color-danger-700)] transition-colors hover:bg-[var(--color-danger-50)]',
          collapsed ? 'justify-center px-0' : '',
        ]"
        @click="emit('logout')"
      >
        <LogOut class="h-4 w-4 shrink-0" />
        <span v-if="!collapsed">Logout</span>
      </button>
    </div>
  </aside>
</template>
