<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import type { Component } from 'vue'
import { allModules, businessModules, platformModules } from '@/modules'
import type { BusinessDomain, PlatformEngine, MenuItem } from '@/shared/types/module.types'
import { useAuthStore } from '@/shared/auth/auth.store'
import { AppBreadcrumb } from '@/shared/components/primitives'
import {
  Bell,
  BookOpen,
  Boxes,
  Building,
  Calendar,
  ChevronRight,
  Command,
  CreditCard,
  FileText,
  GitBranch,
  Inbox,
  Landmark,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Percent,
  Search,
  Settings,
  Shield,
  Users,
  Warehouse,
  BarChart3,
} from 'lucide-vue-next'

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

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isSidebarCollapsed = ref(false)
const isMobileSidebarOpen = ref(false)

const iconMap: Record<string, Component> = {
  users: Users,
  shield: Shield,
  building: Building,
  'credit-card': CreditCard,
  'file-text': FileText,
  'book-open': BookOpen,
  calendar: Calendar,
  settings: Settings,
  inbox: Inbox,
  'git-branch': GitBranch,
  percent: Percent,
  'layout-grid': LayoutGrid,
  landmark: Landmark,
  'bar-chart-3': BarChart3,
  warehouse: Warehouse,
  boxes: Boxes,
}

function resolveIcon(icon?: string | Component): Component | undefined {
  if (!icon) return undefined
  if (typeof icon !== 'string') return icon
  return iconMap[icon]
}

function toNavigationItem(moduleId: string, item: MenuItem): NavigationItem {
  return {
    label: item.label,
    icon: resolveIcon(item.icon),
    permissions: item.permissions,
    href: item.href,
    to: item.route
      ? { name: item.route }
      : { path: item.href || `/app/${moduleId}/${item.label.toLowerCase().replace(/ /g, '-')}` },
  }
}

const startGroups = computed<NavigationGroup[]>(() => [
  {
    title: 'Start',
    items: [{ label: 'Workboard', icon: LayoutDashboard, href: '/app' }],
  },
])

const businessGroups = computed<NavigationGroup[]>(() =>
  businessModules.map((module: BusinessDomain) => ({
    title: module.name,
    items: module.menuItems.map((item) => toNavigationItem(module.id, item)),
  })),
)

const platformGroups = computed<NavigationGroup[]>(() =>
  platformModules.map((module: PlatformEngine) => ({
    title: module.name,
    items: module.menuItems.map((item) => toNavigationItem(module.id, item)),
  })),
)

const currentModuleName = computed(() => {
  const moduleId = route.path.split('/')[2]
  if (!moduleId) return 'Operations'
  return allModules.find((module) => module.id === moduleId)?.name ?? 'Operations'
})

const currentTitle = computed(() => {
  return typeof route.name === 'string'
    ? route.name.replace(/([A-Z])/g, ' $1').trim()
    : currentModuleName.value
})

const currentDescription = computed(() => {
  if (route.name === 'DashboardPage') {
    return 'Prioritize approvals, exceptions, and operational changes without getting buried in dashboard noise.'
  }

  return `You are working inside ${currentModuleName.value}. Keep actions explicit and traceable.`
})

const tenantName = computed(() => authStore.currentTenant?.name || 'Current Tenant')
const userEmail = computed(() => authStore.currentUser?.email || 'operator@abren.local')
const userInitials = computed(
  () =>
    userEmail.value
      .split('@')[0]
      .split(/[.\-_]/)
      .filter(Boolean)
      .slice(0, 2)
      .map((segment) => (segment && segment[0] ? segment[0].toUpperCase() : ''))
      .join('') || 'AB',
)

function canAccess(item: NavigationItem): boolean {
  if (!item.permissions?.length) return true
  return item.permissions.every((permission) => authStore.hasPermission(permission))
}

function isItemActive(item: NavigationItem): boolean {
  if (item.href) {
    return route.path === item.href
  }

  if (item.to?.name) {
    return route.name === item.to.name
  }

  if (item.to?.path) {
    return route.path === item.to.path
  }

  return false
}

