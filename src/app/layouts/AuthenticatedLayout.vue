<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/shared/auth/auth.store'
import AppSidebar from '../components/AppSidebar.vue'
import AppTopPane from '../components/AppTopPane.vue'

const router = useRouter()
const authStore = useAuthStore()

const isSidebarCollapsed = ref(false)
const isMobileSidebarOpen = ref(false)

const tenantName = computed(() => authStore.currentTenant?.name || 'Current Tenant')
const userEmail = computed(() => authStore.currentUser?.email || 'operator@abren.local')
const userInitials = computed(
  () =>
    (userEmail.value.split('@')[0] || '')
      .split(/[.\-_]/)
      .filter(Boolean)
      .slice(0, 2)
      .map((segment) => (segment && segment[0] ? segment[0].toUpperCase() : ''))
      .join('') || 'AB',
)

async function handleLogout() {
  authStore.logout()
  await router.push('/login')
}
</script>

<template>
  <div class="flex min-h-screen bg-[var(--color-neutral-50)] text-[var(--color-neutral-900)]">
    <!-- Mobile overlay -->
    <div
      v-if="isMobileSidebarOpen"
      class="fixed inset-0 z-30 bg-slate-950/30 backdrop-blur-[2px] lg:hidden"
      @click="isMobileSidebarOpen = false"
    />

    <!-- Foundation 0.2: Sidebar -->
    <AppSidebar v-model:collapsed="isSidebarCollapsed" v-model:mobileOpen="isMobileSidebarOpen" />

    <main class="flex min-w-0 flex-1 flex-col">
      <!-- Foundation 0.1: Top Pane -->
      <AppTopPane
        :tenant-name="tenantName"
        :user-email="userEmail"
        :user-initials="userInitials"
        @logout="handleLogout"
      />

      <!-- Foundation 0.3/0.4: Workspace / Working Area -->
      <div class="flex-1 overflow-y-auto p-2.5">
        <RouterView />
      </div>
    </main>
  </div>
</template>
