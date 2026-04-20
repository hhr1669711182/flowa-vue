<template>
  <div class="product-filter">
    <div class="py-2 flex items-center gap-3">
      <el-input
        v-model="searchForm.sku"
        placeholder="Search by SKU..."
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
        class="!w-66"
        v-model="filters.range"
        type="daterange"
        range-separator="to"
        start-placeholder="Start date"
        end-placeholder="End date"
        @change="handleSearch"
      />
      <!-- <el-select 
        v-model="filters.stock" 
        class="!w-50" 
        placeholder="Exception Fee"
        @change="handleSearch"
      >
        <el-option label="All" value="all" />
        <el-option label="Low" value="low" />
        <el-option label="Out of stock" value="out" />
      </el-select> -->
      <el-button plain @click="doDownloadTable">
        <span class="flex items-center gap-2">
          <Icon icon="svg-icon:arrow-down-to-square" color="#000" />
          <span class="text-[#000]">Download Table</span>
        </span>
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { exportStorageBilling } from "@/api/billing/storage";
import { ElMessage } from "element-plus";

const emit = defineEmits(["search"]);

const searchForm = reactive({
  name: "",
  category: "",
  sku: "",
});

const filters = reactive({
  lastDays: "7",
  range: [] as [string, string] | [],
  stock: "all",
  qty: "all",
});

const getSearchParams = () => {
  return {
    ...searchForm,
    ...filters,
  };
};

const handleSearch = () => {
  emit("search", getSearchParams());
};

const doDownloadTable = async () => {
  try {
    const params = getSearchParams();
    const exportParams = {
      company: "UU",
      name: params.name || params.sku,
      period_start: params.range && params.range.length ? params.range[0] : undefined,
      period_end: params.range && params.range.length ? params.range[1] : undefined,
    };
    const res = await exportStorageBilling(exportParams);
    if (res?.url) {
      window.open(res.url, "_blank");
      ElMessage.success("Export started successfully");
    }
  } catch (error) {
    console.error("Export failed:", error);
    ElMessage.error("Export failed");
  }
};

defineExpose({
  getSearchParams,
});
</script>
