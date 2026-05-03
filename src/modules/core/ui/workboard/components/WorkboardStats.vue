<script setup lang="ts">
import { Inbox, FileClock, CreditCard, Users } from 'lucide-vue-next'

defineProps<{
  isLoadingTasks: boolean
  isLoadingStats: boolean
  pendingApprovalsCount: number
  submittedRequestsCount: number
  totalOperationalAmount: string
  activeUsersCount: number
}>()
</script>

<template>
  <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <!-- Pending Approvals -->
    <div
      class="rounded-[24px] border border-[color:var(--color-neutral-200)] bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.05)]"
    >
      <div class="flex items-center justify-between">
        <p class="text-sm font-medium text-[var(--color-neutral-500)]">Pending approvals</p>
        <Inbox class="h-4 w-4 text-[var(--color-primary-600)]" />
      </div>
      <p class="mt-4 text-3xl font-semibold tracking-tight text-[var(--color-neutral-900)]">
        {{ isLoadingTasks ? '...' : pendingApprovalsCount }}
      </p>
      <p class="mt-2 text-sm text-[var(--color-neutral-600)]">
        Waiting on explicit review before work can move forward.
      </p>
    </div>

    <!-- Submitted Requests -->
    <div
      class="rounded-[24px] border border-[color:var(--color-neutral-200)] bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.05)]"
    >
      <div class="flex items-center justify-between">
        <p class="text-sm font-medium text-[var(--color-neutral-500)]">Submitted requests</p>
        <FileClock class="h-4 w-4 text-[var(--color-warning-600)]" />
      </div>
      <p class="mt-4 text-3xl font-semibold tracking-tight text-[var(--color-neutral-900)]">
        {{ isLoadingStats ? '...' : submittedRequestsCount }}
      </p>
      <p class="mt-2 text-sm text-[var(--color-neutral-600)]">
        Work in review before approval and settlement.
      </p>
    </div>

    <!-- Tracked Amount -->
    <div
      class="rounded-[24px] border border-[color:var(--color-neutral-200)] bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.05)]"
    >
      <div class="flex items-center justify-between">
        <p class="text-sm font-medium text-[var(--color-neutral-500)]">Tracked amount</p>
        <CreditCard class="h-4 w-4 text-[var(--color-success-600)]" />
      </div>
      <p class="mt-4 text-3xl font-semibold tracking-tight text-[var(--color-neutral-900)]">
        {{ totalOperationalAmount }}
      </p>
      <p class="mt-2 text-sm text-[var(--color-neutral-600)]">
        Payment request value currently visible in the system.
      </p>
    </div>

    <!-- Active Users -->
    <div
      class="rounded-[24px] border border-[color:var(--color-neutral-200)] bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.05)]"
    >
      <div class="flex items-center justify-between">
        <p class="text-sm font-medium text-[var(--color-neutral-500)]">Active users</p>
        <Users class="h-4 w-4 text-[var(--color-info-600)]" />
      </div>
      <p class="mt-4 text-3xl font-semibold tracking-tight text-[var(--color-neutral-900)]">
        {{ activeUsersCount }}
      </p>
      <p class="mt-2 text-sm text-[var(--color-neutral-600)]">
        Authenticated operators in the current tenant context.
      </p>
    </div>
  </section>
</template>
