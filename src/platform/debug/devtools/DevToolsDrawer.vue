<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { transitionRecorder, type RuntimeTransition } from '../transition-recorder'
import { activeController } from './devtools-registry'
import AppSidePane from '@/shared/components/primitives/side-pane/AppSidePane.vue'

const isOpen = ref(false)
const activeTab = ref<'history' | 'projection'>('history')
const transitions = ref<readonly RuntimeTransition[]>([])
const selectedTransition = ref<RuntimeTransition | null>(null)

const projection = computed(() => activeController.value?.model.value)

function syncTransitions() {
  transitions.value = [...transitionRecorder.getTransitions()].reverse()
}

// DevTools Activation State
const DEVTOOLS_STORAGE_KEY = '__abren_devtools_active'

onMounted(() => {
  // 1. URL Activation
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('__abren_devtools') === '1') {
    localStorage.setItem(DEVTOOLS_STORAGE_KEY, 'true')
  }

  // 2. LocalStorage Persistence
  if (localStorage.getItem(DEVTOOLS_STORAGE_KEY) === 'true') {
    isOpen.value = true
  }

  // 3. Global JS API
  // @ts-expect-error - dev tooling
  window.__ABREN_DEVTOOLS__ = {
    open: () => (isOpen.value = true),
    close: () => (isOpen.value = false),
  }

  // 4. Keyboard Shortcut (Ctrl+Shift+D)
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
      e.preventDefault()
      isOpen.value = !isOpen.value
      localStorage.setItem(DEVTOOLS_STORAGE_KEY, String(isOpen.value))
    }
  }
  window.addEventListener('keydown', handleKeydown)

  // Subscribe to transition events
  const unsubscribe = transitionRecorder.subscribe((transition) => {
    syncTransitions()
  })
  syncTransitions()

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
    unsubscribe()
  })
})
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="devtools-container">
      <AppSidePane :is-open="isOpen" title="Runtime Introspection" @close="isOpen = false">
        <div class="devtools-tabs">
          <button
            class="devtools-tab"
            :class="{ 'devtools-tab--active': activeTab === 'history' }"
            @click="activeTab = 'history'"
          >
            History
          </button>
          <button
            class="devtools-tab"
            :class="{ 'devtools-tab--active': activeTab === 'projection' }"
            @click="activeTab = 'projection'"
          >
            Projection (SoA)
          </button>
        </div>

        <div class="devtools-content">
          <!-- HISTORY TAB -->
          <template v-if="activeTab === 'history'">
            <div class="timeline">
              <h3 class="timeline-title">Transitions</h3>
              <ul class="transition-list">
                <li
                  v-for="t in transitions"
                  :key="t.id"
                  class="transition-item"
                  :class="{ 'transition-item--selected': selectedTransition?.id === t.id }"
                  @click="selectedTransition = t"
                >
                  <div class="transition-header">
                    <span class="transition-type">{{ t.trigger.type }}</span>
                    <span class="transition-time">{{
                      new Date(t.timestamp).toLocaleTimeString()
                    }}</span>
                  </div>
                  <div class="transition-source">{{ t.trigger.source }}</div>
                </li>
                <li v-if="transitions.length === 0" class="empty-state">
                  No transitions recorded yet. Mutate state to begin capture.
                </li>
              </ul>
            </div>

            <div class="inspector" v-if="selectedTransition">
              <h3 class="timeline-title">Patch Viewer</h3>
              <div class="patch-viewer">
                <pre>{{ JSON.stringify(selectedTransition.patch, null, 2) }}</pre>
              </div>

              <h3 class="timeline-title" v-if="selectedTransition.traces.length > 0">Traces</h3>
              <ul class="trace-list" v-if="selectedTransition.traces.length > 0">
                <li v-for="(trace, idx) in selectedTransition.traces" :key="idx" class="trace-item">
                  <span class="trace-kind">{{ trace.kind }}</span>
                  <span class="trace-target">{{ trace.targetId }}</span>
                  <pre class="trace-details">{{ JSON.stringify(trace, null, 2) }}</pre>
                </li>
              </ul>
            </div>
          </template>

          <!-- PROJECTION TAB -->
          <template v-else-if="activeTab === 'projection'">
            <div class="inspector inspector--projection" v-if="projection">
              <div class="soa-info">
                <h3 class="timeline-title">Authority State</h3>
                <div class="soa-card">
                  <div class="soa-row">
                    <span class="soa-label">Domain State</span>
                    <span class="soa-value">{{ projection.domain.backend.status || 'N/A' }}</span>
                  </div>
                  <div class="soa-row">
                    <span class="soa-label">OCC Version</span>
                    <span class="soa-value">{{
                      projection.domain.backend.operations?.version ?? 0
                    }}</span>
                  </div>
                </div>

                <h3 class="timeline-title">Field Authority Matrix</h3>
                <div class="matrix">
                  <table class="matrix-table">
                    <thead>
                      <tr>
                        <th>Field</th>
                        <th>Backend</th>
                        <th>UI Override</th>
                        <th>Final</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(meta, key) in projection.ui.fields.overrides" :key="key">
                        <td class="matrix-field">{{ key }}</td>
                        <td>
                          <span
                            class="permission-pill"
                            :class="`permission-pill--${projection.domain.backend.operations?.permissions[key] || 'editable'}`"
                          >
                            {{
                              projection.domain.backend.operations?.permissions[key] || 'editable'
                            }}
                          </span>
                        </td>
                        <td>
                          <span
                            v-if="meta.readonly !== undefined"
                            class="permission-pill permission-pill--readonly"
                            >readonly</span
                          >
                          <span
                            v-else-if="meta.hidden !== undefined"
                            class="permission-pill permission-pill--hidden"
                            >hidden</span
                          >
                          <span v-else>-</span>
                        </td>
                        <td>
                          <span v-if="meta.hidden" class="permission-pill permission-pill--hidden"
                            >hidden</span
                          >
                          <span
                            v-else-if="meta.readonly"
                            class="permission-pill permission-pill--readonly"
                            >readonly</span
                          >
                          <span v-else class="permission-pill permission-pill--editable"
                            >editable</span
                          >
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 class="timeline-title">Raw Projection</h3>
                <pre class="raw-json">{{ JSON.stringify(projection, null, 2) }}</pre>
              </div>
            </div>
            <div v-else class="empty-state">
              No active controller found. Navigate to a business screen.
            </div>
          </template>
        </div>
      </AppSidePane>
    </div>
  </Teleport>
