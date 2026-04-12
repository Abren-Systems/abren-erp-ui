<script setup lang="ts">
import { useAuditStore } from '@/shared/infrastructure/audit.store'
import { storeToRefs } from 'pinia'
import { useTimeAgo } from '@vueuse/core'
import {
  FileText,
  User,
  CheckCircle2,
  XCircle,
  CreditCard,
  History,
  Activity,
} from 'lucide-vue-next'

const auditStore = useAuditStore()
const { activityLog, totalLogs } = storeToRefs(auditStore)

/**
 * Format the event name into a human-readable action.
 */
function formatAction(eventName: string): string {
  const parts = eventName.split(':')
  const entity = parts[0] || 'Activity'
  const action = parts[1] || ''
  const formattedEntity = entity.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  return `${formattedEntity} ${action}`
}

/**
 * Map source module to a semantic color.
 */
function getModuleColor(module: string): string {
  switch (module.toLowerCase()) {
    case 'ap':
      return 'bg-amber-100 text-amber-700 border-amber-200'
    case 'bank':
      return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'ledger':
      return 'bg-purple-100 text-purple-700 border-purple-200'
    case 'workflows':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    default:
      return 'bg-neutral-100 text-neutral-700 border-neutral-200'
  }
}

/**
 * Map event type to a Lucide icon.
 */
function getEventIcon(eventName: string) {
  if (eventName.includes('submitted')) return FileText
  if (eventName.includes('approved')) return CheckCircle2
  if (eventName.includes('rejected')) return XCircle
  if (eventName.includes('paid')) return CreditCard
  return Activity
}
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-2">
        <div class="p-2 bg-indigo-50 rounded-lg">
          <History class="w-5 h-5 text-indigo-600" />
        </div>
        <h3 class="text-lg font-semibold text-neutral-900">System Activity</h3>
      </div>
      <div
        class="px-2.5 py-0.5 text-xs font-semibold bg-indigo-100 text-indigo-700 rounded-full border border-indigo-200"
      >
        {{ totalLogs }} Hardened Events
      </div>
    </div>

    <!-- Feed List -->
    <div
      v-if="activityLog.length > 0"
      class="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar"
    >
      <div
        v-for="event in activityLog"
        :key="event.metadata.id"
        class="relative flex gap-4 pb-4 border-l-2 border-neutral-100 last:border-0 pl-6"
      >
        <!-- Connector Dot -->
        <div
          class="absolute left-[-9px] top-0 w-4 h-4 rounded-full border-2 border-white"
          :class="event.type.includes('rejected') ? 'bg-error-500' : 'bg-success-500'"
        ></div>

        <!-- Event Icon -->
        <div class="flex-shrink-0 mt-1">
          <component :is="getEventIcon(event.type)" class="w-4 h-4 text-neutral-400" />
        </div>

        <div class="flex flex-col flex-1 min-w-0">
          <div class="flex items-center justify-between gap-4 mb-1">
            <span class="text-sm font-semibold text-neutral-900 truncate">
              {{ formatAction(event.type) }}
            </span>
            <span class="text-xs text-neutral-400 whitespace-nowrap">
              {{ useTimeAgo(new Date(event.metadata.timestamp)).value }}
            </span>
          </div>

          <!-- Metadata Tags -->
          <div class="flex flex-wrap items-center gap-2 mb-2">
            <span
              class="px-2 py-0.5 text-[10px] font-bold uppercase rounded border tracking-wider"
              :class="getModuleColor(event.metadata.sourceModule)"
            >
              {{ event.metadata.sourceModule }}
            </span>
            <span
              class="text-[11px] font-mono text-neutral-500 bg-neutral-50 px-1.5 py-0.5 rounded border border-neutral-100"
            >
              #{{ event.payload.id.substring(0, 8) }}
            </span>
            <div
              v-if="event.metadata.actorId"
              class="flex items-center gap-1 text-[11px] text-neutral-500"
            >
              <User class="w-3 h-3" />
              <span>{{ event.metadata.actorId }}</span>
            </div>
          </div>

          <!-- Payload Details -->
          <p
            v-if="event.payload.reason"
            class="text-xs text-error-600 bg-error-50 p-2 rounded border border-error-100 italic"
          >
            "{{ event.payload.reason }}"
          </p>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="flex flex-col items-center justify-center flex-1 py-12 text-center text-neutral-400"
    >
      <div class="p-4 bg-neutral-50 rounded-full mb-4">
        <Activity class="w-8 h-8 text-neutral-300" />
      </div>
      <p class="text-sm italic">Monitoring hardened domain event stream...</p>
      <p class="text-[10px] mt-1 opacity-60 uppercase tracking-widest font-bold">
        Waiting for module activity
      </p>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e5e5e5;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #d4d4d4;
}
</style>
