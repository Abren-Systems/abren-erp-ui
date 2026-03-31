<script setup lang="ts">
import { computed } from 'vue'

interface ChartData {
  date: string
  actual: number
  projected: number
}

const props = defineProps<{
  data: ChartData[]
  title: string
}>()

// Calculate SVG path for "Actual"
const svgWidth = 800
const svgHeight = 300
const padding = 40

const maxVal = computed(() => {
  const vals = props.data.flatMap((d) => [d.actual, d.projected])
  return Math.max(...vals, 1) * 1.1
})

const getX = (index: number) => {
  return padding + (index * (svgWidth - 2 * padding)) / (props.data.length - 1 || 1)
}

const getY = (val: number) => {
  return svgHeight - padding - (val / maxVal.value) * (svgHeight - 2 * padding)
}

const actualPath = computed(() => {
  if (props.data.length === 0) return ''
  return props.data.reduce((path, d, i) => {
    const x = getX(i)
    const y = getY(d.actual)
    return path + (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`)
  }, '')
})

const projectedPath = computed(() => {
  if (props.data.length === 0) return ''
  return props.data.reduce((path, d, i) => {
    const x = getX(i)
    const y = getY(d.projected)
    return path + (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`)
  }, '')
})

const areaPath = computed(() => {
  if (props.data.length === 0) return ''
  const firstX = getX(0)
  const lastX = getX(props.data.length - 1)
  const baseline = getY(0)
  return `${actualPath.value} L ${lastX} ${baseline} L ${firstX} ${baseline} Z`
})
</script>

<template>
  <div
    class="chart-container group p-6 rounded-2xl bg-linear-to-br from-white to-slate-50 border border-slate-200 shadow-xl overflow-hidden"
  >
    <div class="flex items-center justify-between mb-8">
      <h3 class="text-xl font-semibold text-slate-800 tracking-tight">{{ title }}</h3>
      <div class="flex gap-4 text-sm font-medium">
        <div class="flex items-center gap-2">
          <span
            class="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
          ></span>
          <span class="text-slate-600">Actual</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-slate-300"></span>
          <span class="text-slate-400">Projected</span>
        </div>
      </div>
    </div>

    <div class="relative w-full aspect-[8/3]">
      <svg
        :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
        class="w-full h-full drop-shadow-2xl overflow-visible"
      >
        <!-- Gradients -->
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#3B82F6" stop-opacity="0.2" />
            <stop offset="100%" stop-color="#3B82F6" stop-opacity="0" />
          </linearGradient>
        </defs>

        <!-- Zero Line -->
        <line
          :x1="padding"
          :y1="getY(0)"
          :x2="svgWidth - padding"
          :y2="getY(0)"
          stroke="#e2e8f0"
          stroke-width="1"
        />

        <!-- Projected Path (Dashed) -->
        <path
          :d="projectedPath"
          fill="none"
          stroke="#cbd5e1"
          stroke-width="2"
          stroke-dasharray="6,4"
          class="transition-all duration-700 ease-out"
        />

        <!-- Actual Gradient Area -->
        <path
          :d="areaPath"
          fill="url(#areaGradient)"
          class="transition-all duration-1000 ease-in-out"
        />

        <!-- Actual Path -->
        <path
          :d="actualPath"
          fill="none"
          stroke="#3B82F6"
          stroke-width="4"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="animate-draw transition-all duration-700 ease-out"
        />

        <!-- Data Points -->
        <g v-for="(d, i) in data" :key="i">
          <circle
            :cx="getX(i)"
            :cy="getY(d.actual)"
            r="6"
            fill="white"
            stroke="#3B82F6"
            stroke-width="3"
            class="cursor-pointer hover:r-8 transition-all hover:fill-blue-500"
          >
            <title>{{ d.date }}: {{ d.actual }}</title>
          </circle>
        </g>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.chart-container {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.chart-container:hover {
  transform: translateY(-4px);
}

@keyframes draw {
  from {
    stroke-dasharray: 0 1000;
  }
  to {
    stroke-dasharray: 1000 0;
  }
}

.animate-draw {
  stroke-dasharray: 1000;
  animation: draw 2s ease-out;
}
</style>