</template>

<style scoped>
.devtools-container {
  /* High z-index to overlay everything in dev mode */
  position: relative;
  z-index: 999999;
}

.devtools-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.timeline {
  flex: 0 0 300px;
  border-bottom: 1px solid var(--color-neutral-200);
  overflow-y: auto;
  background: var(--color-neutral-50);
}

.inspector {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background: white;
}

.timeline-title {
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 700;
  color: var(--color-neutral-500);
  padding: 0.5rem 1rem;
  margin: 0;
  background: var(--color-neutral-100);
  border-bottom: 1px solid var(--color-neutral-200);
}

.transition-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.transition-item {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-neutral-200);
  cursor: pointer;
  transition: background-color 0.1s ease;
}

.transition-item:hover {
  background: var(--color-primary-50);
}

.transition-item--selected {
  background: var(--color-primary-100);
  border-left: 3px solid var(--color-primary-600);
}

.transition-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.transition-type {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-primary-700);
  text-transform: uppercase;
}

.transition-time {
  font-size: 0.7rem;
  color: var(--color-neutral-500);
}

.transition-source {
  font-size: 0.85rem;
  color: var(--color-neutral-900);
  word-break: break-all;
}

.patch-viewer pre,
.trace-details {
  font-family: 'Menlo', 'Monaco', monospace;
  font-size: 0.75rem;
  background: var(--color-neutral-900);
  color: var(--color-neutral-100);
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
}

.empty-state {
  padding: 2rem;
  text-align: center;
  color: var(--color-neutral-500);
  font-size: 0.875rem;
  font-style: italic;
}

.trace-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.trace-item {
  margin-bottom: 1rem;
  border: 1px solid var(--color-warning-200);
  border-radius: 4px;
  overflow: hidden;
}

.trace-kind {
  display: inline-block;
  background: var(--color-warning-100);
  color: var(--color-warning-800);
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  text-transform: uppercase;
}

.trace-target {
  font-size: 0.8rem;
  font-weight: 600;
  margin-left: 0.5rem;
}

.devtools-tabs {
  display: flex;
  background: var(--color-neutral-100);
  border-bottom: 1px solid var(--color-neutral-200);
}

.devtools-tab {
  flex: 1;
  padding: 0.75rem;
  border: none;
  background: transparent;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-neutral-500);
  cursor: pointer;
  transition: all 0.2s ease;
}

.devtools-tab--active {
  color: var(--color-primary-600);
  border-bottom: 2px solid var(--color-primary-600);
  background: white;
}

.soa-card {
  padding: 1rem;
  background: var(--color-neutral-50);
  border-bottom: 1px solid var(--color-neutral-200);
}

.soa-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
}

.soa-label {
  color: var(--color-neutral-500);
}

.soa-value {
  font-weight: 600;
  color: var(--color-neutral-900);
}

.matrix-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.75rem;
}

.matrix-table th {
  text-align: left;
  padding: 0.5rem;
  background: var(--color-neutral-50);
  color: var(--color-neutral-500);
  font-weight: 600;
  border-bottom: 1px solid var(--color-neutral-200);
}

.matrix-table td {
  padding: 0.5rem;
  border-bottom: 1px solid var(--color-neutral-100);
}

.matrix-field {
  font-family: 'Menlo', monospace;
  color: var(--color-neutral-700);
}

.permission-pill {
  display: inline-block;
  padding: 0.125rem 0.375rem;
  border-radius: 9999px;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
}

.permission-pill--editable {
  background: var(--color-success-100);
  color: var(--color-success-800);
}

.permission-pill--readonly {
  background: var(--color-neutral-100);
  color: var(--color-neutral-800);
}

.permission-pill--hidden {
  background: var(--color-neutral-800);
  color: white;
}

.raw-json {
  margin: 1rem;
  font-family: 'Menlo', monospace;
  font-size: 0.7rem;
  background: var(--color-neutral-900);
  color: var(--color-neutral-100);
  padding: 1rem;
  border-radius: 4px;
}
</style>