function toggleSidebar() {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

function closeMobileSidebar() {
  isMobileSidebarOpen.value = false
}

async function handleLogout() {
  authStore.logout()
  await router.push('/login')
}
</script>

<template>
  <div class="flex min-h-screen bg-[var(--app-canvas)] text-[var(--color-neutral-900)]">
    <div
      v-if="isMobileSidebarOpen"
      class="fixed inset-0 z-30 bg-slate-950/30 backdrop-blur-[2px] lg:hidden"
      @click="closeMobileSidebar"
    />

    <aside
      :class="[
        'fixed inset-y-0 left-0 z-40 flex w-[19rem] flex-col border-r border-[color:var(--color-neutral-200)] bg-[linear-gradient(180deg,#ffffff,rgba(248,250,252,0.96))] transition-transform duration-200 lg:static lg:translate-x-0',
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full',
        isSidebarCollapsed ? 'lg:w-[5.5rem]' : 'lg:w-[19rem]',
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
          <div v-if="!isSidebarCollapsed" class="min-w-0">
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
            <component :is="isSidebarCollapsed ? PanelLeftOpen : PanelLeftClose" class="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        v-if="!isSidebarCollapsed"
        class="border-b border-[color:var(--color-neutral-200)] px-4 py-3"
      >
        <div
          class="rounded-2xl bg-[linear-gradient(145deg,rgba(99,102,241,0.10),rgba(59,130,246,0.04),rgba(255,255,255,0.96))] p-3.5 ring-1 ring-[color:var(--color-neutral-200)]"
        >
          <p
            class="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-neutral-500)]"
          >
            Current workspace
          </p>
          <p class="mt-2 text-sm font-semibold text-[var(--color-neutral-900)]">
            {{ currentTitle }}
          </p>
          <p class="mt-1 line-clamp-2 text-xs leading-5 text-[var(--color-neutral-600)]">
            {{ currentDescription }}
          </p>
        </div>
      </div>

      <nav class="flex-1 space-y-4 overflow-y-auto px-3 py-3">
        <div v-for="group in startGroups" :key="group.title" class="space-y-2">
          <p
            v-if="!isSidebarCollapsed"
            class="px-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-neutral-500)]"
          >
            {{ group.title }}
          </p>
          <RouterLink
            v-for="item in group.items.filter(canAccess)"
            :key="item.label"
            :to="item.href || item.to!"
            :class="[
              'group flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition-colors',
              isItemActive(item)
                ? 'bg-[var(--color-primary-600)] text-white shadow-[0_14px_28px_rgba(79,70,229,0.22)]'
                : 'text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-100)]',
              isSidebarCollapsed ? 'justify-center px-0' : '',
            ]"
            @click="closeMobileSidebar"
          >
            <component :is="item.icon" class="h-4 w-4 shrink-0" />
            <span v-if="!isSidebarCollapsed" class="truncate">{{ item.label }}</span>
          </RouterLink>
        </div>

        <div class="space-y-3">
          <div v-for="group in businessGroups" :key="group.title" class="space-y-1.5">
            <p
              v-if="!isSidebarCollapsed"
              class="px-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-neutral-500)]"
            >
              {{ group.title }}
            </p>
            <RouterLink
              v-for="item in group.items.filter(canAccess)"
              :key="`${group.title}-${item.label}`"
              :to="item.href || item.to!"
              :class="[
                'group flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition-colors',
                isItemActive(item)
                  ? 'bg-[var(--color-neutral-900)] text-white'
                  : 'text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-100)]',
                isSidebarCollapsed ? 'justify-center px-0' : '',
              ]"
              @click="closeMobileSidebar"
            >
              <component :is="item.icon || ChevronRight" class="h-4 w-4 shrink-0" />
              <span v-if="!isSidebarCollapsed" class="truncate">{{ item.label }}</span>
            </RouterLink>
          </div>
        </div>

        <div class="space-y-3 border-t border-[color:var(--color-neutral-200)] pt-4">
          <div v-for="group in platformGroups" :key="group.title" class="space-y-1.5">
            <p
              v-if="!isSidebarCollapsed"
              class="px-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-neutral-500)]"
            >
              {{ group.title }}
            </p>
            <RouterLink
              v-for="item in group.items.filter(canAccess)"
              :key="`${group.title}-${item.label}`"
              :to="item.href || item.to!"
              :class="[
                'group flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition-colors',
                isItemActive(item)
                  ? 'bg-[var(--color-neutral-900)] text-white'
                  : 'text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-neutral-900)]',
                isSidebarCollapsed ? 'justify-center px-0' : '',
              ]"
              @click="closeMobileSidebar"
            >
              <component :is="item.icon || ChevronRight" class="h-4 w-4 shrink-0" />
              <span v-if="!isSidebarCollapsed" class="truncate">{{ item.label }}</span>
            </RouterLink>
          </div>
        </div>
      </nav>

      <div class="border-t border-[color:var(--color-neutral-200)] p-3">
        <button
          type="button"
          :class="[
            'flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium text-[var(--color-danger-700)] transition-colors hover:bg-[var(--color-danger-50)]',
            isSidebarCollapsed ? 'justify-center px-0' : '',
          ]"
          @click="handleLogout"
        >
          <LogOut class="h-4 w-4 shrink-0" />
          <span v-if="!isSidebarCollapsed">Logout</span>
        </button>
      </div>
    </aside>

    <main class="flex min-w-0 flex-1 flex-col">
      <header
        class="sticky top-0 z-20 border-b border-[color:var(--color-neutral-200)] bg-[rgba(248,249,250,0.88)] backdrop-blur"
      >
        <div class="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div class="flex min-w-0 items-center gap-3">
            <button
              class="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[color:var(--color-neutral-200)] bg-white text-[var(--color-neutral-700)] lg:hidden"
              type="button"
              @click="isMobileSidebarOpen = true"
            >
              <Menu class="h-4 w-4" />
            </button>

            <div class="hidden min-w-0 md:block">
              <AppBreadcrumb />
            </div>
          </div>

          <div class="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              class="hidden items-center gap-2 rounded-2xl border border-[color:var(--color-neutral-200)] bg-white px-3 py-2 text-sm text-[var(--color-neutral-600)] shadow-sm transition-colors hover:bg-[var(--color-neutral-100)] md:inline-flex"
            >
              <Search class="h-4 w-4" />
              <span>Search records and actions</span>
              <span
                class="ml-2 inline-flex items-center gap-1 rounded-lg bg-[var(--color-neutral-100)] px-2 py-0.5 text-[11px]"
              >
                <Command class="h-3 w-3" />
                K
              </span>
            </button>

            <button
              type="button"
              class="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[color:var(--color-neutral-200)] bg-white text-[var(--color-neutral-600)] shadow-sm"
            >
              <Bell class="h-4 w-4" />
            </button>

            <div class="hidden h-8 w-px bg-[var(--color-neutral-200)] sm:block" />

            <div
              class="flex items-center gap-3 rounded-2xl border border-[color:var(--color-neutral-200)] bg-white px-3 py-2 shadow-sm"
            >
              <div class="hidden text-right sm:block">
                <p class="text-sm font-semibold text-[var(--color-neutral-900)]">
                  {{ tenantName }}
                </p>
                <p class="text-xs text-[var(--color-neutral-500)]">{{ userEmail }}</p>
              </div>
              <div
                class="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-neutral-900)] text-sm font-semibold text-white"
              >
                {{ userInitials }}
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between gap-4 px-4 py-1 sm:px-6 md:hidden">
          <AppBreadcrumb />
        </div>
        <div class="hidden px-4 py-2 sm:px-6 md:block">
          <div id="command-bar-portal" />
        </div>
      </header>

      <div class="flex-1 overflow-y-auto">
        <div class="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">
          <RouterView />
        </div>
      </div>
    </main>
  </div>
</template>
