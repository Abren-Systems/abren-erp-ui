<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /**
   * The visual appearance of the button.
   * Maps to Microsoft Fluent's appearance tokens.
   */
  variant?: 'primary' | 'secondary' | 'stealth' | 'outline' | 'neutral' | 'danger'
  /** Standard button behavior types */
  type?: 'button' | 'submit' | 'reset'
  /** Disables interaction */
  disabled?: boolean
  /** Loading state (optional ERP enhancement) */
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'neutral',
  type: 'button',
  disabled: false,
  loading: false,
})

/**
 * Maps our AppButton variants to native Fluent appearance types.
 */
const fluentAppearance = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'accent'
    case 'stealth':
      return 'stealth'
    case 'outline':
      return 'outline'
    case 'danger':
      return 'neutral' // We'll style it with custom CSS below
    case 'neutral':
    case 'secondary':
    default:
      return 'neutral'
  }
})

// Define emits to ensure standard events are passed through
defineEmits(['click'])
</script>

<template>
  <fluent-button
    :appearance="fluentAppearance"
    :disabled="disabled || loading"
    :type="type"
    class="app-button-root"
    @click="$emit('click', $event)"
  >
    <!-- Start Icon Slot -->
    <span v-if="$slots.start" slot="start" class="flex items-center">
      <slot name="start" />
    </span>

    <!-- Progress Ring for Loading -->
    <fluent-progress-ring v-if="loading" slot="start" class="loading-ring" />

    <!-- Main Content -->
    <slot />

    <!-- End Icon Slot -->
    <span v-if="$slots.end" slot="end" class="flex items-center">
      <slot name="end" />
    </span>
  </fluent-button>
</template>

<style scoped>
/*
 * High-Density ERP Overrides
 * We target the custom element to ensure the spacing fits the Dynamics 365 Sales aesthetic.
 */
.app-button-root {
  /* Ensure the button matches our high-density spacing standard */
  height: 32px;
  min-width: 64px;
  cursor: pointer;

  /* 
   * Fluent components use CSS variables for their internal styling.
   * Here we can reinforce our 2px border-radius standard globally.
   */
  --control-corner-radius: 2px;

  /* Dynamics 365 uses tight font-weight and clear typography */
  font-family: var(--font-sans);
  font-size: 14px;
}

.loading-ring {
  width: 16px;
  height: 16px;
  --progress-ring-foreground: currentColor;
}

.flex {
  display: flex;
}
.items-center {
  align-items: center;
}

.app-button-root[appearance='accent'] {
  /* Optional: Force the specific Abren primary blue if the design token fails */
  /* --accent-fill-rest: #0078d4; */
}

/* 
 * Danger Variant Styling
 * Microsoft Fluent doesn't have a built-in 'destructive' appearance that matches 
 * our theme, so we manually apply our danger tokens.
 */
.app-button-root.variant-danger {
  --neutral-fill-rest: var(--color-danger-600);
  --neutral-fill-hover: var(--color-danger-700);
  --neutral-fill-active: var(--color-danger-800);
  --neutral-foreground-rest: #ffffff;
  --neutral-foreground-hover: #ffffff;
  --neutral-foreground-active: #ffffff;
  border-color: transparent;
}
</style>
