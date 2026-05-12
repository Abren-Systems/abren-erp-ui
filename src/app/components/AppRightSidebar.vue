<script setup lang="ts">
/**
 * AppRightSidebar.vue
 *
 * The Right-hand "Record Services" or "Info Panel" bar.
 * Contains vertical tabs for record-specific services (Activities, Files, Relations).
 */
import {
  FileText,
  User,
  GitBranch,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Paperclip,
} from 'lucide-vue-next'
import { ref } from 'vue'

const isExpanded = ref(false)

const services = [
  { id: 'activities', label: 'Activities', icon: MessageSquare },
  { id: 'files', label: 'Files', icon: Paperclip },
  { id: 'invoices', label: 'Invoices and Memos', icon: FileText },
  { id: 'customer', label: 'Customer Details', icon: User },
  { id: 'relations', label: 'Related Documents', icon: GitBranch },
] as const

const activeService = ref<string | null>(null)

function toggleService(id: string) {
  if (activeService.value === id) {
    activeService.value = null
  } else {
    activeService.value = id
  }
}
</script>

<template>
  <aside
    class="right-sidebar flex flex-col border-l border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)]"
    :class="{ 'right-sidebar--active': activeService }"
  >
    <!-- Header/Toggle (Matching top bar alignment) -->
    <div
      class="flex items-center border-b border-[var(--color-neutral-200)] bg-[rgba(248,249,250,0.88)] backdrop-blur"
      style="height: var(--chrome-header-h); padding: 0 var(--layout-gutter)"
    >
      <div class="mx-auto h-4 w-4 rounded-full border-2 border-[var(--color-neutral-200)]" />
    </div>

    <!-- Service Icons -->
    <div class="flex flex-1 flex-col items-center gap-4 py-4">
      <button
        v-for="service in services"
        :key="service.id"
        class="service-btn group relative flex h-10 w-10 items-center justify-center transition-all"
        :class="{ 'service-btn--active': activeService === service.id }"
        @click="toggleService(service.id)"
        :title="service.label"
      >
        <component :is="service.icon" :size="18" class="relative z-10" />

        <!-- Vertical Label (Acumatica style) -->
        <span class="service-label" v-if="!activeService">
          {{ service.label }}
        </span>

        <!-- Indicator -->
        <div
          v-if="activeService === service.id"
          class="absolute right-0 top-1 bottom-1 w-[3px] bg-[var(--color-primary-600)]"
        />
      </button>
    </div>

    <!-- Expansion Panel (Contextual Service Content) -->
    <div v-if="activeService" class="service-panel animate-in slide-in-from-right-2">
      <div class="p-4">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xs font-bold uppercase tracking-widest text-[var(--color-neutral-500)]">
            {{ services.find((s) => s.id === activeService)?.label }}
          </h3>
          <button
            @click="activeService = null"
            class="text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-900)] transition-colors"
          >
            <ChevronRight :size="16" />
          </button>
        </div>

        <!-- Demonstrative Contextual Content -->
        <div class="space-y-6">
          <div v-for="i in 3" :key="i" class="space-y-2">
            <div class="flex justify-between items-start">
              <p class="text-[11px] font-semibold text-[var(--color-neutral-900)]">
                Record Event #{{ 1024 + i }}
              </p>
              <span class="text-[10px] text-[var(--color-neutral-400)]">{{ i }}h ago</span>
            </div>
            <p class="text-[11px] text-[var(--color-neutral-600)] leading-relaxed">
              Automated audit capture of contextual state transition for the current record.
            </p>
            <div class="h-px w-full bg-[var(--color-neutral-100)]" />
          </div>
        </div>

        <div
          class="mt-8 rounded border border-dashed border-[var(--color-neutral-200)] p-8 text-center text-[var(--color-neutral-400)] text-xs"
        >
          End of demonstrative services for {{ activeService }}
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.right-sidebar {
  width: 44px;
  height: 100%;
  transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  flex-shrink: 0;
}

.right-sidebar--active {
  width: 300px;
}

.service-btn {
  color: var(--color-neutral-500);
}

.service-btn:hover {
  color: var(--color-primary-600);
  background: var(--color-neutral-100);
}

.service-btn--active {
  color: var(--color-primary-600);
  background: white;
}

.service-label {
  position: absolute;
  right: 100%;
  white-space: nowrap;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 4px 8px;
  background: var(--color-neutral-900);
  color: white;
  border-radius: 4px;
  opacity: 0;
  pointer-events: none;
  transform: translateX(-10px);
  transition: all 0.2s ease;
}

.service-btn:hover .service-label {
  opacity: 1;
  transform: translateX(-4px);
}

.service-panel {
  position: absolute;
  top: 53px;
  left: 44px;
  right: 0;
  bottom: 0;
  background: white;
  border-left: 1px solid var(--color-neutral-100);
  overflow-y: auto;
}
</style>
