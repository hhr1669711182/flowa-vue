<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold flex">
        <p>Inventory</p>
        <p class="text-#9A9A9A font-size-5">/Bundles</p>
      </h2>
      <el-button type="primary" class="!px-4">
        <span class="flex items-center gap-2">
          <img src="./Icons/plus.svg" alt="plus" class="w-3 h-3" />
          <span>Create Bundle</span>
        </span>
      </el-button>
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
      <el-date-picker
        v-model="filters.range"
        type="daterange"
        range-separator="to"
        start-placeholder="Start date"
        end-placeholder="End date"
        class="w-72"
      />
      <el-select v-model="filters.status" class="w-36" placeholder="Status">
        <el-option label="All" value="all" />
        <el-option label="Active" value="active" />
        <el-option label="Inactive" value="inactive" />
      </el-select>
      <el-button plain class="!px-4">
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
      <template #bundle="{ row }">
        <div class="flex items-center gap-3">
          <el-avatar :size="32" class="bg-gray-100 text-gray-700">B</el-avatar>
          <div class="flex flex-col">
            <span class="text-sm font-medium text-gray-800">{{ row.name }}</span>
            <span class="text-xs text-gray-500">SKU {{ row.id }}</span>
          </div>
        </div>
      </template>
      <template #items="{ row }">
        <span class="text-xs text-gray-500">{{ row.items || 3 }} items</span>
      </template>
      <template #inventory="{ row }">
        <span>{{ typeof row.stock === 'number' ? row.stock : Number(row.stock || 0) }}</span>
      </template>
      <template #packWeight>
        <span>1.2 kg</span>
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
import { ref, reactive } from 'vue'
import axios from 'axios'
import BaseTable from '../../components/common/BaseTable.vue'
import BaseSearch from '../../components/common/BaseSearch.vue'

const searchForm = reactive({
  sku: '',
  name: '',
  status: 'all'
})

const filters = reactive({
  range: '',
  status: 'all'
})

const searchItems: any[] = [
  { label: 'Bundle Name', prop: 'name', type: 'input', placeholder: 'Bundle Name' },
  { label: 'SKU', prop: 'sku', type: 'input', placeholder: 'SKU' },
  { label: 'Status', prop: 'status', type: 'select', placeholder: 'Status', options: [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ] }
]

const columns = [
  { label: 'Bundle / SKU ID', slot: 'bundle' },
  { label: 'Items', slot: 'items', width: 120 },
  { label: 'Inventory', slot: 'inventory', width: 120 },
  { label: 'Packaging Weight', slot: 'packWeight', width: 160 },
  { label: 'COG', slot: 'cog', width: 140 },
  { label: 'Actions', slot: 'actions', width: 120, fixed: 'right' }
]

const tableData = ref<any[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const limit = ref(10)

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
    tableData.value = response.data.data.map((p: any) => ({ ...p, items: Math.floor(Math.random() * 5) + 2 }))
    total.value = 200
  } catch (error) {
    console.error('Failed to fetch bundles:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  page.value = 1
  fetchData()
}

const handleReset = () => {
  searchForm.sku = ''
  searchForm.name = ''
  searchForm.status = 'all'
  handleSearch()
}

fetchData()
</script>
