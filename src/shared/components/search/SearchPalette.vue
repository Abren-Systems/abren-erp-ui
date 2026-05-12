<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Command, X, ArrowRight, CornerDownLeft } from 'lucide-vue-next'
import { useSearch } from '@/shared/search/useSearch'

const router = useRouter()
const { isPaletteOpen, searchQuery, results, closePalette } = useSearch()

const inputRef = ref<HTMLInputElement | null>(null)
const selectedIndex = ref(0)

watch(isPaletteOpen, async (isOpen) => {
  if (isOpen) {
    selectedIndex.value = 0
    await nextTick()
    inputRef.value?.focus()
  }
})

watch(results, () => {
  selectedIndex.value = 0
})

function handleSelect(path: string) {
  router.push(path)
  closePalette()
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    selectedIndex.value = (selectedIndex.value + 1) % results.value.length
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    selectedIndex.value = (selectedIndex.value - 1 + results.value.length) % results.value.length
  } else if (e.key === 'Enter') {
    e.preventDefault()
    if (results.value[selectedIndex.value]) {
      handleSelect(results.value[selectedIndex.value].path)
    }
  }
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-150 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-100 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isPaletteOpen"
      class="fixed inset-0 z-[100] flex items-start justify-center bg-[var(--color-neutral-800)]/70 pt-[12vh] backdrop-blur-[6px]"
      @click.self="closePalette"
    >
      <div
        class="w-full max-w-[600px] overflow-hidden rounded-md border border-[var(--color-neutral-200)] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] ring-1 ring-black/5"
        @keydown="onKeydown"
      >
        <!-- Search Header -->
        <div class="relative flex items-center border-b border-[var(--color-neutral-100)] px-4">
          <Search class="h-4 w-4 text-[var(--color-neutral-400)]" />
          <input
            ref="inputRef"
            v-model="searchQuery"
            type="text"
            placeholder="Search screens, records, and help..."
            class="h-12 w-full bg-transparent px-3 text-[14px] text-[var(--color-neutral-900)] outline-none placeholder:text-[var(--color-neutral-400)]"
          />
          <div
            class="flex items-center gap-1.5 rounded-sm border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--color-neutral-500)]"
          >
            ESC
          </div>
        </div>

        <!-- Results List -->
        <div class="max-h-[380px] overflow-y-auto py-2">
          <div v-if="results.length > 0">
            <div
              v-for="(item, index) in results"
              :key="item.id"
              class="group flex cursor-pointer items-center gap-3 px-4 py-2 transition-colors"
              :class="
                index === selectedIndex
                  ? 'bg-[var(--color-neutral-100)]'
                  : 'hover:bg-[var(--color-neutral-50)]'
              "
              @mouseenter="selectedIndex = index"
              @click="handleSelect(item.path)"
            >
              <div
                class="flex h-8 w-8 items-center justify-center rounded-sm"
                :class="
                  index === selectedIndex
                    ? 'bg-white shadow-sm text-[var(--color-primary-600)]'
                    : 'bg-[var(--color-neutral-50)] text-[var(--color-neutral-400)]'
                "
              >
                <ArrowRight class="h-4 w-4" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-[13px] font-semibold text-[var(--color-neutral-900)]">
                  {{ item.title }}
                </p>
                <p class="text-[11px] text-[var(--color-neutral-500)]">{{ item.category }}</p>
              </div>
              <div
                v-if="index === selectedIndex"
                class="flex items-center gap-1 text-[var(--color-neutral-400)]"
              >
                <span class="text-[10px] font-bold">ENTER</span>
                <CornerDownLeft class="h-3 w-3" />
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div
            v-else-if="searchQuery"
            class="flex flex-col items-center justify-center py-12 text-center"
          >
            <div
              class="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-neutral-50)]"
            >
              <Search class="h-6 w-6 text-[var(--color-neutral-300)]" />
            </div>
            <p class="text-[13px] font-semibold text-[var(--color-neutral-900)]">
              No results found for "{{ searchQuery }}"
            </p>
            <p class="mt-1 text-[11px] text-[var(--color-neutral-500)]">
              Try searching for a module like "General Ledger" or "Banking"
            </p>
          </div>

          <!-- Initial State -->
          <div v-else class="px-4 py-3">
            <p
              class="text-[var(--text-micro)] font-bold uppercase tracking-widest text-[var(--color-neutral-400)]"
            >
              Recent & Suggestions
            </p>
            <div class="mt-3 flex flex-wrap gap-2">
              <button
                v-for="suggest in ['Banking', 'General Ledger', 'Inventory']"
                :key="suggest"
                class="rounded-sm border border-[var(--color-neutral-200)] bg-white px-2 py-1 text-[11px] font-medium text-[var(--color-neutral-600)] transition-colors hover:bg-[var(--color-neutral-50)] hover:text-[var(--color-neutral-900)]"
                @click="searchQuery = suggest"
              >
                {{ suggest }}
              </button>
            </div>
          </div>
        </div>

        <!-- Palette Footer -->
        <div
          class="flex items-center justify-between border-t border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)] px-4 py-2"
        >
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-1.5 text-[10px] text-[var(--color-neutral-400)]">
              <kbd
                class="flex h-4 w-4 items-center justify-center rounded-sm border border-[var(--color-neutral-200)] bg-white font-bold"
                >↑</kbd
              >
              <kbd
                class="flex h-4 w-4 items-center justify-center rounded-sm border border-[var(--color-neutral-200)] bg-white font-bold"
                >↓</kbd
              >
              <span>to navigate</span>
            </div>
            <div class="flex items-center gap-1.5 text-[10px] text-[var(--color-neutral-400)]">
              <kbd
                class="flex h-4 w-6 items-center justify-center rounded-sm border border-[var(--color-neutral-200)] bg-white font-bold"
                >↵</kbd
              >
              <span>to select</span>
            </div>
          </div>
          <div class="flex items-center gap-1.5 text-[10px] text-[var(--color-neutral-400)]">
            <Command class="h-3 w-3" />
            <span class="font-bold">K</span>
            <span>to toggle</span>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
