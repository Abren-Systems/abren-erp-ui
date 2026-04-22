<script setup lang="ts">
/**
 * AuthenticatedLayout
 *
 * Root shell for all authenticated `/app/*` routes.
 * Renders a fixed sidebar with two navigation sections:
 *   - Applications: Dashboard + registered BusinessDomain modules
 *   - Platform Engine: registered PlatformEngine modules
 *
 * Navigation items are derived dynamically from the module registry
 * (`src/modules/index.ts`), so adding a new module automatically
 * surfaces it in the sidebar without touching this component.
 *
 * The active route is highlighted via exact `route.path` matching.
 * The header displays the current route name and a static user avatar
 * placeholder (to be replaced with a real profile dropdown).
 */
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { businessModules, platformModules } from '@/modules'
import type { BusinessDomain, PlatformEngine, MenuItem } from '@/shared/types/module.types'
import { useAuthStore } from '@/shared/auth/auth.store'
import { AppButton, AppBreadcrumb } from '@/shared/components/primitives'
import {
  LayoutDashboard,
  LogOut,
  ChevronRight,
  Library,
  Cpu,
  Settings,
  Bell,
  Search,
  Command,
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// Primary Navigation (Dashboard + Business Domains)
const coreItems = [{ label: 'Dashboard', icon: LayoutDashboard, href: '/app' }]

/**
 * Flatten all business module menu items into a single nav list.
 * Falls back to a generated href (`/app/{moduleId}/{label-slug}`) when
 * the module definition does not provide an explicit `href`.
 */
const businessItems = businessModules.flatMap((m: BusinessDomain) =>
  m.menuItems.map((item: MenuItem) => ({
    ...item,
    to: item.route
      ? { name: item.route }
      : { path: item.href || `/app/${m.id}/${item.label.toLowerCase().replace(/ /g, '-')}` },
  })),
)

// Platform/Infrastructure Navigation — same logic
const platformItems = platformModules.flatMap((m: PlatformEngine) =>
  m.menuItems.map((item: MenuItem) => ({
    ...item,
    to: item.route
      ? { name: item.route }
      : { path: item.href || `/app/${m.id}/${item.label.toLowerCase().replace(/ /g, '-')}` },
  })),
)

async function handleLogout() {
  authStore.logout()
  await router.push('/login')
}
</script>

<template>
  <div class="flex h-screen bg-[var(--app-canvas)] overflow-hidden">
    <!-- Sidebar -->
    <aside
      class="w-64 border-r border-[var(--color-neutral-200)] bg-[var(--app-sidebar)] flex flex-col z-20"
    >
      <div class="p-6">
        <h1 class="text-xl font-bold text-[var(--color-primary-600)] tracking-tight">Abren ERP</h1>
      </div>

      <nav class="flex-1 px-4 space-y-8 overflow-y-auto pt-2 scrollbar-none pb-8">
        <!-- Business Section -->
        <div>
          <h3
            class="px-3 text-[10.5px] font-bold text-[var(--color-neutral-400)] uppercase tracking-[0.1em] mb-3 flex items-center opacity-60"
          >
            <Library class="h-3 w-3 mr-2" />
            Applications
          </h3>
          <div class="space-y-0.5">
            <RouterLink
              v-for="item in [...coreItems, ...businessItems]"
              :key="item.label"
              :to="item.href || item.to"
              :class="[
                'flex items-center px-4 py-2 text-sm font-medium rounded-sm transition-all duration-200 group',
                (item.href && route.path === item.href) ||
                (item.to?.name && route.name === item.to.name)
                  ? 'bg-white text-[var(--color-primary-700)] shadow-[0_1px_3px_rgba(0,0,0,0.05)] ring-1 ring-[var(--color-neutral-200)]'
                  : 'text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-200)] hover:text-[var(--color-neutral-900)] border-transparent',
              ]"
            >
              <component
                :is="item.icon"
                v-if="item.icon"
                :class="[
                  'mr-3 h-5 w-5 transition-colors',
                  (item.href && route.path === item.href) ||
                  (item.to?.name && route.name === item.to.name)
                    ? 'text-[var(--color-primary-600)]'
                    : 'text-[var(--color-neutral-500)] group-hover:text-[var(--color-neutral-700)]',
                ]"
              />
              <div v-else class="mr-3 h-5 w-5 flex items-center justify-center">
                <ChevronRight class="h-4 w-4 text-[var(--color-neutral-300)]" />
              </div>
              {{ item.label }}
            </RouterLink>
          </div>
        </div>

        <!-- Platform Section -->
        <div>
          <h3
            class="px-3 text-[10.5px] font-bold text-[var(--color-neutral-400)] uppercase tracking-[0.1em] mb-3 flex items-center opacity-60"
          >
            <Cpu class="h-3 w-3 mr-2" />
            Platform Engine
          </h3>
          <div class="space-y-0.5">
            <RouterLink
              v-for="item in platformItems"
              :key="item.label"
              :to="item.href || item.to"
              :class="[
                'flex items-center px-4 py-2 text-sm font-medium rounded-sm transition-all duration-200 group',
                (item.href && route.path === item.href) ||
                (item.to?.name && route.name === item.to.name)
                  ? 'bg-white text-[var(--color-neutral-900)] shadow-[0_1px_3px_rgba(0,0,0,0.05)] ring-1 ring-[var(--color-neutral-200)]'
                  : 'text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-200)] hover:text-[var(--color-neutral-900)] border-transparent',
              ]"
            >
              <component
                :is="item.icon"
                v-if="item.icon"
                :class="[
                  'mr-3 h-5 w-5 transition-colors',
                  (item.href && route.path === item.href) ||
                  (item.to?.name && route.name === item.to.name)
                    ? 'text-[var(--color-neutral-900)]'
                    : 'text-[var(--color-neutral-500)] group-hover:text-[var(--color-neutral-700)]',
                ]"
              />
              <div v-else class="mr-3 h-5 w-5 flex items-center justify-center">
                <ChevronRight class="h-4 w-4 text-[var(--color-neutral-300)]" />
              </div>
              {{ item.label }}
            </RouterLink>
          </div>
        </div>
      </nav>

      <div class="p-4 border-t border-[var(--color-neutral-200)] bg-[var(--app-sidebar)]">
        <AppButton
          variant="stealth"
          class="w-full justify-start text-[var(--color-danger-600)] hover:bg-[var(--color-danger-50)]"
          @click="handleLogout"
        >
          <LogOut class="mr-3 h-5 w-5" />
          Logout
        </AppButton>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col overflow-hidden bg-[var(--app-canvas)]">
      <header
        class="h-14 border-b border-[var(--color-neutral-200)] bg-white flex items-center justify-between px-6 sticky top-0 z-10 shrink-0"
      >
        <div class="flex items-center gap-6">
          <div
            class="flex items-center gap-2 text-[var(--color-neutral-500)] px-3 py-1 bg-[var(--color-neutral-50)] rounded-sm border border-[var(--color-neutral-200)] cursor-text hover:bg-[var(--color-neutral-100)] transition-colors min-w-[240px]"
          >
            <Search :size="14" />
            <span class="text-xs">Search global records...</span>
            <span class="ml-auto flex items-center gap-1 text-[10px] opacity-50">
              <Command :size="10" />
              <span>K</span>
            </span>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <AppButton variant="stealth">
            <Bell :size="18" class="text-[var(--color-neutral-500)]" />
          </AppButton>
          <AppButton variant="stealth">
            <Settings :size="18" class="text-[var(--color-neutral-500)]" />
          </AppButton>

          <div class="h-6 w-px bg-[var(--color-neutral-200)] mx-2" />

          <div class="flex items-center gap-3 pl-2">
            <div class="text-right hidden sm:block">
              <p class="text-[12px] font-bold leading-none text-[var(--color-neutral-900)]">
                Abren Admin
              </p>
              <p class="text-[10px] text-[var(--color-neutral-500)] mt-1">Tenant Administrator</p>
            </div>
            <div
              class="h-8 w-8 rounded-full border border-[var(--color-primary-100)] bg-[var(--color-primary-600)] flex items-center justify-center text-white font-bold text-xs shadow-sm"
            >
              AD
            </div>
          </div>
        </div>
      </header>

      <!-- Sub-Header / Breadcrumb / Command Bar Area -->
      <div
        class="h-10 bg-white border-b border-[var(--color-neutral-200)] flex items-center justify-between px-6 shrink-0"
      >
        <AppBreadcrumb />
        <div id="command-bar-portal" />
      </div>

      <div class="flex-1 overflow-y-auto p-6">
        <div class="w-full">
          <RouterView />
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.shelf-shadow {
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.03);
}

.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
