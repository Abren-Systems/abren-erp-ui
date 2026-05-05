<script setup lang="ts">
import { cn } from '@/shared/utils'

interface Props {
  title: string
  description?: string
  eyebrow?: string
  dense?: boolean
  plain?: boolean
  class?: string
}

withDefaults(defineProps<Props>(), {
  description: '',
  eyebrow: '',
  dense: false,
  plain: false,
  class: '',
})
</script>

<template>
  <!-- Plain mode: compact single-row header (Acumatica-style) -->
  <header v-if="plain" :class="cn('flex items-center justify-between', $props.class)">
    <div class="min-w-0">
      <p
        v-if="eyebrow"
        class="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-neutral-400)] mb-1"
      >
        {{ eyebrow }}
      </p>
      <h1 class="text-lg font-semibold tracking-tight text-[var(--color-neutral-900)]">
        {{ title }}
      </h1>
    </div>
    <div v-if="$slots.actions" class="flex shrink-0 items-center gap-2">
      <slot name="actions" />
    </div>
  </header>

  <!-- Card mode: rich header with gradient background -->
  <header
    v-else
    :class="
      cn(
        'relative overflow-hidden border border-[color:var(--color-neutral-200)] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)]',
        dense ? 'rounded-[22px] px-5 py-4 sm:px-6' : 'rounded-[24px] px-6 py-5 sm:px-7',
        $props.class,
      )
    "
  >
    <div
      :class="[
        'pointer-events-none absolute inset-x-0 top-0 bg-[linear-gradient(135deg,rgba(99,102,241,0.12),rgba(59,130,246,0.04),transparent)]',
        dense ? 'h-16' : 'h-20',
      ]"
    />

    <div
      :class="[
        'relative flex flex-col lg:flex-row lg:items-start lg:justify-between',
        dense ? 'gap-3' : 'gap-5',
      ]"
    >
      <div class="min-w-0">
        <p
          v-if="eyebrow"
          class="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-neutral-500)]"
        >
          {{ eyebrow }}
        </p>
        <div :class="['flex items-start', dense ? 'mt-1.5 gap-3' : 'mt-2 gap-4']">
          <div
            v-if="$slots.icon"
            :class="[
              'flex shrink-0 items-center justify-center bg-[var(--color-primary-50)] text-[var(--color-primary-700)] ring-1 ring-[var(--color-primary-100)]',
              dense ? 'h-10 w-10 rounded-[18px]' : 'h-12 w-12 rounded-2xl',
            ]"
          >
            <slot name="icon" />
          </div>

          <div class="min-w-0">
            <h1
              :class="[
                'font-semibold tracking-tight text-[var(--color-neutral-900)]',
                dense ? 'text-xl' : 'text-2xl',
              ]"
            >
              {{ title }}
            </h1>
            <p
              v-if="description"
              :class="[
                'max-w-3xl text-sm text-[var(--color-neutral-600)]',
                dense ? 'mt-1 leading-5' : 'mt-1 leading-6',
              ]"
            >
              {{ description }}
            </p>
          </div>
        </div>
      </div>

      <div v-if="$slots.actions" class="relative flex shrink-0 items-center gap-3">
        <slot name="actions" />
      </div>
    </div>
  </header>
</template>
