<script setup lang="ts">
import { AppBadge, AppDrawer } from '@/shared/components/primitives'
import { History, Search, FileText, Globe, Clock, User } from 'lucide-vue-next'
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
  <AppDrawer
    :open="open"
    :title="`Trace: ${entry.entryNumber}`"
    description="Audit trail, FX rates, and source document lineage."
    size="md"
    @update:open="emit('update:open', $event)"
  >
    <template #header-icon>
      <div class="p-2 bg-[var(--color-primary-50)] rounded-sm">
        <History class="h-5 w-5 text-[var(--color-primary-600)]" />
      </div>
    </template>

    <div class="space-y-8">
      <!-- ── Workflow History ─────────────────────────────── -->
      <section>
        <h3 class="mb-4 text-[10px] font-bold uppercase tracking-widest text-[var(--color-neutral-400)] flex items-center gap-2">
          <Clock :size="12" />
          Workflow History
        </h3>
        <div class="space-y-3">
          <div class="flex items-start gap-4 p-4 bg-white rounded-sm border border-[var(--color-neutral-200)] shadow-sm">
            <div class="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-success-500)]" />
            <div class="flex-1">
              <p class="text-xs font-bold text-[var(--color-neutral-900)]">Created</p>
              <p class="text-[10px] text-[var(--color-neutral-500)] mt-0.5">
                {{ entry.createdAt }}
              </p>
            </div>
            <AppBadge variant="neutral">
              <User :size="10" class="mr-1" />
              {{ entry.createdBy }}
            </AppBadge>
          </div>

          <div
            v-if="entry.status === 'POSTED' || entry.status === 'VOIDED'"
            class="flex items-start gap-4 p-4 bg-white rounded-sm border border-[var(--color-neutral-200)] shadow-sm"
          >
            <div class="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary-500)]" />
            <div class="flex-1">
              <p class="text-xs font-bold text-[var(--color-neutral-900)]">Posted</p>
              <p class="text-[10px] text-[var(--color-neutral-500)] mt-0.5">
                Posted by {{ entry.postedBy ?? 'system' }}
              </p>
            </div>
            <AppBadge variant="success">POSTED</AppBadge>
          </div>

          <div
            v-if="entry.status === 'VOIDED'"
            class="flex items-start gap-4 p-4 bg-[var(--color-danger-50)]/30 rounded-sm border border-[var(--color-danger-200)] shadow-sm"
          >
            <div class="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-danger-500)]" />
            <div class="flex-1">
              <p class="text-xs font-bold text-[var(--color-danger-700)]">Voided</p>
              <p class="text-[10px] text-[var(--color-neutral-500)] mt-0.5">Voided after posting</p>
            </div>
            <AppBadge variant="danger">VOIDED</AppBadge>
          </div>
        </div>
      </section>

      <!-- ── FX Rate Audit ───────────────────────────────── -->
      <section v-if="entry.lines.some((l) => l.exchangeRate && l.exchangeRate !== 1)">
        <h3 class="mb-4 text-[10px] font-bold uppercase tracking-widest text-[var(--color-neutral-400)] flex items-center gap-2">
          <Globe :size="12" />
          FX Rates Applied
        </h3>
        <div class="overflow-hidden rounded-sm border border-[var(--color-neutral-200)] bg-white shadow-sm">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-[var(--color-neutral-50)] text-[var(--color-neutral-400)] text-[9px] font-bold uppercase tracking-widest border-b border-[var(--color-neutral-100)]">
                <th class="px-4 py-2">Line</th>
                <th class="px-4 py-2 text-right">Original</th>
                <th class="px-4 py-2 text-right">Rate</th>
                <th class="px-4 py-2 text-right">Base</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--color-neutral-100)]">
              <tr
                v-for="line in entry.lines.filter((l) => l.exchangeRate && l.exchangeRate !== 1)"
                :key="line.id"
                class="hover:bg-[var(--color-primary-50)]/30 transition-colors"
              >
                <td class="px-4 py-2 text-[10px] font-mono text-[var(--color-neutral-600)]">
                  {{ line.accountId }}
                </td>
                <td class="px-4 py-2 text-right tabular-nums text-[10px] font-medium">
                  {{ line.originalAmount?.formatted ?? '—' }}
                  {{ line.originalCurrency ?? '' }}
                </td>
                <td class="px-4 py-2 text-right tabular-nums text-[10px] font-bold text-[var(--color-primary-600)]">
                  {{ line.exchangeRate?.toFixed(6) }}
                </td>
                <td class="px-4 py-2 text-right tabular-nums text-[10px] font-bold text-[var(--color-neutral-900)]">
                  {{ line.baseAmount?.formatted ?? '—' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ── Source Documents ─────────────────────────────── -->
      <section>
        <h3 class="mb-4 text-[10px] font-bold uppercase tracking-widest text-[var(--color-neutral-400)] flex items-center gap-2">
          <FileText :size="12" />
          Source Documents
        </h3>
        <div class="p-8 border border-dashed border-[var(--color-neutral-300)] rounded-sm flex flex-col items-center justify-center text-center">
          <Search :size="24" class="text-[var(--color-neutral-200)] mb-3" />
          <p class="text-[11px] text-[var(--color-neutral-500)] font-medium">No linked source documents detected.</p>
          <p class="text-[10px] text-[var(--color-neutral-400)] mt-1">Manual journal entries are standalone records.</p>
        </div>
      </section>
    </div>
  </AppDrawer>
</template>
