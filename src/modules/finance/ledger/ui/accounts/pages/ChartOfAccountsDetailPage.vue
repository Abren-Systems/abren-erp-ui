<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/shared/components/button'
import { Badge } from '@/shared/components/badge'
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

const typeVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  ASSET: 'default',
  LIABILITY: 'destructive',
  EQUITY: 'secondary',
  REVENUE: 'default',
  EXPENSE: 'outline',
}
</script>

<template>
  <div v-if="!account" class="flex h-full items-center justify-center">
    <p class="text-sm text-neutral-500">Account not found.</p>
  </div>

  <div v-else class="flex h-full flex-col">
    <!-- ── Header / Action Surface ────────────────────────────── -->
    <div class="flex shrink-0 items-center justify-between border-b px-6 py-4">
      <div class="flex items-center gap-4">
        <Button variant="ghost" size="icon" @click="goBack">
          <ArrowLeft class="h-4 w-4" />
        </Button>
        <div>
          <div class="flex items-center gap-3">
            <span class="font-mono text-sm text-neutral-500">{{ account.code }}</span>
            <h1 class="text-lg font-semibold tracking-tight">{{ account.name }}</h1>
            <Badge :variant="typeVariants[account.type]">{{ account.type }}</Badge>
            <Badge v-if="!account.isActive" variant="secondary">Inactive</Badge>
          </div>
          <p class="mt-0.5 text-sm text-neutral-500">General Ledger Account</p>
        </div>
      </div>

      <!-- Action Surface -->
      <div class="flex items-center gap-2">
        <!-- Secondary: View Trace -->
        <Button variant="outline" size="sm" @click="isTraceOpen = true">
          <History class="mr-1.5 h-3.5 w-3.5" />
          Trace
        </Button>

        <!-- Secondary: Rename -->
        <Button
          v-if="hasPermission('ledger:manage_accounts')"
          variant="outline"
          size="sm"
          @click="startRename"
        >
          <Pencil class="mr-1.5 h-3.5 w-3.5" />
          Rename
        </Button>

        <!-- Tertiary: Overflow for destructive actions -->
        <DropdownMenu v-if="hasPermission('ledger:manage_accounts') && account.isActive">
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="icon" class="h-8 w-8">
              <MoreHorizontal class="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuSeparator />
            <DropdownMenuItem class="text-destructive"> Deactivate Account </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <!-- ── Main Canvas: Account Details ──────────────────────── -->
    <div class="flex-1 overflow-y-auto p-6">
      <div class="grid grid-cols-2 gap-6 md:grid-cols-4">
        <div class="rounded-lg border p-4">
          <p class="text-xs font-medium uppercase text-neutral-400">Account Code</p>
          <p class="mt-1 font-mono text-lg font-semibold">{{ account.code }}</p>
        </div>
        <div class="rounded-lg border p-4">
          <p class="text-xs font-medium uppercase text-neutral-400">Type</p>
          <p class="mt-1 text-lg font-semibold">{{ account.type }}</p>
        </div>
        <div class="rounded-lg border p-4">
          <p class="text-xs font-medium uppercase text-neutral-400">Status</p>
          <p
            class="mt-1 text-lg font-semibold"
            :class="account.isActive ? 'text-green-600' : 'text-neutral-400'"
          >
            {{ account.isActive ? 'Active' : 'Inactive' }}
          </p>
        </div>
        <div class="rounded-lg border p-4">
          <p class="text-xs font-medium uppercase text-neutral-400">Currency</p>
          <p class="mt-1 font-mono text-lg font-semibold">{{ account.currency ?? '—' }}</p>
        </div>
      </div>
    </div>

    <!-- ── Stage 3: AccountTraceDrawer ───────────────────────── -->
    <AccountTraceDrawer v-model:open="isTraceOpen" :account="account" />
  </div>
</template>
