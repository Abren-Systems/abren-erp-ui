<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { AppButton } from '../button'

/**
 * AppSidePane — The authoritative surface for contextual work.
 *
 * Unlike traditional drawers, the SidePane is designed to be "Docked"
 * by default for triage workflows, or "Overlay" for transient tasks.
 * It is non-modal, allowing simultaneous interaction with the main content.
 */

interface Props {
  open: boolean
  title?: string
  description?: string
  width?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /**
   * mode:
   * - 'docked': Pushes the main content (requires flex parent)
   * - 'overlay': Floats over content with a shadow (non-modal)
   */
  mode?: 'docked' | 'overlay'
  showBackdrop?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  description: '',
  size: 'md',
  mode: 'overlay',
  showBackdrop: false,
})

const sizeWidths = {
  sm: '320px',
  md: '440px',
  lg: '640px',
  xl: '880px',
} as const

const emit = defineEmits(['update:open', 'close'])

function handleClose() {
  emit('update:open', false)
  emit('close')
}
</script>

<template>
  <div class="app-side-pane-container" :class="{ 'is-open': open && mode === 'overlay' }">
    <Transition name="pane-fade">
      <div
        v-if="open && mode === 'overlay' && showBackdrop"
        class="pane-backdrop"
        @click="handleClose"
      />
    </Transition>

    <Transition :name="mode === 'docked' ? 'pane-dock' : 'pane-overlay'">
      <aside
        v-if="open"
        class="app-side-pane"
        :class="[`is-${mode}`]"
        :style="{ width: width || sizeWidths[size] }"
      >
        <!-- Header Area -->
        <header class="pane-header">
          <div class="pane-header-content">
            <div class="flex items-center gap-3 overflow-hidden">
              <div v-if="$slots.icon" class="pane-icon">
                <slot name="icon" />
              </div>
              <div class="min-w-0">
                <h3 class="pane-title truncate">{{ title }}</h3>
                <p v-if="description" class="pane-description truncate">{{ description }}</p>
              </div>
            </div>
            <AppButton
              variant="stealth"
              size="sm"
              class="h-7 w-7 p-0 -mr-1 text-neutral-400 hover:text-neutral-900"
              @click="handleClose"
            >
              <X :size="14" />
            </AppButton>
          </div>
        </header>

        <!-- Content Area -->
        <div class="pane-body scrollbar-thin">
          <slot />
        </div>

        <!-- Footer Area -->
        <footer v-if="$slots.footer" class="pane-footer">
          <div class="flex items-center justify-end gap-2">
            <slot name="footer" />
          </div>
        </footer>
      </aside>
    </Transition>
  </div>
</template>

<style scoped>
.app-side-pane-container {
  display: contents;
}

.app-side-pane-container.is-open {
  display: block;
  position: absolute;
  inset: 0;
  z-index: 50;
  pointer-events: none;
}

.pane-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(2px);
  z-index: 40;
  pointer-events: auto;
}

.app-side-pane {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
  border-left: 1px solid var(--color-neutral-200);
  overflow: hidden;
  pointer-events: auto;
}

/* Docked Mode — Part of the layout flow */
.is-docked {
  position: relative;
  flex-shrink: 0;
  z-index: 10;
}

/* Overlay Mode — Floating without backdrop */
.is-overlay {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  box-shadow: -12px 0 32px rgba(0, 0, 0, 0.08);
}

.pane-header {
  height: 48px;
  flex-shrink: 0;
  padding: 0 16px;
  display: flex;
  align-items: center;
  background: var(--color-neutral-50);
  border-bottom: 1px solid var(--color-neutral-100);
}

.pane-header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.pane-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary-600);
}

.pane-title {
  margin: 0;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-neutral-900);
  line-height: 1.2;
}

.pane-description {
  margin: 1px 0 0;
  font-size: 10px;
  font-weight: 500;
  color: var(--color-neutral-500);
  line-height: 1.1;
}

.pane-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.pane-footer {
  padding: 12px 16px;
  background: var(--color-neutral-50);
  border-top: 1px solid var(--color-neutral-100);
  flex-shrink: 0;
}

/* Transitions */
.pane-dock-enter-active,
.pane-dock-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.pane-dock-enter-from,
.pane-dock-leave-to {
  width: 0 !important;
  opacity: 0;
  border-left-width: 0;
}

.pane-overlay-enter-active,
.pane-overlay-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.pane-overlay-enter-from,
.pane-overlay-leave-to {
  transform: translateX(100%);
}

.pane-fade-enter-active,
.pane-fade-leave-active {
  transition: opacity 0.3s ease;
}

.pane-fade-enter-from,
.pane-fade-leave-to {
  opacity: 0;
}
</style>
