<template>
  <div class="product-filter">
    <div class="py-2 flex items-center gap-3">
      <el-input
        v-model="searchForm.search"
        placeholder="Search Order ID..."
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
        start-placeholder="Pack date from"
        end-placeholder="Pack date to"
        class="!w-64"
        @change="handleSearch"
      />
      <el-select
        v-model="filters.destination_country"
        class="!w-56"
        placeholder="Destination Country"
        clearable
        filterable
        remote
        :remote-method="loadCountries"
        :loading="countryLoading"
        @visible-change="(v: boolean) => { if (v && !countryOptions.length) loadCountries('') }"
      >
        <el-option v-for="c in countryOptions" :key="c" :label="c" :value="c" />
      </el-select>
      <el-button plain @click="doDownloadTable">
        <span class="flex items-center gap-2">
          <Icon icon="svg-icon:arrow-down-to-square" color="#000"/>
          <span class="text-[#000]">Download Table</span>
        </span>
      </el-button>
      <el-button type="primary" @click="handleSearch">Query</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { exportOutboundBilling, getCountryOptions, triggerBillingDownload } from '@/api/billing'
import { getDefaultMonthStartToToday } from '@/utils/dateRange'
import { ElMessage } from 'element-plus'

const props = defineProps<{ company?: string }>()
const emit = defineEmits(['search'])

const searchForm = reactive({ search: '' })
const filters = reactive({
  range: [] as string[],
  destination_country: '',
})
const countryOptions = ref<string[]>([])
const countryLoading = ref(false)

const getSearchParams = () => {
  const [period_start, period_end] = Array.isArray(filters.range) ? filters.range : []
  return {
    search: searchForm.search,
    period_start: period_start || undefined,
    period_end: period_end || undefined,
    destination_country: filters.destination_country || undefined,
    company: props.company,
  }
}

const handleSearch = () => emit('search', getSearchParams())

async function loadCountries(keyword?: string) {
  countryLoading.value = true
  try {
    const res = await getCountryOptions({ keyword: keyword || undefined, limit: 200 }).send()
    const msg = (res as any)?.message ?? res
    const list = Array.isArray(msg?.data) ? msg.data : (Array.isArray(msg) ? msg : [])
    countryOptions.value = (list || []).filter((x: any) => typeof x === 'string' && x.trim())
  } catch {
    countryOptions.value = []
  } finally {
    countryLoading.value = false
  }
}

function defaultPeriod(): [string, string] {
  return getDefaultMonthStartToToday()
}

const doDownloadTable = async () => {
  if (!props.company) {
    ElMessage.warning('Please ensure company is set (login or refresh).')
    return
  }
  try {
    const params = getSearchParams()
    const [period_start, period_end] = (params.period_start && params.period_end) ? [params.period_start, params.period_end] : defaultPeriod()
    const res = await exportOutboundBilling({
      company: props.company,
      period_start,
      period_end,
      search: params.search,
      destination_country: params.destination_country,
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
