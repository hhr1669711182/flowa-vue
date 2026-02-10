<template>
  <div ref="chartRef" class="w-full h-full"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const chartRef = ref<HTMLElement>()
let chart: echarts.ECharts | null = null

const initChart = () => {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      bottom: '0%',
      left: 'center',
      icon: 'circle'
    },
    series: [
      {
        name: 'Categories',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 1048, name: 'Electronics', itemStyle: { color: '#4f46e5' } }, // Indigo
          { value: 735, name: 'Fashion', itemStyle: { color: '#06b6d4' } },    // Cyan
          { value: 580, name: 'Home', itemStyle: { color: '#8b5cf6' } },       // Violet
          { value: 484, name: 'Beauty', itemStyle: { color: '#ec4899' } },     // Pink
          { value: 300, name: 'Others', itemStyle: { color: '#9ca3af' } }      // Gray
        ]
      }
    ]
  }
  
  chart.setOption(option)
}

const resizeHandler = () => chart?.resize()

onMounted(() => {
  initChart()
  window.addEventListener('resize', resizeHandler)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeHandler)
  chart?.dispose()
})
</script>
