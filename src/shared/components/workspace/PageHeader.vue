<script setup lang="ts">
import { cn } from '@/shared/lib'

interface Props {
  title: string
  description?: string
  eyebrow?: string
  dense?: boolean
  class?: string
}

withDefaults(defineProps<Props>(), {
  description: '',
  eyebrow: '',
  dense: false,
  class: '',
})
</script>

<template>
  <header
    :class="
      cn(
        'relative overflow-hidden border border-[color:var(--color-neutral-200)] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)]',
        dense ? 'rounded-[22px] px-5 py-4 sm:px-6' : 'rounded-[28px] px-6 py-6 sm:px-8',
        $props.class,
      )
    "
  >
    <div
      :class="[
        'pointer-events-none absolute inset-x-0 top-0 bg-[linear-gradient(135deg,rgba(99,102,241,0.12),rgba(59,130,246,0.04),transparent)]',
        dense ? 'h-16' : 'h-24',
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
                dense ? 'mt-1.5 leading-5' : 'mt-2 leading-6',
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
