<template>
  <div class="product-filter">
    <div class="py-2 flex items-center gap-3">
      <el-input
        v-model="searchForm.keyword"
        placeholder="Search by Invoice ID, Reference..."
        clearable
        class="!w-80"
        @keyup.enter="handleSearch"
        @input="handleSearch"
        @clear="handleSearch"
      >
        <template #prefix>
          <Icon icon="svg-icon:magnifier" />
        </template>
      </el-input>
      <el-date-picker
        v-model="filters.dateRange"
        type="daterange"
        range-separator="to"
        start-placeholder="Start date"
        end-placeholder="End date"
        value-format="YYYY-MM-DD"
        @change="handleSearch"
      />
      <el-select
        v-model="filters.status"
        class="!w-50 custom-select"
        placeholder="Status"
        @change="handleSearch"
      >
        <el-option label="All" value="" />
        <el-option label="Paid" value="Paid" />
        <el-option label="Pending" value="Pending" />
        <el-option label="Overdue" value="Overdue" />
      </el-select>

      <div class="flex-1"></div>

      <el-button plain @click="doDownloadTable">
        <span class="flex items-center gap-2">
          <Icon icon="svg-icon:arrow-down-to-square" color="#000" />
          <span class="text-[#000]">Download ALL</span>
        </span>
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { downloadAllInvoices } from '@/api/invoices'
import { ElMessage } from 'element-plus'
import { Icon } from '@iconify/vue'

const emit = defineEmits(['search'])

const searchForm = reactive({
  keyword: ''
})

const filters = reactive({
  status: '',
  dateRange: [] as string[] | [],
  quickRange: 'all' as 'last7' | 'last30' | 'thisMonth' | 'all'
})

const getSearchParams = () => {
  return {
    ...searchForm,
    ...filters,
  }
}

const handleSearch = () => {
  emit('search', getSearchParams())
}

const doDownloadTable = async () => {
  try {
    const res = await downloadAllInvoices()
    if (res?.url) {
      window.open(res.url, '_blank')
      ElMessage.success('Export started successfully')
    }
  } catch (error) {
    console.error('Export failed:', error)
    ElMessage.error('Export failed')
  }
}

defineExpose({
  getSearchParams
})
</script>

<style scoped>
:deep(.custom-select .el-input__wrapper) {
  border-radius: 9999px;
  box-shadow: 0 0 0 1px #a855f7 inset !important;
}
:deep(.custom-select .el-input__inner) {
  color: #111;
}
</style>
