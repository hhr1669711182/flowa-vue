<template>
  <div class="products">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold flex">
        <p>Inventory</p>
        <p class="text-#9A9A9A font-size-5">/All Products</p>
      </h2>

      <div class="flex items-center gap-3">
        <el-button type="primary" class="!px-4">
          <span class="flex items-center gap-2">
            <img src="./Icons/plus.svg" alt="plus" class="w-3 h-3" />
            <span>Add Product</span>
          </span>
        </el-button>
        <el-button link class="!text-gray-600 !px-2">
          <span class="flex items-center gap-1">
            <img src="./Icons/eye-slash.svg" alt="hide" class="w-4 h-4" />
            <span>Hide Data</span>
          </span>
        </el-button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4 box">
      <div class="bg-white rounded-xl border border-gray-100 shadow-card p-6">
        <div class="flex items-center justify-between mb-2">
          <div class="font-semibold">
            <div>Total Inventory</div>
            <div class="flex items-center gap-1">
              <Icon icon="svg-icon:circle-arrow-down" color="#0211A3" />
              <div class="text-#0211A3">45%</div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-28px font-bold text-#0211A3 line-height-36px">{{
              totalInventory
            }}</span>
          </div>
        </div>
        <div ref="invChartRef" class="w-full h-41"></div>
      </div>
      <div
        class="bg-white rounded-xl border border-gray-100 shadow-card p-6 flex"
      >
        <div class="font-semibold">
          <div class="whitespace-nowrap">Total Storage</div>
          <div class="flex items-center gap-1">
            <Icon icon="svg-icon:circle-check" color="#0211A3" />
            <div class="text-#0211A3">30%</div>
          </div>
        </div>

        <div ref="storageChartRef" class="w-full h-44 py-4"></div>
      </div>
      <div class="card position-relative w-full">
        <div class="flex items-center justify-between mb-2 p-6 position-absolute w-full box-border">
          <div class="text-sm font-semibold opacity-80">
            <div class="text-16px">Total Inventory Value</div>
            <div class="flex items-center gap-1">
              <Icon icon="svg-icon:circle-arrow-up" color="#BDBDBD" />
              <div class="text-#BDBDBD">45%</div>
            </div>
          </div>
          <div class="flex items-center justify-end mb-1">
            <span class="text-3xl font-bold">$9k</span>
          </div>
        </div>
        <div class="position-absolute bottom-1 left-0 w-full h-45 box-border">
          <img
            src="@/assets/svgs/bo-lang-blue.svg"
            width="100%"
            height="100%"
          />
        </div>
        <!-- <div ref="valueChartRef" class="w-full h-40"></div> -->
      </div>
    </div>

    <div
      class="bg-white rounded-xl border border-gray-100 shadow-card p-3 mb-3 flex items-center gap-3"
    >
      <el-input
        v-model="searchForm.sku"
        placeholder="Search by SKU..."
        clearable
        class="w-64"
      >
        <template #prefix>
          <img src="./Icons/search.svg" class="w-4 h-4" alt="search" />
        </template>
      </el-input>
      <el-select
        v-model="filters.lastDays"
        class="w-36"
        placeholder="Last 7 days"
      >
        <el-option label="Last 7 days" value="7" />
        <el-option label="Last 30 days" value="30" />
        <el-option label="Last 90 days" value="90" />
      </el-select>
      <el-date-picker
        v-model="filters.range"
        type="daterange"
        range-separator="to"
        start-placeholder="Start date"
        end-placeholder="End date"
        class="w-72"
      />
      <el-select v-model="filters.stock" class="w-32" placeholder="Stock">
        <el-option label="All" value="all" />
        <el-option label="Low" value="low" />
        <el-option label="Out of stock" value="out" />
      </el-select>
      <el-select v-model="filters.qty" class="w-36" placeholder="Product Qty">
        <el-option label="All" value="all" />
        <el-option label="< 100" value="<100" />
        <el-option label="100 - 500" value="100-500" />
        <el-option label="> 500" value=">500" />
      </el-select>
      <el-button plain>
        <span class="flex items-center gap-2">
          <img src="./Icons/filters.svg" class="w-4 h-4" alt="filters" />
          <span>Filters</span>
        </span>
      </el-button>
    </div>

    <BaseSearch
      v-model="searchForm"
      :items="searchItems"
      @search="handleSearch"
      @reset="handleReset"
    />

    <BaseTable
      :data="tableData"
      :columns="columns"
      :loading="loading"
      :pagination="true"
      :total="total"
      v-model:page="page"
      v-model:limit="limit"
      @pagination-change="fetchData"
      height="calc(100vh - 400px)"
    >
      <template #product="{ row }">
        <div class="flex items-center gap-3">
          <el-avatar :size="32" class="bg-gray-100 text-gray-700">P</el-avatar>
          <div class="flex flex-col">
            <span class="text-sm font-medium text-gray-800">{{
              row.name
            }}</span>
            <span class="text-xs text-gray-500">SKU {{ row.id }}</span>
          </div>
        </div>
      </template>
      <template #details="{ row }">
        <span class="text-xs text-gray-500"
          >{{ row.name }} · {{ row.category }}</span
        >
      </template>
      <template #incoming>
        <span>50</span>
      </template>
      <template #reserved="{ row }">
        <span>{{
          Math.floor(
            (typeof row.stock === "number"
              ? row.stock
              : Number(row.stock || 0)) / 10,
          )
        }}</span>
      </template>
      <template #available="{ row }">
        <span>{{
          typeof row.stock === "number" ? row.stock : Number(row.stock || 0)
        }}</span>
      </template>
      <template #total="{ row }">
        <span>{{
          (typeof row.stock === "number" ? row.stock : Number(row.stock || 0)) +
          50
        }}</span>
      </template>
      <template #cog="{ row }">
        <span>{{ String(row.price).replace("¥", "$ ") }}</span>
      </template>
      <template #actions>
        <el-button link type="primary" size="small">Edit</el-button>
        <el-button link type="primary" size="small">More</el-button>
      </template>
    </BaseTable>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, onBeforeUnmount, nextTick } from "vue";
