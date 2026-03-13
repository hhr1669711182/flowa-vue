<template>
  <div class="bundle-filter py-3 flex flex-wrap items-center gap-3 w-70%">
    <el-input
      v-model="searchForm.sku"
      placeholder="Search by SKU..."
      clearable
      class="!w-64"
      @keyup.enter="handleSearch"
      @clear="handleSearch"
    >
      <template #prefix>
        <Icon icon="svg-icon:magnifier" />
      </template>
    </el-input>

    <!-- <div class="h-8 w-[1px] bg-gray-200 mx-1"></div> -->

    <!-- <el-radio-group v-model="filters.quickDate" size="default" @change="handleQuickDateChange">
      <el-radio-button label="7">Last 7 days</el-radio-button>
    </el-radio-group> -->

    <el-date-picker
      v-model="filters.range"
      type="daterange"
      range-separator="-"
      start-placeholder="Start date"
      end-placeholder="End date"
      format="DD MMM"
      value-format="YYYY-MM-DD"
      class="!w-80"
      @change="handleSearch"
    />

    <el-select 
      v-model="filters.stock" 
      class="!w-40" 
      placeholder="Stock"
      @change="handleSearch"
    >
      <template #prefix>
        <Icon icon="svg-icon:boxes-3" />
      </template>
      <el-option label="All Stock" value="all" />
      <el-option label="In Stock" value="in" />
      <el-option label="Low Stock" value="low" />
      <el-option label="Out of Stock" value="out" />
    </el-select>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const emit = defineEmits(['search'])

const searchForm = reactive({
  sku: ''
})

const filters = reactive({
  quickDate: '7',
  range: '',
  stock: 'all'
})

const handleQuickDateChange = () => {
  // Logic to set filters.range based on val could go here
  handleSearch()
}

const getSearchParams = () => {
  return {
    ...searchForm,
    ...filters
  }
}

const handleSearch = () => {
  emit('search', getSearchParams())
}

defineExpose({
  getSearchParams
})
</script>

<style scoped>
:deep(.el-radio-button__inner) {
  border: none;
  background: transparent;
  padding: 0 8px;
  height: 32px;
  line-height: 32px;
  font-weight: 600;
  color: #6B7280;
}
:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background-color: transparent;
  color: #000;
  box-shadow: none;
}
:deep(.el-input__wrapper) {
  border-radius: 8px;
}
</style>
