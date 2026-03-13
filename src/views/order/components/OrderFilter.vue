<template>
  <div class="order-filter">
    <div class="py-2 flex items-center gap-3">
      <el-input
        v-model="searchForm.id"
        placeholder="Search by Order ID..."
        clearable
        class="!w-60"
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-input
        v-model="searchForm.customer"
        placeholder="Search by Customer..."
        clearable
        class="!w-60"
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      >
        <template #prefix>
          <el-icon><User /></el-icon>
        </template>
      </el-input>
      <el-select
        v-model="searchForm.status"
        class="!w-40"
        placeholder="Status"
        clearable
        @change="handleSearch"
      >
        <el-option label="Pending" value="Pending" />
        <el-option label="Processing" value="Processing" />
        <el-option label="Completed" value="Completed" />
        <el-option label="Cancelled" value="Cancelled" />
      </el-select>
      
      <el-button plain @click="showFilter = !showFilter">
        <span class="flex items-center gap-2">
          <el-icon><Filter /></el-icon>
          <span>Filters</span>
        </span>
      </el-button>
    </div>

    <BaseSearch
      v-if="showFilter"
      v-model="subFilters"
      :items="filterConfig"
      @search="handleSearch"
      @close="handleCloseFilter"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import BaseSearch from '@/components/common/BaseSearch.vue'
import { Search, Filter, User } from '@element-plus/icons-vue'

const emit = defineEmits(['search'])

const showFilter = ref(false)

const searchForm = reactive({
  id: '',
  customer: '',
  status: ''
})

const subFilters = reactive({
  dateRange: '',
  amountMin: '',
  amountMax: '',
  paymentMethod: '',
  sortBy: ''
})

const filterConfig: any[] = [
  {
    type: 'select',
    label: 'Payment Method',
    prop: 'paymentMethod',
    width: '180px',
    options: [
      { label: 'Credit Card', value: 'card' },
      { label: 'PayPal', value: 'paypal' },
      { label: 'Bank Transfer', value: 'bank' }
    ]
  },
  {
    type: 'range',
    label: 'Amount',
    prop: 'amount',
  },
  {
    type: 'option',
    label: 'Sort by Date (Desc)',
    prop: 'sortBy',
    placement: 'bottom'
  }
]

const getSearchParams = () => {
  return {
    ...searchForm,
    ...(showFilter.value ? subFilters : {})
  }
}

const handleSearch = () => {
  emit('search', getSearchParams())
}

const handleCloseFilter = () => {
  showFilter.value = false
  // Reset subFilters
  subFilters.dateRange = ''
  subFilters.amountMin = ''
  subFilters.amountMax = ''
  subFilters.paymentMethod = ''
  subFilters.sortBy = ''
  handleSearch()
}

defineExpose({
  getSearchParams
})
</script>
