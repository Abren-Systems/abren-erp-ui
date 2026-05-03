<script setup lang="ts">
import { Workflow, ShieldCheck } from 'lucide-vue-next'
import { WorkspacePanel } from '@/shared/components/workspace'

defineProps<{
  isLoadingStats: boolean
  approvedRequestsCount: number
  paidRequestsCount: number
  rejectedRequestsCount: number
}>()
</script>

<template>
  <WorkspacePanel
    title="Flow health"
    description="A truthful snapshot of the payment-request pipeline."
  >
    <template #icon>
      <Workflow class="h-5 w-5" />
    </template>

    <div class="space-y-4">
      <div class="grid gap-3 sm:grid-cols-2">
        <div
          class="rounded-2xl bg-[var(--color-neutral-50)] p-4 ring-1 ring-[color:var(--color-neutral-200)]"
        >
          <p
            class="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-neutral-500)]"
          >
            Approved
          </p>
          <p class="mt-3 text-2xl font-semibold text-[var(--color-neutral-900)]">
            {{ isLoadingStats ? '...' : approvedRequestsCount }}
          </p>
        </div>
        <div
          class="rounded-2xl bg-[var(--color-neutral-50)] p-4 ring-1 ring-[color:var(--color-neutral-200)]"
        >
          <p
            class="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-neutral-500)]"
          >
            Paid
          </p>
          <p class="mt-3 text-2xl font-semibold text-[var(--color-neutral-900)]">
            {{ isLoadingStats ? '...' : paidRequestsCount }}
          </p>
        </div>
      </div>

      <div
        class="rounded-2xl border border-[color:var(--color-neutral-200)] bg-[linear-gradient(180deg,rgba(248,250,252,0.9),#ffffff)] p-4"
      >
        <div class="flex items-start gap-3">
          <div
            class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-danger-50)] text-[var(--color-danger-700)]"
          >
            <ShieldCheck class="h-4 w-4" />
          </div>
          <div>
            <p class="text-sm font-semibold text-[var(--color-neutral-900)]">Rejected requests</p>
            <p class="mt-1 text-sm text-[var(--color-neutral-600)]">
              {{
                isLoadingStats
                  ? 'Awaiting source'
                  : `${rejectedRequestsCount} ${rejectedRequestsCount === 1 ? 'request' : 'requests'} currently require follow-up or correction.`
              }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </WorkspacePanel>
</template>
