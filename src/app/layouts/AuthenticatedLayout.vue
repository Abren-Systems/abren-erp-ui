<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { modules } from '@/modules'
import { Button } from '@/core/ui/button'
import { 
  LayoutDashboard, 
  LogOut,
  ChevronRight,
  Settings
} from 'lucide-vue-next'

const route = useRoute()

// Combine dashboard with dynamic module menu items
const coreItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/app' },
]

const moduleItems = modules.flatMap(m => m.menuItems.map(item => ({
  ...item,
  // If route is name, we might need a resolver, but href is simpler for mock
  href: item.href || `/app/${m.id}/${item.label.toLowerCase().replace(/ /g, '-')}` 
})))

const allMenuItems = [...coreItems, ...moduleItems]
</script>

<template>
  <div class="flex h-screen bg-neutral-50">
    <!-- Sidebar -->
    <aside class="w-64 border-r border-neutral-200 bg-white flex flex-col">
      <div class="p-6">
        <h1 class="text-xl font-bold text-primary-600">Abren ERP</h1>
      </div>

      <nav class="flex-1 px-4 space-y-1">
        <a 
          v-for="item in allMenuItems" 
          :key="item.label"
          :href="item.href"
          :class="[
            'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
            route.path === item.href 
              ? 'bg-primary-50 text-primary-900' 
              : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
          ]"
        >
          <component :is="item.icon" v-if="item.icon" class="mr-3 h-5 w-5" />
          <div v-else class="mr-3 h-5 w-5 flex items-center justify-center">
             <ChevronRight class="h-4 w-4" />
          </div>
          {{ item.label }}
        </a>
      </nav>

      <div class="p-4 border-t border-neutral-200">
        <Button variant="ghost" class="w-full justify-start text-danger-500 hover:text-danger-600 hover:bg-danger-50">
          <LogOut class="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-auto">
      <header class="h-16 border-b border-neutral-200 bg-white flex items-center justify-between px-8 sticky top-0 z-10">
        <h2 class="text-lg font-semibold text-neutral-900">
          {{ route.name || 'Dashboard' }}
        </h2>
        <div class="flex items-center space-x-4">
          <Button variant="ghost" size="icon" class="rounded-full">
             <Settings class="h-5 w-5 text-neutral-500" />
          </Button>
          <div class="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-xs">
            AD
          </div>
        </div>
      </header>
      
      <div class="p-8">
        <RouterView />
      </div>
    </main>
  </div>
</template>
