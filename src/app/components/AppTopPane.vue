<script setup lang="ts">
import { ref } from 'vue'
import { Bell, Command, LogOut, Moon, Search, Sun } from 'lucide-vue-next'

interface Props {
  tenantName: string
  userEmail: string
  userInitials: string
}

defineProps<Props>()

const emit = defineEmits<{
  search: []
  notifications: []
  logout: []
}>()

const isDark = ref(document.documentElement.classList.contains('dark'))
function toggleDarkMode() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark')
}
</script>

<template>
  <header
    class="sticky top-0 z-20 border-b border-[color:var(--color-neutral-200)] bg-[rgba(248,249,250,0.88)] backdrop-blur"
  >
    <div
      class="flex items-center justify-end gap-2 sm:gap-3"
      :style="{ padding: `var(--chrome-topbar-py) var(--layout-gutter)` }"
    >
      <button
        type="button"
        class="hidden items-center gap-2 rounded-md border border-[color:var(--color-neutral-200)] bg-white px-3 py-2 text-sm text-[var(--color-neutral-600)] shadow-sm transition-colors hover:bg-[var(--color-neutral-100)] md:inline-flex"
        @click="emit('search')"
      >
        <Search class="h-4 w-4" />
        <span>Search records and actions</span>
        <span
          class="ml-2 inline-flex items-center gap-1 rounded-sm bg-[var(--color-neutral-100)] px-2 py-0.5 text-[11px]"
        >
          <Command class="h-3 w-3" />
          K
        </span>
      </button>

      <button
        type="button"
        class="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[color:var(--color-neutral-200)] bg-white text-[var(--color-neutral-600)] shadow-sm"
        @click="emit('notifications')"
      >
        <Bell class="h-4 w-4" />
      </button>

      <button
        type="button"
        class="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[color:var(--color-neutral-200)] bg-white text-[var(--color-neutral-600)] shadow-sm"
        title="Toggle Dark Mode"
        @click="toggleDarkMode"
      >
        <Sun v-if="isDark" class="h-4 w-4" />
        <Moon v-else class="h-4 w-4" />
      </button>

      <div class="hidden h-8 w-px bg-[var(--color-neutral-200)] sm:block" />

      <div
        class="flex items-center gap-2 rounded-md border border-[color:var(--color-neutral-200)] bg-white px-3 py-1.5 shadow-sm"
      >
        <div class="hidden text-right sm:block">
          <p class="text-xs font-bold text-[var(--color-neutral-900)]">
            {{ tenantName }}
          </p>
          <p class="text-[10px] text-[var(--color-neutral-500)]">{{ userEmail }}</p>
        </div>
        <div
          class="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--color-neutral-900)] text-xs font-semibold text-white"
        >
          {{ userInitials }}
        </div>
        <button
          type="button"
          class="ml-1 flex h-8 w-8 items-center justify-center rounded-md text-[var(--color-neutral-400)] transition-colors hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-danger-600)]"
          title="Logout"
          @click="emit('logout')"
        >
          <LogOut class="h-4 w-4" />
        </button>
      </div>
    </div>
  </header>
</template>
