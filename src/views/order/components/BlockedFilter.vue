<template>
  <div class="px-4 py-3 bg-[#F1F1F1] border-b border-[#ECECEC] flex flex-wrap gap-3 items-center">
    <el-input
      v-model="filters.keyword"
      class="blocked-search !w-[368px] max-w-full"
      placeholder="Search by Order ID, Platform ID, SKU..."
      :prefix-icon="Search"
      clearable
      @input="handleDebouncedSearch"
      @clear="handleImmediateSearch"
    />
    <el-select v-model="filters.quickRange" class="!w-[150px]" @change="handleImmediateSearch">
      <el-option label="Last 7 days" value="last7" />
      <el-option label="Last 30 days" value="last30" />
      <el-option label="This month" value="thisMonth" />
      <el-option label="All time" value="all" />
    </el-select>
    <el-date-picker
      v-model="filters.dateRange"
      type="daterange"
      range-separator="-"
      start-placeholder="Start Date"
      end-placeholder="End Date"
      value-format="YYYY-MM-DD"
      class="!w-[260px]"
      @change="handleImmediateSearch"
    />
    <el-select v-model="filters.status" class="!w-[170px]" clearable placeholder="Status" @change="handleImmediateSearch">
      <el-option label="Blocked" value="Blocked" />
      <el-option label="Awaiting Review" value="Awaiting Review" />
      <el-option label="Escalated" value="Escalated" />
      <el-option label="Resolved" value="Resolved" />
    </el-select>
    <el-select v-model="filters.reason" class="!w-[190px]" clearable placeholder="Reason" @change="handleImmediateSearch">
      <el-option label="Address Error" value="Address Error" />
      <el-option label="Payment Risk" value="Payment Risk" />
      <el-option label="Inventory Hold" value="Inventory Hold" />
      <el-option label="Compliance Alert" value="Compliance Alert" />
      <el-option label="Manual Review" value="Manual Review" />
    </el-select>
    <el-button class="!h-10 !px-4" @click="openAdvancedFilterDialog">
      <el-icon class="mr-1"><Operation /></el-icon>
      Filters
    </el-button>

    <el-dialog v-model="advancedFilterVisible" title="Advanced Filters" width="520px" append-to-body destroy-on-close>
      <el-form :model="advancedFilterForm" label-position="top">
        <el-form-item label="Stage">
          <el-select v-model="advancedFilterForm.stage" class="w-full" clearable>
            <el-option label="Manual Hold" value="Manual Hold" />
            <el-option label="Compliance Check" value="Compliance Check" />
            <el-option label="Address Verification" value="Address Verification" />
            <el-option label="Payment Hold" value="Payment Hold" />
          </el-select>
        </el-form-item>
        <el-form-item label="Inventory">
          <el-select v-model="advancedFilterForm.inventory" class="w-full" clearable>
            <el-option label="In Stock" value="In Stock" />
            <el-option label="Reserved" value="Reserved" />
            <el-option label="Out of Stock" value="Out of Stock" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="advancedFilterVisible = false">Cancel</el-button>
          <el-button type="primary" @click="applyAdvancedFilter">Apply</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { Search, Operation } from '@element-plus/icons-vue'
import type { BlockedOrderStage, BlockedInventoryStatus, BlockedOrderStatus } from '@/api/orderBlocked'

const emit = defineEmits(['search'])

const filters = reactive<{
  keyword: string
  quickRange: 'last7' | 'last30' | 'thisMonth' | 'all'
  dateRange: [string, string] | []
  status: BlockedOrderStatus | ''
  reason: string
  stage: BlockedOrderStage | ''
  inventory: BlockedInventoryStatus | ''
}>({
  keyword: '',
  quickRange: 'last7',
  dateRange: [],
  status: '',
  reason: '',
  stage: '',
  inventory: ''
})

const advancedFilterVisible = ref(false)
const advancedFilterForm = reactive({
  stage: '' as BlockedOrderStage | '',
  inventory: '' as BlockedInventoryStatus | ''
})

let searchTimer: ReturnType<typeof setTimeout> | null = null

const handleDebouncedSearch = () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    emitSearch()
  }, 300)
}

const handleImmediateSearch = () => {
  emitSearch()
}

const openAdvancedFilterDialog = () => {
  advancedFilterForm.stage = filters.stage
  advancedFilterForm.inventory = filters.inventory
  advancedFilterVisible.value = true
}

const applyAdvancedFilter = () => {
  filters.stage = advancedFilterForm.stage
  filters.inventory = advancedFilterForm.inventory
  advancedFilterVisible.value = false
  emitSearch()
}

const emitSearch = () => {
  emit('search', { ...filters })
}

const getFilters = () => {
  return { ...filters }
}

defineExpose({ getFilters })
</script>

<style scoped>
.blocked-search :deep(.el-input__wrapper) {
  border-width: 1.5px;
}
</style>
