<template>
  <div class="products">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold flex">
        <p>Inventory</p>
        <p class="text-#9A9A9A font-size-5">/All Products</p>
      </h2>
      <div class="flex items-center gap-3">
        <el-button type="primary" class="!px-4">
          <span class="flex items-center gap-2">
            <img src="./Icons/plus.svg" alt="plus" class="w-3 h-3" />
            <span>Add Product</span>
          </span>
        </el-button>
        <el-button link class="!text-gray-600 !px-2">
          <span class="flex items-center gap-1">
            <img src="./Icons/eye-slash.svg" alt="hide" class="w-4 h-4" />
            <span>Hide Data</span>
          </span>
        </el-button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
      <div class="bg-white rounded-xl border border-gray-100 shadow-card p-4">
        <div class="flex items-center justify-between mb-2">
          <div class="text-sm font-semibold text-gray-700">Total Inventory</div>
          <div class="flex items-center gap-2">
            <el-tag size="small" type="info" effect="plain">45%</el-tag>
            <span class="text-xl font-bold text-indigo-700">{{ totalInventory }}</span>
          </div>
        </div>
        <div ref="invChartRef" class="w-full h-44"></div>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 shadow-card p-4">
        <div class="flex items-center justify-between mb-2">
          <div class="text-sm font-semibold text-gray-700">Total Storage</div>
          <el-tag size="small" type="info" effect="plain">30%</el-tag>
        </div>
        <div ref="storageChartRef" class="w-full h-44"></div>
      </div>
      <div class="rounded-xl shadow-card p-4 bg-[#0F1A3A] text-white">
        <div class="flex items-center justify-between mb-2">
          <div class="text-sm font-semibold opacity-80">Total Inventory Value</div>
          <el-tag size="small" effect="dark" class="!bg-white/10 !border-white/20 !text-white">15%</el-tag>
        </div>
        <div class="flex items-center justify-end mb-1">
          <span class="text-2xl font-bold">$9k</span>
        </div>
        <div ref="valueChartRef" class="w-full h-40"></div>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-gray-100 shadow-card p-3 mb-3 flex flex-wrap items-center gap-3">
      <el-input
        v-model="searchForm.sku"
        placeholder="Search by SKU..."
        clearable
        class="w-64"
      >
        <template #prefix>
          <img src="./Icons/search.svg" class="w-4 h-4" alt="search" />
        </template>
      </el-input>
      <el-select v-model="filters.lastDays" class="w-36" placeholder="Last 7 days">
        <el-option label="Last 7 days" value="7" />
        <el-option label="Last 30 days" value="30" />
        <el-option label="Last 90 days" value="90" />
      </el-select>
      <el-date-picker
        v-model="filters.range"
        type="daterange"
        range-separator="to"
        start-placeholder="Start date"
        end-placeholder="End date"
        class="w-72"
      />
      <el-select v-model="filters.stock" class="w-32" placeholder="Stock">
        <el-option label="All" value="all" />
        <el-option label="Low" value="low" />
        <el-option label="Out of stock" value="out" />
      </el-select>
      <el-select v-model="filters.qty" class="w-36" placeholder="Product Qty">
        <el-option label="All" value="all" />
        <el-option label="< 100" value="<100" />
        <el-option label="100 - 500" value="100-500" />
        <el-option label="> 500" value=">500" />
      </el-select>
      <el-button plain>
        <span class="flex items-center gap-2">
          <img src="./Icons/filters.svg" class="w-4 h-4" alt="filters" />
          <span>Filters</span>
        </span>
      </el-button>
    </div>

    <BaseSearch
      v-model="searchForm"
      :items="searchItems"
      @search="handleSearch"
      @reset="handleReset"
    />

    <BaseTable
      :data="tableData"
      :columns="columns"
      :loading="loading"
      :pagination="true"
      :total="total"
      v-model:page="page"
      v-model:limit="limit"
      @pagination-change="fetchData"
    >
      <template #product="{ row }">
        <div class="flex items-center gap-3">
          <el-avatar :size="32" class="bg-gray-100 text-gray-700">P</el-avatar>
          <div class="flex flex-col">
            <span class="text-sm font-medium text-gray-800">{{ row.name }}</span>
            <span class="text-xs text-gray-500">SKU {{ row.id }}</span>
          </div>
        </div>
      </template>
      <template #details="{ row }">
        <span class="text-xs text-gray-500">{{ row.name }} · {{ row.category }}</span>
      </template>
      <template #incoming>
        <span>50</span>
      </template>
      <template #reserved="{ row }">
        <span>{{ Math.floor((typeof row.stock === 'number' ? row.stock : Number(row.stock || 0)) / 10) }}</span>
      </template>
      <template #available="{ row }">
        <span>{{ typeof row.stock === 'number' ? row.stock : Number(row.stock || 0) }}</span>
      </template>
      <template #total="{ row }">
        <span>{{ (typeof row.stock === 'number' ? row.stock : Number(row.stock || 0)) + 50 }}</span>
      </template>
      <template #cog="{ row }">
        <span>{{ String(row.price).replace('¥', '$ ') }}</span>
      </template>
      <template #actions>
        <el-button link type="primary" size="small">Edit</el-button>
        <el-button link type="primary" size="small">More</el-button>
      </template>
    </BaseTable>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'
import axios from 'axios'
import BaseTable from '../../components/common/BaseTable.vue'
import BaseSearch from '../../components/common/BaseSearch.vue'

// Search Configuration
const searchForm = reactive({
  name: '',
  category: '',
  sku: ''
})

