<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { AppButton, AppBadge } from '@/shared/components/primitives'
import { ArrowLeft, MoreHorizontal, History, Pencil } from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/shared/components/dropdown-menu'
import { useLedgerAccounts } from '../../../application/composables/useLedgerAccounts'
import { usePermissions } from '@/shared/auth/usePermissions'
import AccountTraceDrawer from '../components/AccountTraceDrawer.vue'

/**
 * Stage 2: Focus Canvas — Chart of Accounts Detail Page.
 *
 * Progressive Disclosure flow:
 *   ChartOfAccountsListPage → THIS PAGE → AccountTraceDrawer
 *
 * Action Surface:
 *   Secondary: Rename (ledger:manage_accounts)
 *   Tertiary:  Deactivate (destructive, behind overflow)
 */

const props = defineProps<{ accountId: string }>()
const router = useRouter()
const { hasPermission } = usePermissions()

// Pull from cache — the list query will have already fetched all accounts
const { accounts, isCreating } = useLedgerAccounts()
const account = computed(() => accounts.value?.find((a) => a.id === props.accountId) ?? null)

const isTraceOpen = ref(false)
const isRenaming = ref(false)
const newName = ref('')

function startRename() {
  newName.value = account.value?.name ?? ''
  isRenaming.value = true
}

function goBack() {
  router.push({ name: 'LedgerCoa' })
}

const typeVariants: Record<string, 'primary' | 'neutral' | 'danger' | 'success'> = {
  ASSET: 'primary',
  LIABILITY: 'danger',
  EQUITY: 'neutral',
  REVENUE: 'success',
  EXPENSE: 'neutral',
}
</script>

<template>
  <div v-if="!account" class="flex h-full items-center justify-center">
    <p class="text-sm text-neutral-500">Account not found.</p>
  </div>

  <div v-else class="flex h-full flex-col">
    <!-- ── Header / Action Surface ────────────────────────────── -->
    <div
      class="flex shrink-0 items-center justify-between border-b border-[var(--color-neutral-200)] px-6 py-4 bg-white"
    >
      <div class="flex items-center gap-4">
        <AppButton variant="stealth" @click="goBack">
          <ArrowLeft class="h-4 w-4" />
        </AppButton>
        <div>
          <div class="flex items-center gap-3">
            <span class="font-mono text-sm text-[var(--color-neutral-500)]">{{
              account.code
            }}</span>
            <h1 class="text-lg font-semibold tracking-tight text-[var(--color-neutral-900)]">
              {{ account.name }}
            </h1>
            <AppBadge :variant="typeVariants[account.type]">{{ account.type }}</AppBadge>
            <AppBadge v-if="!account.isActive" variant="neutral">Inactive</AppBadge>
          </div>
          <p class="mt-0.5 text-sm text-[var(--color-neutral-500)]">General Ledger Account</p>
        </div>
      </div>

      <!-- Action Surface -->
      <div class="flex items-center gap-2">
        <!-- Secondary: View Trace -->
        <AppButton variant="outline" @click="isTraceOpen = true">
          <History class="mr-1.5 h-3.5 w-3.5" />
          Trace
        </AppButton>

        <!-- Secondary: Rename -->
        <AppButton
          v-if="hasPermission('ledger:manage_accounts')"
          variant="outline"
          @click="startRename"
        >
          <Pencil class="mr-1.5 h-3.5 w-3.5" />
          Rename
        </AppButton>

        <!-- Tertiary: Overflow for destructive actions -->
        <DropdownMenu v-if="hasPermission('ledger:manage_accounts') && account.isActive">
          <DropdownMenuTrigger as-child>
            <AppButton variant="stealth">
              <MoreHorizontal class="h-4 w-4" />
            </AppButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuSeparator />
            <DropdownMenuItem class="text-[var(--color-danger-600)]">
              Deactivate Account
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <!-- ── Main Canvas: Account Details ──────────────────────── -->
    <div class="flex-1 overflow-y-auto p-8 bg-[var(--app-canvas)]">
      <div class="max-w-4xl mx-auto grid grid-cols-2 gap-6 md:grid-cols-4">
        <div class="bg-white rounded-sm border border-[var(--color-neutral-200)] p-5 shadow-sm">
          <p class="text-xs font-bold uppercase tracking-wider text-[var(--color-neutral-400)]">
            Account Code
          </p>
          <p class="mt-2 font-mono text-xl font-bold text-[var(--color-neutral-900)]">
            {{ account.code }}
          </p>
        </div>
        <div class="bg-white rounded-sm border border-[var(--color-neutral-200)] p-5 shadow-sm">
          <p class="text-xs font-bold uppercase tracking-wider text-[var(--color-neutral-400)]">
            Type
          </p>
          <p class="mt-2 text-xl font-bold text-[var(--color-neutral-900)]">{{ account.type }}</p>
        </div>
        <div class="bg-white rounded-sm border border-[var(--color-neutral-200)] p-5 shadow-sm">
          <p class="text-xs font-bold uppercase tracking-wider text-[var(--color-neutral-400)]">
            Status
          </p>
          <p
            class="mt-2 text-xl font-bold"
            :class="
              account.isActive
                ? 'text-[var(--color-success-600)]'
                : 'text-[var(--color-neutral-400)]'
            "
          >
            {{ account.isActive ? 'Active' : 'Inactive' }}
          </p>
        </div>
        <div class="bg-white rounded-sm border border-[var(--color-neutral-200)] p-5 shadow-sm">
          <p class="text-xs font-bold uppercase tracking-wider text-[var(--color-neutral-400)]">
            Currency
          </p>
          <p class="mt-2 font-mono text-xl font-bold text-[var(--color-neutral-900)]">
            {{ account.currency ?? '—' }}
          </p>
        </div>
      </div>
    </div>

    <!-- ── Stage 3: AccountTraceDrawer ───────────────────────── -->
    <AccountTraceDrawer v-model:open="isTraceOpen" :account="account" />
  </div>
</template>
