<template>
  <div class="orders-summary">
    <div class="summary-left">
      <div class="summary-title">Orders Summary</div>
      <div class="summary-rate">
        <span class="summary-rate-arrow">↗</span>
        <span>30%</span>
      </div>
    </div>
    <div class="summary-charts">
      <div v-for="item in orderStatus" :key="item.label" class="summary-chart">
        <div class="summary-ring">
          <el-progress
            type="circle"
            :percentage="item.percent"
            :width="142"
            :stroke-width="17"
            :show-text="false"
            :color="item.color"
            stroke-linecap="round"
            class="summary-progress"
          />
          <div class="summary-ring-text">
            <div class="summary-percent">{{ item.percent }}%</div>
            <div class="summary-orders">{{ item.orders }} Orders</div>
          </div>
        </div>
        <div class="summary-label">{{ item.label }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface OrderStatsProp {
  pending: number
  inProcess: number
  delivered: number
  percentPending: number
  percentInProcess: number
  percentDelivered: number
}

const props = defineProps<{
  orderStats?: OrderStatsProp | null
}>()

const defaultOrderStatus = [
  { label: 'Pending', percent: 70, orders: 45, color: '#0211A3' },
  { label: 'In Process', percent: 70, orders: 160, color: '#0211A3' },
  { label: 'Delivered', percent: 80, orders: 225, color: '#0211A3' }
]

const orderStatus = computed(() => {
  const s = props.orderStats
  if (!s) return defaultOrderStatus
  return [
    { label: 'Pending', percent: s.percentPending, orders: s.pending, color: '#0211A3' },
    { label: 'In Process', percent: s.percentInProcess, orders: s.inProcess, color: '#0211A3' },
    { label: 'Delivered', percent: s.percentDelivered, orders: s.delivered, color: '#0211A3' }
  ]
})
</script>

<style scoped>
.orders-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  height: 100%;
}

.summary-left {
  height: 92%;
  min-width: 140px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.summary-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.summary-rate {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #0211A3;
  font-weight: 600;
}

.summary-rate-arrow {
  font-size: 12px;
}

.summary-bars {
  display: flex;
  align-items: center;
  gap: 6px;
}

.summary-bar {
  width: 2px;
  height: 18px;
  border-radius: 2px;
}

.summary-bar.blue {
  background: #0211A3;
}

.summary-bar.orange {
  background: #FF7214;
}

.summary-charts {
  display: flex;
  align-items: center;
  gap: 24px;
  flex: 1;
  justify-content: space-between;
}

.summary-chart {
  display: grid;
  justify-items: center;
  gap: 10px;
  min-width: 140px;
}

.summary-ring {
  position: relative;
  width: 142px;
  height: 142px;
  display: grid;
  place-items: center;
}

.summary-progress :deep(.el-progress-circle__track) {
  stroke: #e5e7eb;
}

.summary-ring-text {
  position: absolute;
  display: grid;
  gap: 2px;
  text-align: center;
}

.summary-percent {
  font-size: 20px;
  font-weight: 700;
  color: #0211A3;
}

.summary-orders {
  font-size: 12px;
  color: #9ca3af;
}

.summary-label {
  font-weight: 600;
  color: #1f3aa9;
}
</style>
