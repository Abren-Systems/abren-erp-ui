<script setup lang="ts">
import { AppButton } from '@/shared/components/primitives'
import { AlertCircle, RotateCcw, X } from 'lucide-vue-next'

interface Props {
  error: string
  canRetry?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'dismiss'): void
  (e: 'retry'): void
}>()
</script>

<template>
  <div
    class="bg-[var(--color-danger-50)] border-b border-[var(--color-danger-100)] p-[var(--layout-gutter)] animate-in fade-in slide-in-from-top-1"
  >
    <div class="flex items-start gap-3">
      <AlertCircle class="w-4 h-4 text-[var(--color-danger-600)] mt-0.5" />

      <div class="flex-1 min-w-0">
        <h2
          class="text-[10px] font-bold uppercase tracking-tight text-[var(--color-danger-700)] mb-1"
        >
          System Error
        </h2>
        <p class="text-xs text-[var(--color-danger-600)] leading-relaxed">
          {{ error }}
        </p>
      </div>

      <div class="flex items-center gap-2 ml-4">
        <AppButton
          v-if="canRetry"
          variant="outline"
          size="sm"
          class="h-7 bg-white border-[var(--color-danger-200)] text-[var(--color-danger-700)] hover:bg-[var(--color-danger-100)] px-2"
          @click="emit('retry')"
        >
          <RotateCcw class="w-3 h-3 mr-1.5" />
          Retry
        </AppButton>

        <button
          class="p-1 hover:bg-[var(--color-danger-100)] rounded-sm text-[var(--color-danger-400)] transition-colors"
          @click="emit('dismiss')"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>
