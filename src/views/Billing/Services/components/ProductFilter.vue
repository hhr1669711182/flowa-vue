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
          <Icon icon="svg-icon:magnifier" />
        </template>
      </el-input>
      <el-date-picker
        v-model="filters.range"
        type="daterange"
        range-separator="to"
        start-placeholder="Start date"
        end-placeholder="End date"
        @change="handleSearch"
      />
      <el-select 
        v-model="filters.type" 
        class="!w-50 custom-select" 
        placeholder="Service Type"
        @change="handleSearch"
      >
        
        <el-option label="Service Type" value="Service Type" />
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
import { exportServicesBilling } from '@/api/billing/services'
import { ElMessage } from 'element-plus'

const emit = defineEmits(['search'])

const searchForm = reactive({
  sku: "",
})

const filters = reactive({
  type: "Service Type",
  range: [],
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
    const params = getSearchParams();
    const method = exportServicesBilling({
      company: "UU",
      ...params,
    });
    const res = await method;
    if (res?.url) {
      window.open(res.url, '_blank');
      ElMessage.success('Export started successfully');
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

<style scoped>
:deep(.custom-select .el-input__wrapper) {
  border-radius: 9999px;
  box-shadow: 0 0 0 1px #a855f7 inset !important;
}
:deep(.custom-select .el-input__inner) {
  color: #111;
}
</style>
