<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  range: {
    type: String,
    default: '30d'
  },
  activationDate: {
    type: String,
    default: '2026-10-29'
  }
})

const hoveredIndex = ref(null)
const selectedMetric = ref('both') // 'both' | 'visitors' | 'visits'

// Chart dimensions inside SVG coordinate system
const svgWidth = 800
const svgHeight = 260
const padLeft = 45
const padRight = 25
const padTop = 25
const padBottom = 40
const plotWidth = svgWidth - padLeft - padRight
const plotHeight = svgHeight - padTop - padBottom

const hasData = computed(() => {
  return props.data && props.data.length > 0
})

const maxValue = computed(() => {
  if (!hasData.value) return 10
  let max = 0
  for (const d of props.data) {
    if ((d.totalVisits || 0) > max) max = d.totalVisits
    if ((d.uniqueVisitors || 0) > max) max = d.uniqueVisitors
  }
  // Ensure round grid numbers
  if (max === 0) return 5
  if (max <= 5) return 5
  if (max <= 10) return 10
  if (max <= 25) return 25
  if (max <= 50) return 50
  if (max <= 100) return 100
  return Math.ceil(max * 1.15)
})

const yGridTicks = computed(() => {
  const max = maxValue.value
  return [
    { value: max, y: padTop },
    { value: Math.round((max * 2) / 3), y: padTop + plotHeight * (1 / 3) },
    { value: Math.round(max / 3), y: padTop + plotHeight * (2 / 3) },
    { value: 0, y: padTop + plotHeight }
  ]
})

const points = computed(() => {
  if (!hasData.value) return []
  const len = props.data.length
  const step = len > 1 ? plotWidth / (len - 1) : 0
  const max = maxValue.value

  return props.data.map((d, i) => {
    const x = padLeft + i * step
    const yVisitors = padTop + plotHeight - ((d.uniqueVisitors || 0) / max) * plotHeight
    const yVisits = padTop + plotHeight - ((d.totalVisits || 0) / max) * plotHeight
    return {
      x,
      yVisitors,
      yVisits,
      data: d,
      index: i
    }
  })
})

const areaPathVisitors = computed(() => {
  if (points.value.length < 2) return ''
  const first = points.value[0]
  const last = points.value[points.value.length - 1]
  const baseY = padTop + plotHeight

  let d = `M ${first.x} ${baseY} L ${first.x} ${first.yVisitors}`
  for (let i = 1; i < points.value.length; i++) {
    const pt = points.value[i]
    d += ` L ${pt.x} ${pt.yVisitors}`
  }
  d += ` L ${last.x} ${baseY} Z`
  return d
})

const linePathVisitors = computed(() => {
  if (points.value.length < 1) return ''
  let d = `M ${points.value[0].x} ${points.value[0].yVisitors}`
  for (let i = 1; i < points.value.length; i++) {
    d += ` L ${points.value[i].x} ${points.value[i].yVisitors}`
  }
  return d
})

const linePathVisits = computed(() => {
  if (points.value.length < 1) return ''
  let d = `M ${points.value[0].x} ${points.value[0].yVisits}`
  for (let i = 1; i < points.value.length; i++) {
    d += ` L ${points.value[i].x} ${points.value[i].yVisits}`
  }
  return d
})

// Determine which points get date labels on X axis to avoid overcrowding
const xLabels = computed(() => {
  if (!hasData.value) return []
  const total = props.data.length
  let interval = 1
  if (total > 60) interval = 10
  else if (total > 20) interval = 4
  else if (total > 10) interval = 2

  const labels = []
  for (let i = 0; i < total; i++) {
    if (i === 0 || i === total - 1 || i % interval === 0) {
      const pt = points.value[i]
      if (pt) {
        labels.push({
          x: pt.x,
          text: formatDate(pt.data.date)
        })
      }
    }
  }
  return labels
})

const hoveredPoint = computed(() => {
  if (hoveredIndex.value === null || !points.value[hoveredIndex.value]) {
    return null
  }
  return points.value[hoveredIndex.value]
})

function formatDate(dateStr) {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  if (parts.length === 3) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const m = parseInt(parts[1], 10) - 1
    return `${parts[2]} ${months[m] || ''}`
  }
  return dateStr
}

