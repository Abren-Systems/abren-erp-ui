import { defineStore } from 'pinia'
import { ref } from 'vue'
import { eventBus } from '../event-bus/event-bus'
import type { AppEvent, EventMap } from '../event-bus/event-bus'

/**
 * Volatile Audit Store — Global Activity Tracking
 *
 * Intercepts all high-integrity cross-module events and maintains
 * a chronological log of user and system activity.
 */
export const useAuditStore = defineStore('audit', () => {
  const totalLogs = ref(0)
  const activityLog = ref<AppEvent<keyof EventMap, unknown>[]>([])
  const maxLogSize = 50

  /**
   * Start global interception of module events.
   */
  function initialize() {
    eventBus.on('payment-request:submitted', logEvent)
    eventBus.on('payment-request:approved', logEvent)
    eventBus.on('payment-request:rejected', logEvent)
    eventBus.on('payment-request:paid', logEvent)
    eventBus.on('vendor-bill:created', logEvent) // Added for traceability
    eventBus.on('vendor-bill:validated', logEvent)
    eventBus.on('journal-entry:posted', logEvent)
  }

  function logEvent(event: AppEvent<keyof EventMap, unknown>) {
    activityLog.value.unshift(event)
    totalLogs.value++

    if (activityLog.value.length > maxLogSize) {
      activityLog.value.pop()
    }
  }

  function clearLogs() {
    activityLog.value = []
    totalLogs.value = 0
  }

  return {
    activityLog,
    totalLogs,
    initialize,
    clearLogs,
  }
})
