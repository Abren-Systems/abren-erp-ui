<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { transitionRecorder, type RuntimeTransition } from '../transition-recorder'
import AppSidePane from '@/shared/components/primitives/side-pane/AppSidePane.vue'

const isOpen = ref(false)
const transitions = ref<readonly RuntimeTransition[]>([])
const selectedTransition = ref<RuntimeTransition | null>(null)

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
        <div class="devtools-content">
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
</style>
