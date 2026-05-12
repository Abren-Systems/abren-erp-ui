<script setup lang="ts">
import { AppBreadcrumb } from '@/shared/components/primitives'
import { Bell, Command, LogOut, Menu, Search } from 'lucide-vue-next'

interface Props {
  tenantName: string
  userEmail: string
  userInitials: string
}

defineProps<Props>()

const emit = defineEmits<{
  'open-mobile-sidebar': []
  search: []
  notifications: []
  logout: []
}>()
</script>

<template>
  <header
    class="sticky top-0 z-20 border-b border-[color:var(--color-neutral-200)] bg-[rgba(248,249,250,0.88)] backdrop-blur"
  >
    <div class="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
      <div class="flex min-w-0 items-center gap-3">
        <button
          class="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[color:var(--color-neutral-200)] bg-white text-[var(--color-neutral-700)] lg:hidden"
          type="button"
          @click="emit('open-mobile-sidebar')"
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
          @click="emit('search')"
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
          @click="emit('notifications')"
        >
          <Bell class="h-4 w-4" />
        </button>

        <div class="hidden h-8 w-px bg-[var(--color-neutral-200)] sm:block" />

        <div
          class="flex items-center gap-2 rounded-2xl border border-[color:var(--color-neutral-200)] bg-white px-3 py-1.5 shadow-sm"
        >
          <div class="hidden text-right sm:block">
            <p class="text-xs font-bold text-[var(--color-neutral-900)]">
              {{ tenantName }}
            </p>
            <p class="text-[10px] text-[var(--color-neutral-500)]">{{ userEmail }}</p>
          </div>
          <div
            class="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-neutral-900)] text-xs font-semibold text-white"
          >
            {{ userInitials }}
          </div>
          <button
            type="button"
            class="ml-1 flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-neutral-400)] transition-colors hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-danger-600)]"
            title="Logout"
            @click="emit('logout')"
          >
            <LogOut class="h-4 w-4" />
          </button>
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
</template>