import * as echarts from "echarts";
import axios from "axios";
import BaseTable from "../../components/common/BaseTable.vue";
import BaseSearch from "../../components/common/BaseSearch.vue";

// Search Configuration
const searchForm = reactive({
  name: "",
  category: "",
  sku: "",
});

const searchItems: any[] = [
  {
    label: "Product Name",
    prop: "name",
    type: "input",
    placeholder: "Product Name",
  },
  {
    label: "Category",
    prop: "category",
    type: "select",
    placeholder: "Select Category",
    options: [
      { label: "Electronics", value: "Electronics" },
      { label: "Clothing", value: "Clothing" },
      { label: "Home", value: "Home" },
      { label: "Books", value: "Books" },
    ],
  },
];

// Table Configuration
const columns = [
  { label: "Product / SKU ID", slot: "product", width: 260 },
  { label: "Details", slot: "details" },
  { label: "Incoming", slot: "incoming", width: 120 },
  { label: "Reserved", slot: "reserved", width: 120 },
  { label: "Available", slot: "available", width: 120 },
  { label: "Total", slot: "total", width: 120 },
  { label: "COG", slot: "cog", width: 140 },
  { label: "Actions", slot: "actions", width: 120, fixed: "right" },
];

// Data Logic
const tableData = ref([]);
const loading = ref(false);
const total = ref(0);
const page = ref(1);
const limit = ref(10);
const invChartRef = ref<HTMLElement | null>(null);
const storageChartRef = ref<HTMLElement | null>(null);
const valueChartRef = ref<HTMLElement | null>(null);
let invChart: echarts.ECharts | null = null;
let storageChart: echarts.ECharts | null = null;
let valueChart: echarts.ECharts | null = null;
const stats = reactive({
  electronics: 0,
  clothing: 0,
  home: 0,
  books: 0,
});
const totalInventory = ref(0);

const filters = reactive({
  lastDays: "7",
  range: "",
  stock: "all",
  qty: "all",
});

