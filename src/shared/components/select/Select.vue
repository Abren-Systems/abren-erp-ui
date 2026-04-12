<script setup lang="ts">
/**
 * Design System Select component.
 *
 * A high-integrity dropdown selector built on Radix UI's Select primitives.
 * Provides a type-safe, accessible alternative to the native <select>.
 *
 * @example
 * <Select v-model="status">
 *   <SelectTrigger><SelectValue /></SelectTrigger>
 *   <SelectContent>
 *     <SelectItem value="active">Active</SelectItem>
 *   </SelectContent>
 * </Select>
 */
import {
  SelectRoot,
  type SelectRootEmits,
  type SelectRootProps,
  useForwardPropsEmits,
} from 'radix-vue'

const props = defineProps<SelectRootProps>()
const emits = defineEmits<SelectRootEmits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <SelectRoot v-bind="forwarded">
    <slot />
  </SelectRoot>
</template>
