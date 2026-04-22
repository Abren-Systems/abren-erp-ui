<script setup lang="ts">
import { AppDrawer } from '@/shared/components/primitives'
import { Info } from 'lucide-vue-next'
import type { Account } from '../../../domain/account.types'

/**
 * Stage 3: AccountTraceDrawer — Account Provenance.
 *
 * Lazy-loaded contextual panel showing journal entries posted to
 * this account. Follows the Progressive Disclosure density rule.
 */

defineProps<{
  open: boolean
  account: Account
}>()

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void
}>()
</script>

<template>
  <AppDrawer
    :open="open"
    :title="`Trace: ${account.code} — ${account.name}`"
    description="Journal entries posted to this account."
    size="md"
    @update:open="emit('update:open', $event)"
  >
    <template #header-icon>
      <div class="p-2 bg-[var(--color-primary-50)] rounded-sm">
        <Info class="h-5 w-5 text-[var(--color-primary-600)]" />
      </div>
    </template>

    <div class="space-y-8">
      <!-- Account details summary -->
      <section>
        <h3
          class="mb-4 text-[10px] font-bold uppercase tracking-widest text-[var(--color-neutral-400)]"
        >
          Account Profile
        </h3>
        <div
          class="space-y-3 rounded-sm border border-[var(--color-neutral-200)] bg-white p-4 shadow-sm text-xs"
        >
          <div class="flex justify-between items-center">
            <span
              class="text-[var(--color-neutral-500)] font-medium uppercase tracking-wider text-[10px]"
              >Type</span
            >
            <span class="font-bold text-[var(--color-neutral-900)]">{{ account.type }}</span>
          </div>
          <div
            class="flex justify-between items-center border-t border-[var(--color-neutral-100)] pt-3"
          >
            <span
              class="text-[var(--color-neutral-500)] font-medium uppercase tracking-wider text-[10px]"
              >Status</span
            >
            <span
              :class="
                account.isActive
                  ? 'text-[var(--color-success-600)] bg-[var(--color-success-50)]'
                  : 'text-[var(--color-neutral-400)] bg-[var(--color-neutral-50)]'
              "
              class="font-bold px-2 py-0.5 rounded-full"
            >
              {{ account.isActive ? 'Active' : 'Inactive' }}
            </span>
          </div>
          <div
            class="flex justify-between items-center border-t border-[var(--color-neutral-100)] pt-3"
          >
            <span
              class="text-[var(--color-neutral-500)] font-medium uppercase tracking-wider text-[10px]"
              >Currency</span
            >
            <span class="font-mono font-bold text-[var(--color-neutral-900)]">{{
              account.currency ?? 'Multi-currency'
            }}</span>
          </div>
        </div>
      </section>

      <!-- Recent postings placeholder -->
      <section>
        <h3
          class="mb-4 text-[10px] font-bold uppercase tracking-widest text-[var(--color-neutral-400)]"
        >
          Recent Postings
        </h3>
        <div
          class="p-8 border border-dashed border-[var(--color-neutral-300)] rounded-sm flex flex-col items-center justify-center text-center"
        >
          <p class="text-[11px] text-[var(--color-neutral-500)] font-medium">
            Transaction history for this account will be displayed here.
          </p>
          <p class="text-[10px] text-[var(--color-neutral-400)] mt-1">
            Filter journal entries by account to view all postings.
          </p>
        </div>
      </section>
    </div>
  </AppDrawer>
</template>