const updateStatsAndChart = () => {
  const data = (tableData.value as any[]) || [];
  const categories = ["Electronics", "Clothing", "Home", "Books"];
  const counts = [0, 0, 0, 0];
  const stocks = [0, 0, 0, 0];
  for (const item of data) {
    const idx = categories.indexOf(item.category);
    if (idx >= 0) {
      counts[idx] = (counts[idx] ?? 0) + 1;
      const s =
        typeof item.stock === "number" ? item.stock : Number(item.stock || 0);
      stocks[idx] = (stocks[idx] ?? 0) + (isNaN(s) ? 0 : s);
    }
  }
  stats.electronics = counts[0] ?? 0;
  stats.clothing = counts[1] ?? 0;
  stats.home = counts[2] ?? 0;
  stats.books = counts[3] ?? 0;
  totalInventory.value =
    (stocks[0] ?? 0) + (stocks[1] ?? 0) + (stocks[2] ?? 0) + (stocks[3] ?? 0);
  // 动态计算颜色：第一个是1，后面根据数据量动态设置步长，数据量大时最小步长0.05
  const maxCount = Math.max(...counts);
  const step = maxCount > 20 ? 0.05 : 1 / counts.length;
  const colors = counts.map((_, i) => {
    const alpha = i === 0 ? 1 : Math.max(0.05, 1 - i * step);
    return `rgba(2, 17, 163, ${alpha})`;
  });

  const option: echarts.EChartsOption = {
    grid: { left: 24, right: 24, top: 28, bottom: 24 },
    tooltip: { trigger: "axis", axisPointer: { type: "none" } },
    xAxis: {
      type: "category",
      data: categories,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        show: true,
        interval: 0,
        formatter: (value: string, index: number) => {
          return `{title|${value}}\n{sub|${counts[index]} items}`;
        },
        rich: {
          title: {
            color: "#000",
            fontWeight: 500,
            fontSize: 12,
            // padding: [0, 0, 6, 0],
            align: "center",
          },
          sub: {
            color: "#9A9A9A",
            // backgroundColor: "#F3F4F6",
            padding: [4, 8],
            // borderRadius: 12,
            fontSize: 12,
            align: "center",
          },
        },
      },
    },
    yAxis: {
      type: "value",
      axisLine: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
    },
    series: [
      {
        name: "Count",
        type: "bar",
        data: counts,
        itemStyle: {
          color: (params: any) => colors[params.dataIndex] || "#60a5fa",
          borderRadius: [8, 8, 8, 8],
        },
        barWidth: "60%",
      },
    ],
  };
  if (!invChart && invChartRef.value) {
    invChart = echarts.init(invChartRef.value);
    window.addEventListener("resize", onResize);
  }
  if (invChart) invChart.setOption(option);

  const storageOption: echarts.EChartsOption = {
    title: {
      text: "70%",
      left: "center",
      top: "center",
      textStyle: {
        color: "#0211A3",
        fontSize: 24,
        fontWeight: "bold",
      },
    },
    series: [
      {
        type: "pie",
        radius: ["60%", "90%"],
        center: ["50%", "50%"],
        avoidLabelOverlap: false,
        label: { show: false },
        labelLine: { show: false },
        data: [{ value: 100, name: "Full", itemStyle: { color: "#0211A31A" } }],
        silent: true,
        z: 1,
      },
      {
        type: "pie",
        radius: ["60%", "90%"],
        center: ["50%", "50%"],
        avoidLabelOverlap: false,
        label: { show: false },
        labelLine: { show: false },
        data: [
          {
            value: 70,
            name: "Used",
            itemStyle: { color: "#0211A3", borderRadius: "50%" },
          },
          { value: 30, name: "Free", itemStyle: { color: "transparent" } },
        ],
        silent: true,
        animationType: "scale",
        animationEasing: "elasticOut",
        z: 2,
      },
    ],
  };
  if (!storageChart && storageChartRef.value) {
    storageChart = echarts.init(storageChartRef.value);
  }
  if (storageChart) storageChart.setOption(storageOption);

  const valueOption: echarts.EChartsOption = {
    grid: { left: 10, right: 10, top: 10, bottom: 10 },
    xAxis: {
      type: "category",
      boundaryGap: false,
      show: false,
      data: Array.from({ length: 24 }).map((_, i) => i),
    },
    yAxis: { type: "value", show: false },
    series: [
      {
        type: "line",
        smooth: true,
        data: Array.from({ length: 24 }).map((_, i) =>
          Math.round(50 + 20 * Math.sin(i / 3)),
        ),
        areaStyle: { color: "rgba(99, 102, 241, 0.25)" },
        lineStyle: { color: "#60a5fa" },
      },
    ],
  };
  if (!valueChart && valueChartRef.value) {
    valueChart = echarts.init(valueChartRef.value);
  }
  if (valueChart) valueChart.setOption(valueOption);
};

const onResize = () => {
  if (invChart) invChart.resize();
  if (storageChart) storageChart.resize();
  if (valueChart) valueChart.resize();
};

const fetchData = async () => {
  loading.value = true;
  try {
    const response = await axios.get("/api/products", {
      params: {
        page: page.value,
        limit: limit.value,
        ...searchForm,
      },
    });
    tableData.value = response.data.data;
    // Mock total count
    total.value = 200;
    await nextTick();
    updateStatsAndChart();
  } catch (error) {
    console.error("Failed to fetch products:", error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  page.value = 1;
  fetchData();
};

const handleReset = () => {
  searchForm.name = "";
  searchForm.category = "";
  handleSearch();
};

onMounted(() => {
  fetchData();
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", onResize);
  if (invChart) {
    invChart.dispose();
    invChart = null;
  }
  if (storageChart) {
    storageChart.dispose();
    storageChart = null;
  }
  if (valueChart) {
    valueChart.dispose();
    valueChart = null;
  }
});
</script>
<style lang="less" scoped>
.card {
  padding: 4px;
  color: #fff;
  border-radius: 12px;
  background: linear-gradient(131deg, #16215b 26.84%, #0a123c 98.1%);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.06);
}
</style>
