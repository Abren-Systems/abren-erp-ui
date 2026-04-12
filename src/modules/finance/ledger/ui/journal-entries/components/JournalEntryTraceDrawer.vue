<script setup lang="ts">
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/shared/components/sheet'
import { Badge } from '@/shared/components/badge'
import type { JournalEntry } from '../../../domain/journal-entry.types'

/**
 * Stage 3: TraceDrawer — Journal Entry Provenance.
 *
 * Lazy-loaded contextual panel providing audit trail, FX rates,
 * and source document lineage. Follows the Progressive Disclosure
 * density rule: dense provenance, but only when requested.
 */

defineProps<{
  open: boolean
  entry: JournalEntry
}>()

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void
}>()
</script>

<template>
  <Sheet :open="open" @update:open="emit('update:open', $event)">
    <SheetContent class="sm:max-w-[480px] overflow-y-auto">
      <SheetHeader>
        <SheetTitle>Trace: {{ entry.entryNumber }}</SheetTitle>
        <SheetDescription> Audit trail, FX rates, and source document lineage. </SheetDescription>
      </SheetHeader>

      <div class="space-y-6 py-6">
        <!-- ── Workflow History ─────────────────────────────── -->
        <section>
          <h3 class="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Workflow History
          </h3>
          <div class="space-y-3">
            <div class="flex items-start gap-3 rounded-md border p-3">
              <div class="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-green-500" />
              <div class="flex-1">
                <p class="text-sm font-medium">Created</p>
                <p class="text-xs text-neutral-500">
                  {{ entry.createdAt }}
                </p>
              </div>
              <Badge variant="secondary" class="text-xs">
                {{ entry.createdBy }}
              </Badge>
            </div>

            <div
              v-if="entry.status === 'POSTED' || entry.status === 'VOIDED'"
              class="flex items-start gap-3 rounded-md border p-3"
            >
              <div class="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
              <div class="flex-1">
                <p class="text-sm font-medium">Posted</p>
                <p class="text-xs text-neutral-500">Posted by {{ entry.postedBy ?? 'system' }}</p>
              </div>
              <Badge variant="default" class="text-xs">POSTED</Badge>
            </div>

            <div
              v-if="entry.status === 'VOIDED'"
              class="flex items-start gap-3 rounded-md border border-destructive/20 bg-destructive/5 p-3"
            >
              <div class="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />
              <div class="flex-1">
                <p class="text-sm font-medium text-destructive">Voided</p>
                <p class="text-xs text-neutral-500">Voided after posting</p>
              </div>
              <Badge variant="destructive" class="text-xs">VOIDED</Badge>
            </div>
          </div>
        </section>

        <!-- ── FX Rate Audit ───────────────────────────────── -->
        <section v-if="entry.lines.some((l) => l.exchangeRate && l.exchangeRate !== 1)">
          <h3 class="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            FX Rates Applied
          </h3>
          <div class="overflow-hidden rounded-lg border">
            <table class="w-full text-xs">
              <thead class="bg-neutral-50 dark:bg-neutral-900">
                <tr>
                  <th class="px-3 py-2 text-left font-medium text-neutral-500">Line</th>
                  <th class="px-3 py-2 text-right font-medium text-neutral-500">Original</th>
                  <th class="px-3 py-2 text-right font-medium text-neutral-500">Rate</th>
                  <th class="px-3 py-2 text-right font-medium text-neutral-500">Base</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="line in entry.lines.filter((l) => l.exchangeRate && l.exchangeRate !== 1)"
                  :key="line.id"
                  class="border-t"
                >
                  <td class="px-3 py-2 font-mono text-neutral-600">
                    {{ line.accountId }}
                  </td>
                  <td class="px-3 py-2 text-right tabular-nums">
                    {{ line.originalAmount?.formatted ?? '—' }}
                    {{ line.originalCurrency ?? '' }}
                  </td>
                  <td class="px-3 py-2 text-right tabular-nums font-medium">
                    {{ line.exchangeRate?.toFixed(6) }}
                  </td>
                  <td class="px-3 py-2 text-right tabular-nums">
                    {{ line.baseAmount?.formatted ?? '—' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- ── Source Documents ─────────────────────────────── -->
        <section>
          <h3 class="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Source Documents
          </h3>
          <p class="text-sm text-neutral-500">
            No linked source documents. Manual journal entries are standalone.
          </p>
        </section>
      </div>
    </SheetContent>
  </Sheet>
</template>
