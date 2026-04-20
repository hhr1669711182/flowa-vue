<template>
  <div class="product-filter">
    <div class="py-2 flex items-center gap-3">
      <el-input
        v-model="searchForm.sku"
        placeholder="Search by Order ID, Platform ID, SKU..."
        clearable
        class="!w-80"
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      >
        <template #prefix>
          <Icon icon="svg-icon:search" class="text-gray-400" />
        </template>
      </el-input>
      
      <el-button class="!rounded-full !bg-[#F3F4F6] !border-none !text-[#111] !px-4">
        Last 7 days <span class="mx-2 text-gray-300">|</span> 15 Mar - 21 Mar
        <Icon icon="svg-icon:calendar" class="ml-2 text-gray-500" />
      </el-button>

      <el-select 
        v-model="filters.type" 
        class="!w-50" 
        placeholder="Exception Fee"
        @change="handleSearch"
      >
        <el-option label="Exception Fee" value="Exception Fee" />
        <el-option label="Other" value="Other" />
      </el-select>
      
      <div class="flex-1"></div>

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
import { exportExceptionBilling } from '@/api/billing/exception'
import { triggerBillingDownload } from '@/api/billing'
import { ElMessage } from 'element-plus'

const emit = defineEmits(['search'])

const searchForm = reactive({
  sku: "",
})

const filters = reactive({
  type: "Exception Fee",
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
    const res = await exportExceptionBilling(getSearchParams()).send();
    const msg = (res as any)?.message ?? res;
    if (msg?.success && (msg?.file_url || msg?.file_content_base64)) {
      triggerBillingDownload(msg.file_url, msg.file_name, msg.file_content_base64);
      ElMessage.success('Export started successfully');
    } else if (msg?.url) {
      window.open(msg.url, '_blank');
      ElMessage.success('Export started successfully');
    } else {
      ElMessage.error(msg?.error || 'Export failed');
    }
  } catch (error) {
    console.error('Export failed:', error);
    ElMessage.error('Export failed');
  }
}

defineExpose({
  getSearchParams
})
</script>
