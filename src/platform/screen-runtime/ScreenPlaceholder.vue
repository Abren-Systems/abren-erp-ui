<template>
  <div class="screen-placeholder">
    <p>
      Screen <code>{{ screenId }}</code> has no render target configured.
    </p>
    <p>
      Add a <code>renderTarget</code> to the screen's layout definition, or implement the
      ScreenRenderer (Phase 4).
    </p>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const screenId = computed(() => route.meta?.screenId ?? 'unknown')
</script>

<style scoped>
.screen-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 8px;
  color: var(--color-text-secondary, #888);
  font-size: 14px;
}

.screen-placeholder code {
  background: var(--color-surface-secondary, #f0f0f0);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 13px;
}
</style>
