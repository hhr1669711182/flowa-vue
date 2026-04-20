<template>
  <div class="product-filter">
    <div class="py-2 flex items-center gap-3">
      <el-input
        v-model="searchForm.search"
        placeholder="Search..."
        clearable
        class="!w-80"
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      >
        <template #prefix>
          <Icon icon="svg-icon:magnifier" />
        </template>
      </el-input>
      <el-date-picker
        v-model="filters.range"
        type="daterange"
        value-format="YYYY-MM-DD"
        range-separator="to"
        start-placeholder="Start date"
        end-placeholder="End date"
        class="!w-64"
        @change="handleSearch"
      />
      <el-button plain @click="doDownloadTable">
        <span class="flex items-center gap-2">
          <Icon icon="svg-icon:arrow-down-to-square" color="#000"/>
          <span class="text-[#000]">Download Table</span>
        </span>
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { exportInboundBilling } from '@/api/billing/inbound'
import { triggerBillingDownload } from '@/api/billing'
import { getDefaultMonthStartToToday } from '@/utils/dateRange'
import { ElMessage } from 'element-plus'

const props = defineProps<{ company?: string }>()
const emit = defineEmits(['search'])

const searchForm = reactive({ search: '' })
const filters = reactive({ range: [] as string[] })

function defaultPeriod(): [string, string] {
  return getDefaultMonthStartToToday()
}

const getSearchParams = () => {
  const [period_start, period_end] = Array.isArray(filters.range) && filters.range.length === 2 ? filters.range : defaultPeriod()
  return { ...searchForm, ...filters, period_start, period_end, company: props.company || "UU" }
}

const handleSearch = () => emit('search', getSearchParams())

const doDownloadTable = async () => {
  const company = props.company || "UU"
  if (!company) {
    ElMessage.warning('Please ensure company is set (login or refresh).')
    return
  }
  try {
    const params = getSearchParams()
    const [period_start, period_end] = Array.isArray(filters.range) && filters.range.length === 2 ? filters.range : defaultPeriod()
    const res = await exportInboundBilling({
      company,
      period_start: params.period_start || period_start,
      period_end: params.period_end || period_end,
    }).send()
    const msg = (res as any)?.message ?? res
    if (msg?.success && (msg?.file_url || msg?.file_content_base64)) {
      triggerBillingDownload(msg.file_url, msg.file_name, msg.file_content_base64)
      ElMessage.success('Export started successfully')
    } else {
      ElMessage.error(msg?.error || 'Export failed')
    }
  } catch (e: any) {
    ElMessage.error(e?.message || 'Export failed')
  }
}

defineExpose({ getSearchParams })
</script>
