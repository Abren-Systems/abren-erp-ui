<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { AppButton, AppBadge } from '@/shared/components/primitives'
import {
  ArrowLeft,
  CheckCircle,
  MoreHorizontal,
  FileText,
  History,
  FileSpreadsheet,
} from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/shared/components/dropdown-menu'
import { useJournalEntry } from '../../../application/composables/useJournalEntry'
import { usePermissions } from '@/shared/auth/usePermissions'
import JournalEntryActionModal from '../components/JournalEntryActionModal.vue'
import JournalEntryTraceDrawer from '../components/JournalEntryTraceDrawer.vue'

/**
 * Stage 2: Focus Canvas — Journal Entry Detail Page.
 *
 * Implements the Progressive Disclosure pattern:
 *   Queue (ListPage) → THIS PAGE → TraceDrawer / ActionModal
 *
 * Action Surface follows the 3-tier hierarchy:
 *   Primary: Post (state-advancing)
 *   Secondary: View Trace (supporting)
 *   Tertiary: Void (destructive, behind overflow + ActionModal)
 */

const props = defineProps<{ entryId: string }>()
const router = useRouter()
const { hasPermission } = usePermissions()

const { entry, isLoading, postEntry, voidEntry } = useJournalEntry(props.entryId)

// Drawer & Modal state
const isTraceOpen = ref(false)
const isVoidModalOpen = ref(false)

// Computed display helpers
const isDraft = computed(() => entry.value?.status === 'DRAFT')
const isPosted = computed(() => entry.value?.status === 'POSTED')
const isVoided = computed(() => entry.value?.status === 'VOIDED')

const statusVariant = computed(() => {
  if (isDraft.value) return 'neutral'
  if (isPosted.value) return 'success'
  return 'danger'
})

// ── Primary Action: Post ───────────────────────────────────────
async function handlePost() {
  await postEntry()
}

// ── Tertiary Action: Void (called from ActionModal) ───────────
async function handleVoid(reason: string) {
  await voidEntry({ reason })
  isVoidModalOpen.value = false
}

function goBack() {
  router.push({ name: 'LedgerJournals' })
}
</script>

