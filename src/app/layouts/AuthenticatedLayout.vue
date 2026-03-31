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
import { Button } from '@/shared/components/button'
import { LayoutDashboard, LogOut, ChevronRight, Library, Cpu, Settings } from 'lucide-vue-next'

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
    href: item.href || `/app/${m.id}/${item.label.toLowerCase().replace(/ /g, '-')}`,
  })),
)

// Platform/Infrastructure Navigation — same flattening logic as businessItems
const platformItems = platformModules.flatMap((m: PlatformEngine) =>
  m.menuItems.map((item: MenuItem) => ({
    ...item,
    href: item.href || `/app/${m.id}/${item.label.toLowerCase().replace(/ /g, '-')}`,
  })),
)

async function handleLogout() {
  authStore.logout()
  await router.push('/login')
}
</script>

<template>
  <div class="flex h-screen bg-neutral-50 overflow-hidden">
    <!-- Sidebar -->
    <aside class="w-64 border-r border-neutral-200 bg-white flex flex-col shelf-shadow z-20">
      <div class="p-6">
        <h1 class="text-xl font-bold text-primary-600 tracking-tight">Abren ERP</h1>
      </div>

      <nav class="flex-1 px-4 space-y-8 overflow-y-auto pt-2 scrollbar-none pb-8">
        <!-- Business Section -->
        <div>
          <h3
            class="px-3 text-[10.5px] font-bold text-neutral-400 uppercase tracking-[0.1em] mb-3 flex items-center opacity-60"
          >
            <Library class="h-3 w-3 mr-2" />
            Applications
          </h3>
          <div class="space-y-0.5">
            <RouterLink
              v-for="item in [...coreItems, ...businessItems]"
              :key="item.label"
              :to="item.href"
              :class="[
                'flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 group',
                route.path === item.href
                  ? 'bg-primary-50 text-primary-900 ring-1 ring-primary-100 shadow-sm'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 border-transparent',
              ]"
            >
              <component
                :is="item.icon"
                v-if="item.icon"
                :class="[
                  'mr-3 h-5 w-5 transition-colors',
                  route.path === item.href
                    ? 'text-primary-600'
                    : 'text-neutral-400 group-hover:text-neutral-600',
                ]"
              />
              <div v-else class="mr-3 h-5 w-5 flex items-center justify-center">
                <ChevronRight class="h-4 w-4 text-neutral-300" />
              </div>
              {{ item.label }}
            </RouterLink>
          </div>
        </div>

        <!-- Platform Section -->
        <div>
          <h3
            class="px-3 text-[10.5px] font-bold text-neutral-400 uppercase tracking-[0.1em] mb-3 flex items-center opacity-60"
          >
            <Cpu class="h-3 w-3 mr-2" />
            Platform Engine
          </h3>
          <div class="space-y-0.5">
            <RouterLink
              v-for="item in platformItems"
              :key="item.label"
              :to="item.href"
              :class="[
                'flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 group',
                route.path === item.href
                  ? 'bg-neutral-100 text-neutral-900 ring-1 ring-neutral-200 shadow-sm'
                  : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 border-transparent',
              ]"
            >
              <component
                :is="item.icon"
                v-if="item.icon"
                :class="[
                  'mr-3 h-5 w-5 transition-colors',
                  route.path === item.href
                    ? 'text-neutral-900'
                    : 'text-neutral-400 group-hover:text-neutral-600',
                ]"
              />
              <div v-else class="mr-3 h-5 w-5 flex items-center justify-center">
                <ChevronRight class="h-4 w-4 text-neutral-300" />
              </div>
              {{ item.label }}
            </RouterLink>
          </div>
        </div>
      </nav>

      <div class="p-4 border-t border-neutral-100 bg-neutral-50/50">
        <Button
          variant="ghost"
          class="w-full justify-start text-danger-500 hover:text-danger-600 hover:bg-danger-50 h-10"
          @click="handleLogout"
        >
          <LogOut class="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col overflow-hidden bg-white">
      <header
        class="h-16 border-b border-neutral-100 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10 shrink-0"
      >
        <h2 class="text-lg font-bold text-neutral-900 tracking-tight">
          {{ route.name || 'Dashboard' }}
        </h2>
        <div class="flex items-center space-x-3">
          <Button variant="ghost" size="icon" class="rounded-full hover:bg-neutral-100 h-9 w-9">
            <Settings class="h-5 w-5 text-neutral-500" />
          </Button>
          <div
            class="h-9 w-9 rounded-full border-2 border-primary-100 bg-primary-600 flex items-center justify-center text-white font-bold text-xs ring-offset-2 ring-1 ring-transparent hover:ring-primary-400 cursor-pointer shadow-sm transition-all duration-200"
          >
            AD
          </div>
        </div>
      </header>

      <div class="flex-1 overflow-y-auto p-10 bg-[#fafafa]">
        <div class="max-w-[1400px] mx-auto">
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
