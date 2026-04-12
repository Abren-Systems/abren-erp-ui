<script setup lang="ts">
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/shared/components/sheet'
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
  <Sheet :open="open" @update:open="emit('update:open', $event)">
    <SheetContent class="sm:max-w-[480px] overflow-y-auto">
      <SheetHeader>
        <SheetTitle>Trace: {{ account.code }} — {{ account.name }}</SheetTitle>
        <SheetDescription> Journal entries posted to this account. </SheetDescription>
      </SheetHeader>

      <div class="space-y-6 py-6">
        <!-- Account details summary -->
        <section>
          <h3 class="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Account Profile
          </h3>
          <div class="space-y-2 rounded-lg border p-4 text-sm">
            <div class="flex justify-between">
              <span class="text-neutral-500">Type</span>
              <span class="font-medium">{{ account.type }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-neutral-500">Status</span>
              <span
                :class="account.isActive ? 'text-green-600' : 'text-neutral-400'"
                class="font-medium"
              >
                {{ account.isActive ? 'Active' : 'Inactive' }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-neutral-500">Currency</span>
              <span class="font-mono font-medium">{{ account.currency ?? 'Multi-currency' }}</span>
            </div>
          </div>
        </section>

        <!-- Recent postings placeholder -->
        <section>
          <h3 class="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Recent Postings
          </h3>
          <p class="text-sm text-neutral-500">
            Transaction history for this account will be displayed here. Filter journal entries by
            account to view all postings.
          </p>
        </section>
      </div>
    </SheetContent>
  </Sheet>
</template>