const searchItems: any[] = [
  { label: 'Product Name', prop: 'name', type: 'input', placeholder: 'Product Name' },
  { 
    label: 'Category', 
    prop: 'category', 
    type: 'select', 
    placeholder: 'Select Category',
    options: [
      { label: 'Electronics', value: 'Electronics' },
      { label: 'Clothing', value: 'Clothing' },
      { label: 'Home', value: 'Home' },
      { label: 'Books', value: 'Books' }
    ]
  }
]

// Table Configuration
const columns = [
  { label: 'Product / SKU ID', slot: 'product', width: 260 },
  { label: 'Details', slot: 'details' },
  { label: 'Incoming', slot: 'incoming', width: 120 },
  { label: 'Reserved', slot: 'reserved', width: 120 },
  { label: 'Available', slot: 'available', width: 120 },
  { label: 'Total', slot: 'total', width: 120 },
  { label: 'COG', slot: 'cog', width: 140 },
  { label: 'Actions', slot: 'actions', width: 120, fixed: 'right' }
]

// Data Logic
const tableData = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const limit = ref(10)
const invChartRef = ref<HTMLElement | null>(null)
const storageChartRef = ref<HTMLElement | null>(null)
const valueChartRef = ref<HTMLElement | null>(null)
let invChart: echarts.ECharts | null = null
let storageChart: echarts.ECharts | null = null
let valueChart: echarts.ECharts | null = null
const stats = reactive({
  electronics: 0,
  clothing: 0,
  home: 0,
  books: 0
})
const totalInventory = ref(0)

const filters = reactive({
  lastDays: '7',
  range: '',
  stock: 'all',
  qty: 'all'
})

const updateStatsAndChart = () => {
  const data = (tableData.value as any[]) || []
  const categories = ['Electronics', 'Clothing', 'Home', 'Books']
  const counts = [0, 0, 0, 0]
  const stocks = [0, 0, 0, 0]
  for (const item of data) {
    const idx = categories.indexOf(item.category)
    if (idx >= 0) {
      counts[idx] = (counts[idx] ?? 0) + 1
      const s = typeof item.stock === 'number' ? item.stock : Number(item.stock || 0)
      stocks[idx] = (stocks[idx] ?? 0) + (isNaN(s) ? 0 : s)
    }
  }
  stats.electronics = counts[0] ?? 0
  stats.clothing = counts[1] ?? 0
  stats.home = counts[2] ?? 0
  stats.books = counts[3] ?? 0
  totalInventory.value = (stocks[0] ?? 0) + (stocks[1] ?? 0) + (stocks[2] ?? 0) + (stocks[3] ?? 0)
  const option: echarts.EChartsOption = {
    grid: { left: 24, right: 24, top: 28, bottom: 24 },
    tooltip: { trigger: 'axis' },
    // legend: { data: ['Count', 'Stock'] },
    xAxis: { type: 'category', data: categories },
    yAxis: { type: 'value' },
    series: [
      { name: 'Count', type: 'bar', data: counts, itemStyle: { color: '#60a5fa' } },
      // { name: 'Stock', type: 'line', data: stocks, smooth: true, itemStyle: { color: '#10b981' } }
    ]
  }
  if (!invChart && invChartRef.value) {
    invChart = echarts.init(invChartRef.value)
    window.addEventListener('resize', onResize)
  }
  if (invChart) invChart.setOption(option)

  const storageOption: echarts.EChartsOption = {
    series: [
      {
        type: 'pie',
        radius: ['60%', '90%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        label: { show: false },
        labelLine: { show: false },
        data: [
          { value: 30, name: 'Used', itemStyle: { color: '#3b82f6' } },
          { value: 70, name: 'Free', itemStyle: { color: '#e5e7eb' } }
        ],
        silent: true,
        animationType: 'scale',
        animationEasing: 'elasticOut'
      }
    ]
  }
  if (!storageChart && storageChartRef.value) {
    storageChart = echarts.init(storageChartRef.value)
  }
  if (storageChart) storageChart.setOption(storageOption)

  const valueOption: echarts.EChartsOption = {
    grid: { left: 10, right: 10, top: 10, bottom: 10 },
    xAxis: { type: 'category', boundaryGap: false, show: false, data: Array.from({ length: 24 }).map((_, i) => i) },
    yAxis: { type: 'value', show: false },
    series: [
      {
        type: 'line',
        smooth: true,
        data: Array.from({ length: 24 }).map((_, i) => Math.round(50 + 20 * Math.sin(i / 3))),
        areaStyle: { color: 'rgba(99, 102, 241, 0.25)' },
        lineStyle: { color: '#60a5fa' }
      }
    ]
  }
  if (!valueChart && valueChartRef.value) {
    valueChart = echarts.init(valueChartRef.value)
  }
  if (valueChart) valueChart.setOption(valueOption)
}

const onResize = () => {
  if (invChart) invChart.resize()
  if (storageChart) storageChart.resize()
  if (valueChart) valueChart.resize()
}

const fetchData = async () => {
  loading.value = true
  try {
    const response = await axios.get('/api/products', {
      params: {
        page: page.value,
        limit: limit.value,
        ...searchForm
      }
    })
    tableData.value = response.data.data
    // Mock total count
    total.value = 200
    await nextTick()
    updateStatsAndChart()
  } catch (error) {
    console.error('Failed to fetch products:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  page.value = 1
  fetchData()
}

const handleReset = () => {
  searchForm.name = ''
  searchForm.category = ''
  handleSearch()
}

onMounted(() => {
  fetchData()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  if (invChart) { invChart.dispose(); invChart = null }
  if (storageChart) { storageChart.dispose(); storageChart = null }
  if (valueChart) { valueChart.dispose(); valueChart = null }
})
</script>
