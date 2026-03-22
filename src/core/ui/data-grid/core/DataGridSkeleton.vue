<script setup lang="ts">
const props = withDefaults(defineProps<{
  rows?: number
  colspan: number
}>(), {
  rows: 8,
})
</script>

<template>
  <tr
    v-for="i in props.rows"
    :key="i"
    style="border-bottom: 1px solid var(--color-grid-divider); height: 30px;"
  >
    <td
      v-for="j in props.colspan"
      :key="j"
      style="padding: 6px 8px;"
    >
      <div
        class="skeleton-shimmer rounded"
        :style="{
          height: '12px',
          width: j === 1 ? '60%' : j === props.colspan ? '40%' : '75%',
        }"
      />
    </td>
  </tr>
</template>

<style scoped>
.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    var(--color-grid-skeleton) 25%,
    var(--color-grid-skeleton-shine) 50%,
    var(--color-grid-skeleton) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
