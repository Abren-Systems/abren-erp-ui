<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import type { Component } from 'vue'
import { workspaceRegistry } from '@/platform/navigation-runtime/workspace-registry'
import { useAuthStore } from '@/shared/auth/auth.store'
import {
  BarChart3,
  BookOpen,
  Box,
  Boxes,
  Building,
  Building2,
  Calculator,
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
}>()

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

interface NavigationItem {
  id: string
  label: string
  icon?: Component
  to: { path: string }
  permissions?: string[]
}

const iconMap: Record<string, Component> = {
  users: Users,
  shield: Shield,
  building: Building,
  'building-2': Building2,
  'credit-card': CreditCard,
  'file-text': FileText,
  'book-open': BookOpen,
  book: BookOpen,
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
  package: Box,
  'refresh-cw': RefreshCw,
  calculator: Calculator,
}

function resolveIcon(icon?: string | Component): Component | undefined {
  if (!icon) return undefined
  if (typeof icon !== 'string') return icon
  return iconMap[icon]
}

function canAccess(item: NavigationItem): boolean {
  if (!item.permissions?.length) return true
  return item.permissions.every((permission) => authStore.hasPermission(permission))
}

const businessItems = computed<NavigationItem[]>(() =>
  workspaceRegistry.getByCategory('business').map((workspace) => ({
    id: workspace.id,
    label: workspace.titleKey,
    icon: resolveIcon(workspace.icon),
    to: { path: `/app/${workspace.id}` },
    permissions: workspace.requiredCapabilities,
  })),
)

const platformItems = computed<NavigationItem[]>(() =>
  workspaceRegistry.getByCategory('platform').map((workspace) => ({
    id: workspace.id,
    label: workspace.titleKey,
    icon: resolveIcon(workspace.icon),
    to: { path: `/app/${workspace.id}` },
    permissions: workspace.requiredCapabilities,
  })),
)

const businessVisible = computed(() => businessItems.value.filter(canAccess))
const platformVisible = computed(() => platformItems.value.filter(canAccess))

function isItemActive(item: NavigationItem): boolean {
  const current = route.path.replace(/\/$/, '') || '/'
  const target = item.to.path.replace(/\/$/, '') || '/'
  return current.startsWith(target)
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
      'sidebar-frame fixed inset-y-0 left-0 z-40 flex flex-col border-r border-[color:var(--color-neutral-200)] bg-[var(--color-neutral-100)] transition-transform duration-200 lg:static lg:translate-x-0',
      mobileOpen ? 'translate-x-0' : '-translate-x-full',
      collapsed ? 'sidebar-frame--collapsed' : '',
    ]"
  >
    <div class="flex items-center border-b border-[color:var(--color-neutral-200)] px-3 py-2">
      <div class="flex min-w-0 items-center gap-2">
        <div
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[var(--color-primary-600)] text-xs font-semibold text-white shadow-sm"
        >
          AB
        </div>
        <div v-if="!collapsed" class="min-w-0">
          <p class="truncate text-[13px] font-bold text-[var(--color-neutral-900)]">Abren ERP</p>
          <p class="truncate text-label !text-[var(--color-neutral-500)]">Operations</p>
        </div>
      </div>
    </div>

    <nav class="flex-1 space-y-3 overflow-y-auto px-2 py-3">
      <div class="space-y-0.5">
        <RouterLink
          v-for="item in businessVisible"
          :key="item.id"
          :to="item.to"
          :class="[
            'group relative flex items-center gap-2.5 rounded-sm px-2.5 py-1.5 text-[13px] transition-colors',
            isItemActive(item)
              ? 'bg-[var(--color-neutral-200)] text-[var(--color-primary-700)] font-semibold before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[3px] before:rounded-r-sm before:bg-[var(--color-primary-600)]'
              : 'text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-200)]/60',
            collapsed ? 'justify-center px-0 before:hidden' : '',
          ]"
          @click="closeMobileSidebar"
        >
          <component :is="item.icon || ChevronRight" class="h-4 w-4 shrink-0" />
          <span v-if="!collapsed" class="truncate">{{ item.label }}</span>
        </RouterLink>
      </div>

      <div
        v-if="platformVisible.length > 0"
        class="space-y-1.5 border-t border-[color:var(--color-neutral-200)] pt-4"
      >
        <RouterLink
          v-for="item in platformVisible"
          :key="item.id"
          :to="item.to"
          :class="[
            'group relative flex items-center gap-2.5 rounded-sm px-2.5 py-1.5 text-[13px] transition-colors',
            isItemActive(item)
              ? 'bg-[var(--color-neutral-200)] text-[var(--color-primary-700)] font-semibold before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[3px] before:rounded-r-sm before:bg-[var(--color-primary-600)]'
              : 'text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-200)]/60',
            collapsed ? 'justify-center px-0 before:hidden' : '',
          ]"
          @click="closeMobileSidebar"
        >
          <component :is="item.icon || ChevronRight" class="h-4 w-4 shrink-0" />
          <span v-if="!collapsed" class="truncate">{{ item.label }}</span>
        </RouterLink>
      </div>
    </nav>

    <div class="flex justify-end border-t border-[color:var(--color-neutral-200)] p-2">
      <button
        type="button"
        class="flex items-center justify-center rounded-sm p-1.5 text-[var(--color-neutral-600)] transition-colors hover:bg-[var(--color-neutral-200)] hover:text-[var(--color-neutral-900)]"
        :title="collapsed ? 'Expand' : 'Collapse'"
        @click="toggleSidebar"
      >
        <component :is="collapsed ? PanelLeftOpen : PanelLeftClose" class="h-4 w-4 shrink-0" />
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar-frame {
  width: var(--layout-sidebar-width);
}

@media (min-width: 1024px) {
  .sidebar-frame--collapsed {
    width: var(--layout-sidebar-collapsed);
  }
}
</style>