<template>
  <div v-if="isLoading && !entry" class="flex h-full items-center justify-center">
    <p class="text-sm text-neutral-500">Loading journal entry…</p>
  </div>

  <div v-else-if="entry" class="flex h-full flex-col">
    <!-- ── Page Header / Action Surface ──────────────────────── -->
    <div
      class="flex shrink-0 items-center justify-between border-b border-[var(--color-neutral-200)] px-6 py-4 bg-white"
    >
      <div class="flex items-center gap-4">
        <AppButton variant="stealth" @click="goBack">
          <ArrowLeft class="h-4 w-4" />
        </AppButton>
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-lg font-semibold tracking-tight text-[var(--color-neutral-900)]">
              {{ entry.entryNumber }}
            </h1>
            <AppBadge :variant="statusVariant">
              {{ entry.status }}
            </AppBadge>
          </div>
          <p class="mt-0.5 text-sm text-[var(--color-neutral-500)]">
            {{ entry.description }}
          </p>
        </div>
      </div>

      <!-- Action Surface -->
      <div class="flex items-center gap-2">
        <!-- Secondary: Trace -->
        <AppButton variant="outline" @click="isTraceOpen = true">
          <History class="mr-1.5 h-3.5 w-3.5" />
          Trace
        </AppButton>

        <!-- Primary: Post (only if DRAFT and user has permission) -->
        <AppButton
          v-if="isDraft && hasPermission('ledger:post')"
          variant="primary"
          @click="handlePost"
          :disabled="isLoading"
        >
          <CheckCircle class="mr-1.5 h-3.5 w-3.5" />
          Post Entry
        </AppButton>

        <!-- Tertiary: Overflow for destructive actions -->
        <DropdownMenu v-if="isPosted && hasPermission('ledger:post')">
          <DropdownMenuTrigger as-child>
            <AppButton variant="stealth">
              <MoreHorizontal class="h-4 w-4" />
            </AppButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              class="text-[var(--color-danger-600)]"
              @click="isVoidModalOpen = true"
            >
              Void Entry
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <!-- ── Main Canvas: Entry Metadata ───────────────────────── -->
    <div class="flex-1 overflow-y-auto p-8 bg-[var(--app-canvas)]">
      <div class="max-w-5xl mx-auto grid grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-sm border border-[var(--color-neutral-200)] p-5 shadow-sm">
          <p class="text-xs font-bold uppercase tracking-wider text-[var(--color-neutral-400)]">
            Date
          </p>
          <p class="mt-2 text-xl font-bold text-[var(--color-neutral-900)]">
            {{ entry.entryDate }}
          </p>
        </div>
        <div class="bg-white rounded-sm border border-[var(--color-neutral-200)] p-5 shadow-sm">
          <p class="text-xs font-bold uppercase tracking-wider text-[var(--color-neutral-400)]">
            Base Currency
          </p>
          <p class="mt-2 text-xl font-bold text-[var(--color-neutral-900)]">ETB</p>
        </div>
        <div class="bg-white rounded-sm border border-[var(--color-neutral-200)] p-5 shadow-sm">
          <p class="text-xs font-bold uppercase tracking-wider text-[var(--color-neutral-400)]">
            Lines
          </p>
          <p class="mt-2 text-xl font-bold text-[var(--color-neutral-900)]">
            {{ entry.lines.length }}
          </p>
        </div>
      </div>

      <!-- ── Journal Lines Table ─────────────────────────────── -->
      <div
        class="max-w-5xl mx-auto bg-white rounded-sm border border-[var(--color-neutral-200)] shadow-sm overflow-hidden"
      >
        <div
          class="flex items-center justify-between px-4 py-3 border-b border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)]"
        >
          <div class="flex items-center gap-2">
            <FileSpreadsheet :size="16" class="text-[var(--color-neutral-500)]" />
            <h2 class="text-xs font-bold uppercase tracking-widest text-[var(--color-neutral-600)]">
              Journal Lines
            </h2>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-[var(--color-neutral-50)]">
              <tr>
                <th
                  class="px-4 py-3 text-left font-bold text-xs uppercase tracking-wider text-[var(--color-neutral-500)]"
                >
                  Account
                </th>
                <th
                  class="px-4 py-3 text-left font-bold text-xs uppercase tracking-wider text-[var(--color-neutral-500)]"
                >
                  Description
                </th>
                <th
                  class="px-4 py-3 text-right font-bold text-xs uppercase tracking-wider text-[var(--color-neutral-500)] tabular-nums"
                >
                  Debit
                </th>
                <th
                  class="px-4 py-3 text-right font-bold text-xs uppercase tracking-wider text-[var(--color-neutral-500)] tabular-nums"
                >
                  Credit
                </th>
                <th
                  class="px-4 py-3 text-right font-bold text-xs uppercase tracking-wider text-[var(--color-neutral-500)]"
                >
                  Currency
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--color-neutral-100)]">
              <tr
                v-for="line in entry.lines"
                :key="line.id"
                class="transition-colors hover:bg-[var(--color-neutral-50)]"
              >
                <td class="px-4 py-3 font-mono text-[13px] text-[var(--color-neutral-600)]">
                  {{ line.accountId }}
                </td>
                <td class="px-4 py-3 text-[var(--color-neutral-700)]">
                  {{ line.description || '—' }}
                </td>
                <td
                  class="px-4 py-3 text-right tabular-nums font-bold text-[var(--color-neutral-900)]"
                >
                  {{ line.debit.amount > 0 ? line.debit.formatted : '' }}
                </td>
                <td
                  class="px-4 py-3 text-right tabular-nums font-bold text-[var(--color-neutral-900)]"
                >
                  {{ line.credit.amount > 0 ? line.credit.formatted : '' }}
                </td>
                <td class="px-4 py-3 text-right font-mono text-xs text-[var(--color-neutral-500)]">
                  {{ line.originalCurrency ?? 'ETB' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ── Stage 3: TraceDrawer (lazy, on-demand) ────────────── -->
    <JournalEntryTraceDrawer v-model:open="isTraceOpen" :entry="entry" />

    <!-- ── Guard: ActionModal for destructive void ───────────── -->
    <JournalEntryActionModal
      v-model:open="isVoidModalOpen"
      :entry-number="entry.entryNumber"
      @confirm="handleVoid"
    />
  </div>
</template>
