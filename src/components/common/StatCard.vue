<template>
  <div class="bg-white p-6 rounded-xl shadow-card hover:shadow-lg transition-shadow duration-300 border border-gray-100 flex flex-col justify-between h-full group">
    <div class="flex justify-between items-start">
      <div>
        <div class="text-sm font-medium text-gray-500 mb-1">{{ title }}</div>
        <div class="text-3xl font-bold text-gray-800 tracking-tight mt-1">{{ value }}</div>
      </div>
      <div 
        class="w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-300"
        :class="iconBgClass"
      >
        <el-icon :class="iconColorClass" class="text-xl">
           <component :is="icon" />
        </el-icon>
      </div>
    </div>
    
    <div v-if="subValue" class="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
       <div class="flex items-center text-sm">
        <span :class="trendClass" class="flex items-center font-semibold bg-opacity-10 px-1.5 py-0.5 rounded mr-2">
          <el-icon class="mr-1"><component :is="trendIcon" /></el-icon>
          {{ Math.abs(trend) }}%
        </span>
        <span class="text-gray-400 text-xs">vs last month</span>
       </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Top, Bottom, Minus, Money, ShoppingCart, User, Timer } from '@element-plus/icons-vue'

interface Props {
  title: string
  value: string | number
  icon?: any
  trend?: number
  subValue?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  trend: 0,
  subValue: false,
  icon: Money
})

const trendClass = computed(() => {
  if (props.trend > 0) return 'text-green-600 bg-green-50'
  if (props.trend < 0) return 'text-red-600 bg-red-50'
  return 'text-gray-500 bg-gray-50'
})

const trendIcon = computed(() => {
  if (props.trend > 0) return Top
  if (props.trend < 0) return Bottom
  return Minus
})

// Generate icon colors based on title (simplified hashing)
const iconBgClass = computed(() => {
   const colors = ['bg-blue-50', 'bg-purple-50', 'bg-orange-50', 'bg-teal-50']
   const index = props.title.length % colors.length
   return colors[index]
})

const iconColorClass = computed(() => {
   const colors = ['text-blue-500', 'text-purple-500', 'text-orange-500', 'text-teal-500']
   const index = props.title.length % colors.length
   return colors[index]
})
</script>
