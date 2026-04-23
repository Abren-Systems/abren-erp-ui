<script setup lang="ts">
import { cn } from '@/shared/lib'

interface Props {
  title: string
  description?: string
  dense?: boolean
  class?: string
  bodyClass?: string
}

withDefaults(defineProps<Props>(), {
  description: '',
  dense: false,
  class: '',
  bodyClass: '',
})
</script>

<template>
  <section
    :class="
      cn(
        'border border-[color:var(--color-neutral-200)] bg-white shadow-[0_12px_32px_rgba(15,23,42,0.05)]',
        dense ? 'rounded-[20px]' : 'rounded-[24px]',
        $props.class,
      )
    "
  >
    <div
      :class="[
        'flex items-start justify-between gap-4 border-b border-[color:var(--color-neutral-200)]',
        dense ? 'px-5 py-4' : 'px-6 py-5',
      ]"
    >
      <div class="min-w-0">
        <div class="flex items-center gap-3">
          <div
            v-if="$slots.icon"
            :class="[
              'flex shrink-0 items-center justify-center bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)]',
              dense ? 'h-9 w-9 rounded-[16px]' : 'h-10 w-10 rounded-2xl',
            ]"
          >
            <slot name="icon" />
          </div>
          <div class="min-w-0">
            <h2
              :class="[
                'font-semibold text-[var(--color-neutral-900)]',
                dense ? 'text-[15px]' : 'text-base',
              ]"
            >
              {{ title }}
            </h2>
            <p
              v-if="description"
              :class="[
                'text-sm text-[var(--color-neutral-500)]',
                dense ? 'mt-0.5 leading-5' : 'mt-1 leading-5',
              ]"
            >
              {{ description }}
            </p>
          </div>
        </div>
      </div>

      <div v-if="$slots.actions" class="flex shrink-0 items-center gap-2">
        <slot name="actions" />
      </div>
    </div>

    <div :class="cn(dense ? 'px-5 py-4' : 'px-6 py-5', $props.bodyClass)">
      <slot />
    </div>
  </section>
</template>
