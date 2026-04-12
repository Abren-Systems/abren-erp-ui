<script setup lang="ts" generic="T">
import { ref, watch, onMounted, computed, onBeforeUnmount } from 'vue'
import { Input } from '@/shared/components/input'
import { Check, ChevronDown, Loader2 } from 'lucide-vue-next'

export interface ComboboxOption {
  value: string
  label: string
  description?: string
}

const props = defineProps<{
  /** The currently selected value */
  modelValue?: string | null
  /** Async function to fetch options based on a search query */
  fetchOptions: (query: string) => Promise<ComboboxOption[]>
  /** Label describing the field for ARIA */
  ariaLabel?: string
  /** Placeholder for the input */
  placeholder?: string
  /** Debounce delay in ms */
  debounceMs?: number
  /** Disabled state */
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: string | null): void
}>()

const isOpen = ref(false)
const isLoading = ref(false)
const searchQuery = ref('')
const options = ref<ComboboxOption[]>([])
const selectedOption = ref<ComboboxOption | null>(null)
const focusedIndex = ref(-1)

const containerRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

async function triggerFetch(query: string) {
  if (!isOpen.value) return
  isLoading.value = true
  try {
    options.value = await props.fetchOptions(query)
    focusedIndex.value = -1 // reset focus
  } catch (error) {
    console.error('Combobox fetch error:', error)
    options.value = []
  } finally {
    isLoading.value = false
  }
}

watch(searchQuery, (newQuery) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    void triggerFetch(newQuery)
  }, props.debounceMs ?? 300)
})

watch(
  () => props.modelValue,
  async (newVal) => {
    // If modelValue turns null/empty externally, clear selection
    if (!newVal) {
      selectedOption.value = null
      searchQuery.value = ''
      return
    }
    // Try to find the selected option in our current list
    const found = options.value.find((opt) => opt.value === newVal)
    if (found) {
      selectedOption.value = found
      searchQuery.value = found.label
    } else {
      // If not found in current options (e.g. initial load), we might need an initial fetch
      // For simplicity, we just set the query to the ID if we don't know the label yet.
      // In a full implementation, `fetchById` might be passed as well.
      searchQuery.value = newVal
    }
  },
  { immediate: true },
)

function handleSelect(option: ComboboxOption) {
  selectedOption.value = option
  searchQuery.value = option.label
  emit('update:modelValue', option.value)
  close()
}

function close() {
  isOpen.value = false
  setTimeout(() => {
    if (selectedOption.value) {
      searchQuery.value = selectedOption.value.label
    } else {
      searchQuery.value = ''
    }
  }, 100)
}

function open() {
  if (props.disabled) return
  isOpen.value = true
  searchQuery.value = '' // Clear on open to allow searching fresh
  void triggerFetch('')
}

function handleKeyDown(e: KeyboardEvent) {
  if (!isOpen.value) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
      open()
      e.preventDefault()
    }
    return
  }

  if (e.key === 'ArrowDown') {
    focusedIndex.value = Math.min(focusedIndex.value + 1, options.value.length - 1)
    e.preventDefault()
  } else if (e.key === 'ArrowUp') {
    focusedIndex.value = Math.max(focusedIndex.value - 1, 0)
    e.preventDefault()
  } else if (e.key === 'Enter') {
    if (focusedIndex.value >= 0 && focusedIndex.value < options.value.length) {
      handleSelect(options.value[focusedIndex.value])
    }
    e.preventDefault()
  } else if (e.key === 'Escape') {
    close()
    e.preventDefault()
  }
}

function handleClickOutside(e: MouseEvent) {
  if (isOpen.value && containerRef.value && !containerRef.value.contains(e.target as Node)) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  if (debounceTimer) clearTimeout(debounceTimer)
})

const handleFocus = () => {
  if (!selectedOption.value && !isOpen.value) open()
}
</script>

<template>
  <div class="relative w-full" ref="containerRef">
    <div class="relative flex items-center">
      <Input
        ref="inputRef"
        v-model="searchQuery"
        type="text"
        :placeholder="placeholder ?? 'Search...'"
        :aria-label="ariaLabel"
        :disabled="disabled"
        class="w-full pr-8"
        @focus="handleFocus"
        @click="open"
        @keydown="handleKeyDown"
      />
      <button
        type="button"
        tabindex="-1"
        :disabled="disabled"
        class="absolute right-0 top-0 flex h-full w-8 items-center justify-center text-neutral-400 hover:text-neutral-600 disabled:opacity-50"
        @click="isOpen ? close() : open()"
      >
        <Loader2 v-if="isLoading" class="h-4 w-4 animate-spin text-neutral-500" />
        <ChevronDown v-else class="h-4 w-4" />
      </button>
    </div>

    <!-- Dropdown Panel -->
    <div
      v-if="isOpen"
      class="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-neutral-200 bg-white py-1 shadow-lg shadow-black/5 dark:border-neutral-800 dark:bg-neutral-950"
      role="listbox"
    >
      <div
        v-if="isLoading && options.length === 0"
        class="py-6 text-center text-sm text-neutral-500"
      >
        Searching...
      </div>

      <div v-else-if="options.length === 0" class="py-6 text-center text-sm text-neutral-500">
        No results found.
      </div>

      <div
        v-for="(option, index) in options"
        :key="option.value"
        role="option"
        :aria-selected="selectedOption?.value === option.value"
        class="relative flex cursor-default select-none items-center py-2 px-3 text-sm outline-none transition-colors"
        :class="[
          focusedIndex === index
            ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800'
            : 'text-neutral-700 dark:text-neutral-300',
          selectedOption?.value === option.value ? 'bg-blue-50/50 text-blue-600 font-medium' : '',
        ]"
        @mouseenter="focusedIndex = index"
        @click="handleSelect(option)"
      >
        <div class="flex-1 truncate">
          {{ option.label }}
          <span
            v-if="option.description"
            class="ml-2 text-xs text-neutral-400 font-mono hidden sm:inline"
          >
            {{ option.description }}
          </span>
        </div>
        <Check
          v-if="selectedOption?.value === option.value"
          class="ml-2 h-4 w-4 shrink-0 text-blue-600"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Optional styling to ensure z-index context works inside grid lines */
</style>
