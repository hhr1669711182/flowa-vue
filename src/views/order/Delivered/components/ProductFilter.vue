<template>
  <div class="product-filter">
    <div class="py-2 flex items-center gap-3">
      <el-input
        v-model="searchForm.sku"
        placeholder="Search by Order ID, Platform ID, SKU..."
        clearable
        class="!w-80"
        @input="handleSearch"
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
        v-model="filters.stage"
        class="!w-50"
        placeholder="Stage"
        @change="handleSearch"
        clearable
      >
        <el-option label="All" value="all" />
        <el-option label="Review & Fix" value="fix" />
        <el-option label="Redelivery" value="redelivery" />
        <el-option label="Clearance" value="clearance" />
        <el-option label="Discontinued" value="discontinued" />
      </el-select>
      <el-button plain @click="showFilter = !showFilter">
        <span class="flex items-center gap-2">
          <Icon icon="svg-icon:sliders" color="#000" />
          <span class="text-[#000]">Filters</span>
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
import { reactive } from "vue";
import BaseSearch from "@/components/common/BaseSearch.vue";

const emit = defineEmits(["search"]);

const showFilter = ref(false);

const searchForm = reactive({
  name: "",
  category: "",
  sku: "",
});

const filters = reactive({
  lastDays: "7",
  range: "",
  stage: "all",
  status: "all",
  stock: "all",
});

const subFilters = reactive({
  // Advanced filters
  warehouse: "",
  packaging: "",
  label: "",
  invent: "",
  rangeMin: "",
  rangeMax: "",
  status: "",
  location: "",
  // Options
  descStock: false,
  ascStock: false,
  transit: false,
  ascCheck: false,
  descCheck: false,
});

const filterConfig: any[] = [
  // Top Row: Dropdowns & Range
  {
    type: "select",
    label: "Warehouse",
    prop: "warehouse",
    width: "140px",
    options: [
      { label: "Warehouse A", value: "a" },
      { label: "Warehouse B", value: "b" },
    ],
  },
  {
    type: "select",
    label: "Packaging",
    prop: "packaging",
    width: "140px",
    options: [
      { label: "Box", value: "box" },
      { label: "Bag", value: "bag" },
    ],
  },
  {
    type: "select",
    label: "Custom Label",
    prop: "label",
    width: "150px",
    options: [
      { label: "New", value: "new" },
      { label: "Sale", value: "sale" },
    ],
  },
  {
    type: "select",
    label: "Invent",
    prop: "invent",
    width: "120px",
    options: [
      { label: "In Stock", value: "in" },
      { label: "Out", value: "out" },
    ],
  },
  {
    type: "select",
    label: "Product Status",
    prop: "status",
    width: "160px",
    options: [
      { label: "Active", value: "active" },
      { label: "Draft", value: "draft" },
    ],
  },
  {
    type: "select",
    label: "Location Status",
    prop: "location",
    width: "160px",
    options: [
      { label: "Local", value: "local" },
      { label: "Remote", value: "remote" },
    ],
  },
  // Bottom Row: Toggle Options
  {
    type: "option",
    label: "Descending Stock",
    prop: "descStock",
    placement: "bottom",
  },
  {
    type: "option",
    label: "Ascending Stock",
    prop: "ascStock",
    placement: "bottom",
  },
  {
    type: "option",
    label: "In transit Quantity",
    prop: "transit",
    placement: "bottom",
  },
  {
    type: "option",
    label: "Ascending Inventory Check Time",
    prop: "ascCheck",
    placement: "bottom",
  },
  {
    type: "option",
    label: "Descending Inventory Check Time",
    prop: "descCheck",
    placement: "bottom",
  },
];

const getSearchParams = () => {
  return {
    ...searchForm,
    ...filters,
    ...(showFilter.value ? subFilters : {}),
  };
};

const handleSearch = () => {
  emit("search", getSearchParams());
};

const handleCloseFilter = () => {
  showFilter.value = false;
  Object.keys(subFilters).forEach((key) => {
    const k = key as keyof typeof subFilters;
    if (typeof subFilters[k] === "boolean") {
      (subFilters[k] as boolean) = false;
    } else {
      (subFilters[k] as string) = "";
    }
  });
  handleSearch();
};

// Initial emit to let parent know default values if needed,
// or parent calls fetchData directly.
// Ideally parent calls fetchData on mount.
// We can expose getSearchParams for parent's initial fetch.
defineExpose({
  getSearchParams,
});
</script>
