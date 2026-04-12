<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/shared/components/button'
import { Badge } from '@/shared/components/badge'
import { ArrowLeft, CheckCircle, MoreHorizontal, FileText, History } from 'lucide-vue-next'
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
  if (isDraft.value) return 'secondary'
  if (isPosted.value) return 'default'
  return 'destructive'
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
    <div class="flex shrink-0 items-center justify-between border-b px-6 py-4">
      <div class="flex items-center gap-4">
        <Button variant="ghost" size="icon" @click="goBack">
          <ArrowLeft class="h-4 w-4" />
        </Button>
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-lg font-semibold tracking-tight">
              {{ entry.entryNumber }}
            </h1>
            <Badge :variant="statusVariant">
              {{ entry.status }}
            </Badge>
          </div>
          <p class="mt-0.5 text-sm text-neutral-500">
            {{ entry.description }}
          </p>
        </div>
      </div>

      <!-- Action Surface -->
      <div class="flex items-center gap-2">
        <!-- Secondary: Trace -->
        <Button variant="outline" size="sm" @click="isTraceOpen = true">
          <History class="mr-1.5 h-3.5 w-3.5" />
          Trace
        </Button>

        <!-- Primary: Post (only if DRAFT and user has permission) -->
        <Button
          v-if="isDraft && hasPermission('ledger:post')"
          size="sm"
          @click="handlePost"
          :disabled="isLoading"
        >
          <CheckCircle class="mr-1.5 h-3.5 w-3.5" />
          Post Entry
        </Button>

        <!-- Tertiary: Overflow for destructive actions -->
        <DropdownMenu v-if="isPosted && hasPermission('ledger:post')">
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="icon" class="h-8 w-8">
              <MoreHorizontal class="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem class="text-destructive" @click="isVoidModalOpen = true">
              Void Entry
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <!-- ── Main Canvas: Entry Metadata ───────────────────────── -->
    <div class="flex-1 overflow-y-auto p-6">
      <div class="grid grid-cols-3 gap-6 rounded-lg border p-4">
        <div>
          <p class="text-xs font-medium uppercase text-neutral-400">Date</p>
          <p class="mt-1 text-sm font-medium">{{ entry.entryDate }}</p>
        </div>
        <div>
          <p class="text-xs font-medium uppercase text-neutral-400">Base Currency</p>
          <p class="mt-1 text-sm font-medium">ETB</p>
        </div>
        <div>
          <p class="text-xs font-medium uppercase text-neutral-400">Lines</p>
          <p class="mt-1 text-sm font-medium">{{ entry.lines.length }}</p>
        </div>
      </div>

      <!-- ── Journal Lines Table ─────────────────────────────── -->
      <div class="mt-6">
        <h2 class="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-500">
          Journal Lines
        </h2>
        <div class="overflow-hidden rounded-lg border">
          <table class="w-full text-sm">
            <thead class="bg-neutral-50 dark:bg-neutral-900">
              <tr>
                <th class="px-4 py-2.5 text-left font-medium text-neutral-500">Account</th>
                <th class="px-4 py-2.5 text-left font-medium text-neutral-500">Description</th>
                <th class="px-4 py-2.5 text-right font-medium text-neutral-500 tabular-nums">
                  Debit
                </th>
                <th class="px-4 py-2.5 text-right font-medium text-neutral-500 tabular-nums">
                  Credit
                </th>
                <th class="px-4 py-2.5 text-right font-medium text-neutral-500">Currency</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="line in entry.lines"
                :key="line.id"
                class="border-t transition-colors hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30"
              >
                <td class="px-4 py-2.5 font-mono text-xs text-neutral-600">
                  {{ line.accountId }}
                </td>
                <td class="px-4 py-2.5 text-neutral-700">
                  {{ line.description || '—' }}
                </td>
                <td class="px-4 py-2.5 text-right tabular-nums font-medium">
                  {{ line.debit.amount > 0 ? line.debit.formatted : '' }}
                </td>
                <td class="px-4 py-2.5 text-right tabular-nums font-medium">
                  {{ line.credit.amount > 0 ? line.credit.formatted : '' }}
                </td>
                <td class="px-4 py-2.5 text-right font-mono text-xs text-neutral-500">
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
