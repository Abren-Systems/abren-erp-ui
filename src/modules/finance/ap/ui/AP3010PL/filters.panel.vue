<script setup lang="ts">
import { ref, watch } from 'vue'
import { AppButton, AppSidePane } from '@/shared/components/primitives'
import { ListFilter, CheckCircle, Calendar } from 'lucide-vue-next'

interface FilterState {
  statuses: string[]
  dateFrom: string
  dateTo: string
}

const props = defineProps<{
  open: boolean
  initialFilters: FilterState
  statusOptions: { label: string; value: string }[]
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'apply', filters: FilterState): void
}>()

const localFilterState = ref<FilterState>({ ...props.initialFilters })

// Sync local state when initialFilters changes (e.g. parent resets)
watch(
  () => props.initialFilters,
  (newVal) => {
    localFilterState.value = { ...newVal }
  },
  { deep: true },
)

function handleReset() {
  localFilterState.value = { statuses: [], dateFrom: '', dateTo: '' }
  emit('apply', localFilterState.value)
}

function handleApply() {
  emit('apply', localFilterState.value)
  emit('update:open', false)
}
</script>

<template>
  <AppSidePane
    :open="open"
    title="Filter Requests"
    width="320px"
    @update:open="emit('update:open', $event)"
  >
    <template #icon>
      <div class="h-6 w-6 rounded-md bg-neutral-100 flex items-center justify-center">
        <ListFilter class="h-3.5 w-3.5 text-neutral-600" />
      </div>
    </template>

    <div class="space-y-6">
      <!-- Status Multi-Select -->
      <div class="space-y-3">
        <h4 class="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Status</h4>
        <div class="grid grid-cols-2 gap-2">
          <label
            v-for="opt in statusOptions"
            :key="opt.value"
            class="flex items-center gap-2 p-2 rounded-lg border border-neutral-100 cursor-pointer hover:bg-neutral-50 transition-colors"
            :class="{
              'bg-primary-50 border-primary-200': localFilterState.statuses.includes(opt.value),
            }"
          >
            <input
              v-model="localFilterState.statuses"
              type="checkbox"
              :value="opt.value"
              class="hidden"
            />
            <div
              class="h-3.5 w-3.5 rounded border flex items-center justify-center"
              :class="
                localFilterState.statuses.includes(opt.value)
                  ? 'bg-primary-600 border-primary-600'
                  : 'bg-white border-neutral-300'
              "
            >
              <CheckCircle
                v-if="localFilterState.statuses.includes(opt.value)"
                :size="10"
                class="text-white"
              />
            </div>
            <span class="text-xs font-medium text-neutral-700">{{ opt.label }}</span>
          </label>
        </div>
      </div>

      <!-- Date Range -->
      <div class="space-y-3">
        <h4 class="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Date Range</h4>
        <div class="space-y-2">
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
              <Calendar :size="12" />
            </span>
            <input
              v-model="localFilterState.dateFrom"
              type="date"
              class="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
              <Calendar :size="12" />
            </span>
            <input
              v-model="localFilterState.dateTo"
              type="date"
              class="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex gap-2">
        <AppButton variant="outline" size="sm" class="flex-1" @click="handleReset">
          Reset
        </AppButton>
        <AppButton variant="primary" size="sm" class="flex-1" @click="handleApply">
          Apply
        </AppButton>
      </div>
    </template>
  </AppSidePane>
</template>
