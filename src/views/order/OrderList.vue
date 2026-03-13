<template>
  <div class="orders h-full flex flex-col">
    <div class="flex justify-between items-center mb-4 flex-shrink-0">
      <div>
        <div class="flex items-center gap-1 line-height-22px">
          <div class="text-#000 text-28px line-height-36px">Orders</div>
          <div class="text-#9A9A9A text-20px pt-1">/All Orders</div>
        </div>
        <div class="text-14px text-#6B6B6B">
          View and manage all your orders and their status.
        </div>
      </div>
      <div class="flex items-center gap-3">
        <el-button type="primary" size="large">
          <span class="flex items-center gap-2">
            <el-icon><Plus /></el-icon>
            <span>Create Order</span>
          </span>
        </el-button>
      </div>
    </div>

    <OrderFilter ref="filterRef" @search="handleFilterSearch" />
    
    <div class="flex-1 min-h-0 rounded-xl overflow-hidden">
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import BaseTable from '../../components/common/BaseTable.vue'
import OrderFilter from './components/OrderFilter.vue'
import { Plus } from '@element-plus/icons-vue'
import { getOrders } from '@/api/order'

// Filter State
const filterRef = ref()
const currentFilters = ref({})

const handleFilterSearch = (params: any) => {
  currentFilters.value = params
  page.value = 1
  fetchData()
}

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
    const res = await getOrders({
      page: page.value,
      pageSize: limit.value,
      ...currentFilters.value
    })
    tableData.value = res.list
    total.value = res.total
  } catch (error) {
    console.error('Failed to fetch orders:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await nextTick()
  if (filterRef.value) {
    currentFilters.value = filterRef.value.getSearchParams()
  }
  fetchData()
})
</script>