function handleMouseMove(e) {
  if (!hasData.value || points.value.length === 0) return
  const svg = e.currentTarget
  const rect = svg.getBoundingClientRect()
  const clientX = e.clientX - rect.left
  const scaleX = svgWidth / rect.width
  const svgX = clientX * scaleX

  // Find closest point by x coordinate
  let closestIdx = 0
  let minDist = Infinity
  for (let i = 0; i < points.value.length; i++) {
    const dist = Math.abs(points.value[i].x - svgX)
    if (dist < minDist) {
      minDist = dist
      closestIdx = i
    }
  }
  hoveredIndex.value = closestIdx
}

function handleMouseLeave() {
  hoveredIndex.value = null
}
</script>

<template>
  <div class="visitor-trend-container">
    <!-- Chart Header & Metric Filters -->
    <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4">
      <div class="d-flex align-center ga-3">
        <span class="text-caption text-grey-lighten-1 font-weight-medium text-uppercase">Series:</span>
        <v-btn-toggle
          v-model="selectedMetric"
          mandatory
          density="compact"
          color="#00c2ff"
          variant="outlined"
          class="metric-toggle-group"
        >
          <v-btn value="both" size="small" class="px-3">All Metrics</v-btn>
          <v-btn value="visitors" size="small" class="px-3">Unique Visitors</v-btn>
          <v-btn value="visits" size="small" class="px-3">Total Visits</v-btn>
        </v-btn-toggle>
      </div>

      <!-- Chart Legend -->
      <div class="d-flex align-center ga-4 text-caption">
        <div v-if="selectedMetric === 'both' || selectedMetric === 'visitors'" class="d-flex align-center ga-1-5">
          <span class="legend-dot bg-cyan" />
          <span class="text-grey-lighten-1">Unique Visitors</span>
        </div>
        <div v-if="selectedMetric === 'both' || selectedMetric === 'visits'" class="d-flex align-center ga-1-5">
          <span class="legend-dot bg-sky" />
          <span class="text-grey-lighten-1">Total Visits / Sessions</span>
        </div>
      </div>
    </div>

    <!-- Responsive SVG Chart Canvas -->
    <div class="svg-wrapper" @mouseleave="handleMouseLeave">
      <svg
        :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
        class="trend-svg"
        preserveAspectRatio="none"
        @mousemove="handleMouseMove"
        @touchmove.passive="handleMouseMove"
      >
        <defs>
          <!-- Neon Gradient for Unique Visitors Area Fill -->
          <linearGradient id="visitorsAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#00c2ff" stop-opacity="0.32" />
            <stop offset="60%" stop-color="#00366F" stop-opacity="0.12" />
            <stop offset="100%" stop-color="#061b36" stop-opacity="0.0" />
          </linearGradient>

          <!-- Glow Filter for Active Line -->
          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <!-- Horizontal Grid Lines and Y-Axis Labels -->
        <g class="grid-lines">
          <template v-for="tick in yGridTicks" :key="tick.y">
            <line
              :x1="padLeft"
              :y1="tick.y"
              :x2="svgWidth - padRight"
              :y2="tick.y"
              stroke="rgba(255, 255, 255, 0.08)"
              stroke-width="1"
              stroke-dasharray="3,3"
            />
            <text
              :x="padLeft - 8"
              :y="tick.y + 4"
              fill="#94a3b8"
              font-size="11"
              font-family="'Plus Jakarta Sans', sans-serif"
              text-anchor="end"
            >
              {{ tick.value }}
            </text>
          </template>
        </g>

        <!-- Area Fill for Unique Visitors -->
        <path
          v-if="(selectedMetric === 'both' || selectedMetric === 'visitors') && areaPathVisitors"
          :d="areaPathVisitors"
          fill="url(#visitorsAreaGrad)"
        />

        <!-- Total Visits Line (Sky Blue Dashed Line) -->
        <path
          v-if="(selectedMetric === 'both' || selectedMetric === 'visits') && linePathVisits"
          :d="linePathVisits"
          fill="none"
          stroke="#38bdf8"
          stroke-width="2"
          stroke-dasharray="4,2"
          stroke-linejoin="round"
          stroke-linecap="round"
          opacity="0.85"
        />

        <!-- Unique Visitors Line (Vibrant Neon Cyan) -->
        <path
          v-if="(selectedMetric === 'both' || selectedMetric === 'visitors') && linePathVisitors"
          :d="linePathVisitors"
          fill="none"
          stroke="#00c2ff"
          stroke-width="2.5"
          filter="url(#neonGlow)"
          stroke-linejoin="round"
          stroke-linecap="round"
        />

        <!-- X-Axis Date Labels -->
        <g class="x-labels">
          <text
            v-for="(label, idx) in xLabels"
            :key="idx"
            :x="label.x"
            :y="svgHeight - 12"
            fill="#94a3b8"
            font-size="11"
            font-family="'Plus Jakarta Sans', sans-serif"
            text-anchor="middle"
          >
            {{ label.text }}
          </text>
        </g>

        <!-- Hovered Point Indicator Vertical Line & Circles -->
        <g v-if="hoveredPoint">
          <line
            :x1="hoveredPoint.x"
            :y1="padTop"
            :x2="hoveredPoint.x"
            :y2="padTop + plotHeight"
            stroke="#00c2ff"
            stroke-width="1.5"
            stroke-dasharray="2,2"
            opacity="0.9"
          />

          <!-- Visits Circle -->
          <circle
            v-if="selectedMetric === 'both' || selectedMetric === 'visits'"
            :cx="hoveredPoint.x"
            :cy="hoveredPoint.yVisits"
            r="4.5"
            fill="#38bdf8"
            stroke="#0B0F19"
            stroke-width="2"
          />

          <!-- Visitors Circle -->
          <circle
            v-if="selectedMetric === 'both' || selectedMetric === 'visitors'"
            :cx="hoveredPoint.x"
            :cy="hoveredPoint.yVisitors"
            r="6"
            fill="#00c2ff"
            stroke="#ffffff"
            stroke-width="2"
            filter="url(#neonGlow)"
          />
        </g>
      </svg>

      <!-- Floating Tooltip Box -->
      <div
        v-if="hoveredPoint"
        class="chart-tooltip"
        :style="{
          left: `${(hoveredPoint.x / svgWidth) * 100}%`,
          top: `${Math.min(hoveredPoint.yVisitors, hoveredPoint.yVisits) - 15}px`
        }"
      >
        <div class="tooltip-date font-weight-bold mb-1">
          📅 {{ hoveredPoint.data.date }}
          <span v-if="hoveredPoint.data.isPreActivation" class="text-caption text-warning ml-1">
            (Pre-activation)
          </span>
        </div>
        <div class="d-flex align-center justify-space-between ga-3 text-caption">
          <span class="text-grey-lighten-2">👥 Unique Visitors:</span>
          <span class="font-weight-bold text-cyan">{{ hoveredPoint.data.uniqueVisitors || 0 }}</span>
        </div>
        <div class="d-flex align-center justify-space-between ga-3 text-caption">
          <span class="text-grey-lighten-2">📊 Total Visits:</span>
          <span class="font-weight-bold text-sky">{{ hoveredPoint.data.totalVisits || 0 }}</span>
        </div>
        <div v-if="hoveredPoint.data.newVisitors > 0" class="d-flex align-center justify-space-between ga-3 text-caption">
          <span class="text-grey-lighten-2">🌱 New:</span>
          <span class="font-weight-bold text-white">{{ hoveredPoint.data.newVisitors }}</span>
        </div>
        <div v-if="hoveredPoint.data.returningVisitors > 0" class="d-flex align-center justify-space-between ga-3 text-caption">
          <span class="text-grey-lighten-2">🔁 Returning:</span>
          <span class="font-weight-bold text-emerald">{{ hoveredPoint.data.returningVisitors }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.visitor-trend-container {
  width: 100%;
}

.svg-wrapper {
  position: relative;
  width: 100%;
  height: 260px;
  background: rgba(11, 15, 25, 0.6);
  border-radius: 12px;
  border: 1px solid rgba(0, 54, 111, 0.4);
  padding: 4px;
}

.trend-svg {
  width: 100%;
  height: 100%;
  display: block;
  overflow: visible;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.bg-cyan {
  background-color: #00c2ff;
  box-shadow: 0 0 8px rgba(0, 194, 255, 0.6);
}

.bg-sky {
  background-color: #38bdf8;
}

.text-cyan {
  color: #00c2ff !important;
}

.text-sky {
  color: #38bdf8 !important;
}

.text-emerald {
  color: #10b981 !important;
}

.metric-toggle-group {
  border-color: rgba(0, 54, 111, 0.6) !important;
  background: #0B0F19;
}

.chart-tooltip {
  position: absolute;
  transform: translate(-50%, -100%);
  background: #080c14;
  border: 1px solid #00c2ff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.8), 0 0 15px rgba(0, 194, 255, 0.3);
  border-radius: 8px;
  padding: 8px 12px;
  pointer-events: none;
  z-index: 10;
  min-width: 170px;
  white-space: nowrap;
}

.tooltip-date {
  color: #f8fafc;
  font-size: 0.78rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 4px;
}
</style>
