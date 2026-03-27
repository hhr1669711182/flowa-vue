<template>
  <div class="support-filter py-3 flex flex-wrap items-center gap-3">
    <el-input
      v-model="searchForm.search"
      placeholder="Search by Ticket ID, Order ID, SKU..."
      clearable
      class="!w-80"
      @keyup.enter="handleSearch"
      @clear="handleSearch"
    >
      <template #prefix>
        <el-icon class="text-gray-400"><Search /></el-icon>
      </template>
    </el-input>

    <!-- <div class="h-8 w-[1px] bg-gray-200 mx-1"></div> -->

    <el-radio-group
      v-model="filters.quickDate"
      size="default"
      @change="handleQuickDateChange"
    >
      <el-radio-button label="7">Last 7 days</el-radio-button>
      <el-radio-button label="30">Last 30 days</el-radio-button>
      <el-radio-button label="">All</el-radio-button>
    </el-radio-group>

    <el-date-picker
      v-model="filters.dateRange"
      type="daterange"
      range-separator="-"
      start-placeholder="Start date"
      end-placeholder="End date"
      format="DD MMM"
      value-format="YYYY-MM-DD"
      class="!w-60"
      @change="handleSearch"
    />

    <el-select
      v-model="filters.type"
      class="!w-44"
      placeholder="Type of enquire"
      clearable
      @change="handleSearch"
    >
      <template #prefix>
        <el-icon class="mr-1"><Grid /></el-icon>
      </template>
      <el-option label="Order" value="Order" />
      <el-option label="Inventory" value="Inventory" />
      <el-option label="Billing" value="Billing" />
      <el-option label="Invoices" value="Invoices" />
      <el-option label="Settings" value="Settings" />
    </el-select>

    <el-select
      v-model="filters.status"
      class="!w-40"
      placeholder="Status"
      clearable
      @change="handleSearch"
    >
      <template #prefix>
        <el-icon class="mr-1"><InfoFilled /></el-icon>
      </template>
      <el-option label="Open" value="Open" />
      <el-option label="Resolved" value="Resolved" />
      <el-option label="Closed" value="Closed" />
      <el-option label="Investigating" value="Investigating" />
      <el-option label="Awaiting Support" value="Awaiting Support" />
    </el-select>
  </div>
  <div class="h-1px w-full bg-gray-200 mb-1"></div>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { Search, Grid, InfoFilled } from "@element-plus/icons-vue";

const emit = defineEmits(["search"]);

const searchForm = reactive({
  search: "",
});

const filters = reactive({
  quickDate: "7",
  dateRange: null as [string, string] | null,
  type: "",
  status: "",
});

const handleQuickDateChange = () => {
  // Logic to set filters.dateRange based on quickDate could go here
  handleSearch();
};

const getSearchParams = () => {
  return {
    ...searchForm,
    ...filters,
  };
};

const handleSearch = () => {
  emit("search", getSearchParams());
};

defineExpose({
  getSearchParams,
});
</script>

<style scoped>
:deep(.el-radio-button__inner) {
  border: none;
  background: transparent;
  padding: 0 8px;
  height: 32px;
  line-height: 32px;
  font-weight: 600;
  color: #6b7280;
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
