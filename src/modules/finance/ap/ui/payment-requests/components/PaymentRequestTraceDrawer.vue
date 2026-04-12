<script setup lang="ts">
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/shared/components/sheet'
import { Badge } from '@/shared/components/badge'
import type { PaymentRequest } from '../../../domain/ap.types'

/**
 * Stage 3: TraceDrawer — Payment Request Provenance.
 *
 * Lazy-loaded contextual panel: workflow history, GL journal impact,
 * and linked source documents. Only shown when the user explicitly requests it.
 */

defineProps<{
  open: boolean
  request: PaymentRequest
}>()

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void
}>()
</script>

<template>
  <Sheet :open="open" @update:open="emit('update:open', $event)">
    <SheetContent class="sm:max-w-[480px] overflow-y-auto">
      <SheetHeader>
        <SheetTitle>Trace: Payment Request</SheetTitle>
        <SheetDescription>
          Workflow history and financial impact of this request.
        </SheetDescription>
      </SheetHeader>

      <div class="space-y-6 py-6">
        <!-- Workflow Timeline -->
        <section>
          <h3 class="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Workflow History
          </h3>
          <div class="space-y-3">
            <div class="flex items-start gap-3 rounded-md border p-3">
              <div class="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-neutral-400" />
              <div class="flex-1">
                <p class="text-sm font-medium">Created</p>
                <p class="text-xs text-neutral-500">
                  Requested by {{ request.requesterId }}
                </p>
              </div>
              <Badge variant="outline" class="text-xs">DRAFT</Badge>
            </div>

            <div
              v-if="['SUBMITTED', 'APPROVED', 'REJECTED', 'PAID'].includes(request.status)"
              class="flex items-start gap-3 rounded-md border p-3"
            >
              <div class="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-blue-400" />
              <div class="flex-1">
                <p class="text-sm font-medium">Submitted for Approval</p>
                <p class="text-xs text-neutral-500">
                  {{ request.submittedAt ?? 'Date unavailable' }}
                </p>
              </div>
              <Badge variant="secondary" class="text-xs">SUBMITTED</Badge>
            </div>

            <div
              v-if="request.status === 'APPROVED' || request.status === 'PAID'"
              class="flex items-start gap-3 rounded-md border p-3"
            >
              <div class="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-green-500" />
              <div class="flex-1">
                <p class="text-sm font-medium">Approved</p>
                <p class="text-xs text-neutral-500">
                  Approved by {{ request.assignedApproverId ?? 'approver' }}
                </p>
              </div>
              <Badge variant="default" class="text-xs">APPROVED</Badge>
            </div>

            <div
              v-if="request.status === 'REJECTED'"
              class="flex items-start gap-3 rounded-md border border-destructive/20 bg-destructive/5 p-3"
            >
              <div class="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />
              <div class="flex-1">
                <p class="text-sm font-medium text-destructive">Rejected</p>
              </div>
              <Badge variant="destructive" class="text-xs">REJECTED</Badge>
            </div>

            <div
              v-if="request.status === 'PAID'"
              class="flex items-start gap-3 rounded-md border p-3"
            >
              <div class="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
              <div class="flex-1">
                <p class="text-sm font-medium">Payment Recorded</p>
                <p class="text-xs text-neutral-500">
                  {{ request.paidAt ?? 'Date unavailable' }}
                </p>
              </div>
              <Badge variant="default" class="text-xs">PAID</Badge>
            </div>
          </div>
        </section>

        <!-- GL Journal Impact -->
        <section v-if="request.targetLiabilityAccountId">
          <h3 class="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            GL Impact
          </h3>
          <div class="rounded-lg border p-3 text-sm space-y-2">
            <div class="flex justify-between">
              <span class="text-neutral-500">Liability Account</span>
              <code class="text-xs font-mono">
                {{ request.targetLiabilityAccountId.slice(0, 8) }}…
              </code>
            </div>
            <div class="flex justify-between">
              <span class="text-neutral-500">Bank Account</span>
              <code class="text-xs font-mono">
                {{ request.bankAccountId?.slice(0, 8) ?? '—' }}
              </code>
            </div>
          </div>
        </section>

        <!-- Source Document -->
        <section v-if="request.sourceModule">
          <h3 class="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Source Document
          </h3>
          <div class="rounded-lg border p-3 text-sm space-y-1">
            <div class="flex justify-between">
              <span class="text-neutral-500">Module</span>
              <span class="font-medium">{{ request.sourceModule }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-neutral-500">Document ID</span>
              <code class="text-xs font-mono">{{ request.sourceId ?? '—' }}</code>
            </div>
          </div>
        </section>
      </div>
    </SheetContent>
  </Sheet>
</template>
