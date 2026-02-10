<template>
  <div class="orders">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">Order Management</h2>
        <p class="text-gray-500 mt-1">Manage your orders and track their status.</p>
      </div>
      <el-button type="primary" :icon="Plus">Create Order</el-button>
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
      <template #status="{ row }">
        <el-tag :type="getStatusType(row.status)" effect="plain" class="!rounded-md">
          {{ row.status }}
        </el-tag>
      </template>

      <template #operations>
        <el-button link type="primary" size="small">Detail</el-button>
        <el-button link type="primary" size="small">Edit</el-button>
      </template>
    </BaseTable>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import axios from 'axios'
import BaseTable from '../../components/common/BaseTable.vue'
import BaseSearch from '../../components/common/BaseSearch.vue'
import { Plus } from '@element-plus/icons-vue'

// Search Configuration
const searchForm = reactive({
  id: '',
  customer: '',
  status: ''
})

const searchItems = [
  { label: 'Order ID', prop: 'id', type: 'input', placeholder: 'Order ID' },
  { label: 'Customer', prop: 'customer', type: 'input', placeholder: 'Customer Name' },
  { 
    label: 'Status', 
    prop: 'status', 
    type: 'select', 
    placeholder: 'All Status',
    options: [
      { label: 'Pending', value: 'Pending' },
      { label: 'Processing', value: 'Processing' },
      { label: 'Completed', value: 'Completed' },
      { label: 'Cancelled', value: 'Cancelled' }
    ]
  }
] as const

// Table Configuration
const columns = [
  { prop: 'id', label: 'Order ID', width: 120 },
  { prop: 'date', label: 'Date', width: 180 },
  { prop: 'customer', label: 'Customer', width: 180 },
  { prop: 'amount', label: 'Amount' },
  { label: 'Status', slot: 'status', width: 120 },
  { label: 'Operations', slot: 'operations', width: 150, fixed: 'right' }
]

// Data Logic
const tableData = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const limit = ref(10)

const getStatusType = (status: string) => {
  switch (status) {
    case 'Completed': return 'success'
    case 'Processing': return 'primary'
    case 'Pending': return 'warning'
    case 'Cancelled': return 'danger'
    default: return 'info'
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    const response = await axios.get('/api/orders', {
      params: {
        page: page.value,
        limit: limit.value,
        ...searchForm
      }
    })
    tableData.value = response.data.data
    // Mock total count
    total.value = 100 
  } catch (error) {
    console.error('Failed to fetch orders:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  page.value = 1
  fetchData()
}

const handleReset = () => {
  searchForm.id = ''
  searchForm.customer = ''
  searchForm.status = ''
  handleSearch()
}

onMounted(() => {
  fetchData()
})
</script>
