<template>
  <div class="products h-full flex flex-col">
    <div class="flex justify-between items-center mb-4 flex-shrink-0">
      <div>
        <div class="flex items-center gap-1 line-height-22px">
          <div class="text-#000 text-28px line-height-36px">Inventory</div>
          <div class="text-#9A9A9A text-20px pt-1">/All Products</div>
        </div>
        <div class="text-14px text-#6B6B6B">
          View and manage all your individual products and their stock status.
        </div>
      </div>
      <div class="flex items-center gap-3">
        <el-button type="default" size="large" @click="handleImport">
          <span class="flex items-center gap-1.5">
            <Icon icon="svg-icon:arrow-down-to-square" color="#16215B" />
            <span class="text-16px text-#16215B">Import SKU(s)</span>
          </span>
        </el-button>
        <el-button type="primary" size="large" @click="handleAddProduct">
          <span class="flex items-center gap-1.5">
            <Icon icon="svg-icon:plus" color="#fff" />
            <span>Add Product</span>
          </span>
        </el-button>
      </div>
    </div>

    <div class="w-full h-20px flex justify-end">
      <el-button
        link
        class="!text-gray-600 !px-2"
        @click="showCards = !showCards"
      >
        <span class="flex items-center gap-1">
          <Icon
            :icon="showCards ? 'svg-icon:eye-slash' : 'svg-icon:eye'"
            color="#16215B"
          />
          <span>{{ showCards ? "Hide Data" : "View Data" }}</span>
        </span>
      </el-button>
    </div>

    <div
      v-show="showCards"
      class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4 box"
    >
      <div
        class="bg-white rounded-xl border border-gray-100 shadow-card p-6 animate__animated animate__fadeInUp"
      >
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
        class="bg-white rounded-xl border border-gray-100 shadow-card p-6 flex animate__animated animate__fadeInUp"
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
      <div
        class="card overflow-hidden position-relative w-full animate__animated animate__fadeInUp"
      >
        <div
          class="position-absolute bottom-0 left-0 w-full h-85% box-border bg-[url('@/assets/svgs/bo-lang-blue.svg')] bg-no-repeat bg-cover bg-bottom"
        />
        <div
          class="flex items-center justify-between mb-2 p-6 position-absolute w-full box-border"
        >
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
      </div>
    </div>

    <ProductFilter ref="filterRef" @search="handleFilterSearch" />

    <div class="flex-1 min-h-0 rounded-xl overflow-hidden">
      <BaseTable
        :data="tableData"
        :columns="columns"
        :loading="loading"
        :pagination="true"
        :total="total"
        v-model:page="page"
        v-model:limit="limit"
        @pagination-change="fetchData"
        @expand-change="handleExpandChange"
      >
        <template #expand="{ row }">
          <div class="py-4 px-6 bg-#F7F7F7">
            <div class="bg-#fff rounded-lg border border-gray-200">
              <div
                class="grid grid-cols-2 gap-4 px-6 py-3 !border-b-1.5 border-0 border-solid border-#ECECEC"
              >
                <div>
                  <div class="flex items-center gap-3 mb-2">
                    <span class="text-xl font-bold text-gray-900">
                      {{ getExpandRow(row).name }}
                    </span>
                    <el-tag
                      :type="getStatusType(getExpandRow(row).status)"
                      effect="light"
                      round
                      size="small"
                      class="!border-0 font-medium"
                    >
                      {{ getExpandRow(row).status }}
                    </el-tag>
                  </div>
                  <div class="text-xs text-gray-500">
                    <span class="text-#000"
                      >SKU
                      {{ getExpandRow(row).sku || getExpandRow(row).id }}</span
                    >
                    <span class="mx-2">Last Update:</span>
                    <span>{{ getExpandRow(row).lastUpdated || "-" }}</span>
                  </div>
                </div>

                <div class="text-left text-sm">
                  <div class="mb-1">
                    <span class="text-gray-500 mr-2">Product</span>
                    <span class="text-#000 font-600">{{
                      getExpandRow(row).name
                    }}</span>
                  </div>
                  <div>
                    <span class="text-gray-500 mr-2">SKU</span>
                    <span class="text-#000 font-600">{{
                      getExpandRow(row).sku || getExpandRow(row).id
                    }}</span>
                  </div>
                </div>
              </div>
              <div class="px-6 py-4">
                <div class="grid grid-cols-12 gap-4 mb-4">
                  <div class="col-span-4">
                    <img
                      :src="getExpandRow(row).image || productImage"
                      alt="Product Image"
                      class="w-350px !h-350px rounded-lg object-cover"
                    />
                  </div>
                  <div class="col-span-8 h-full">
                    <div class="flex flex-col h-full gap-y-3">
                      <div class="col-span-2">
                        <div class="text-gray-500 text-sm">Product Name CN</div>
                        <div class="text-#000 text-16px">
                          {{
                            getExpandRow(row).nameCn || getExpandRow(row).name
                          }}
                        </div>
                      </div>
                      <div class="col-span-2">
                        <div class="text-gray-500 text-sm">Product Name EN</div>
                        <div class="text-#000 text-16px">
                          {{
                            getExpandRow(row).nameEn || getExpandRow(row).name
                          }}
                        </div>
                      </div>
                      <div class="col-span-2">
                        <div class="text-gray-500 text-sm mb-2">
                          Virtual Name
                        </div>
                        <div class="flex flex-wrap gap-2">
                          <el-tag
                            v-for="tag in getVirtualNames(getExpandRow(row))"
                            :key="tag"
                            effect="plain"
                            class="!rounded-full !border-gray-200 !text-gray-600"
                            closable
                            @close="handleClose(row, tag)"
                            size="large"
                          >
                            {{ tag }}
                          </el-tag>
                        </div>
                      </div>
                      <div
                        class="grid grid-cols-2 items-center justify-start gap-2 mt-auto pt-2"
                      >
                        <div>
                          <div class="text-gray-500 text-sm">Cost of Good</div>
                          <div class="text-#000 text-16px">
                            {{
                              formatMoney(
                                getExpandRow(row).cost ||
                                  getExpandRow(row).price,
                              )
                            }}
                          </div>
                        </div>
                        <div>
                          <div class="text-gray-500 text-sm">Best Before</div>
                          <div class="text-#000 text-16px">
                            {{ getExpandRow(row).bestBefore || "-" }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div class="text-gray-500 text-sm mb-1">Product Details</div>
                  <div class="text-#6b6b6b text-sm">
                    {{
                      getExpandRow(row).description ||
                      `${getExpandRow(row).name} details are not available.`
                    }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <template #product="{ row }">
          <div class="flex items-center gap-3">
            <!-- <el-avatar :size="32" class="bg-gray-100 text-gray-700"
              >P</el-avatar
            > -->
            <img
              :src="productImage"
              alt="Product Image"
              class="w-10 h-10 rounded-lg"
            />
            <div class="flex flex-col">
              <span class="text-sm font-medium text-gray-800">{{
                row.name
              }}</span>
              <span class="text-xs text-gray-500">SKU {{ row.id }}</span>
            </div>
          </div>
        </template>
        <template #details="{ row }">
          <el-tooltip
            effect="dark"
            :content="`${row.name} · ${row.category}`"
            placement="top"
            :disabled="!row.name && !row.category"
          >
            <span class="text-xs text-gray-500 text-ellipsis whitespace-nowrap"
              >{{ row.name }} · {{ row.category }}</span
            >
          </el-tooltip>
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
            (typeof row.stock === "number"
              ? row.stock
              : Number(row.stock || 0)) + 50
          }}</span>
        </template>
        <template #cog="{ row }">
          <span>{{ String(row.price).replace("¥", "$ ") }}</span>
        </template>
        <template #actions="{ row }">
          <div class="flex flex-1">
            <el-button class="w-8 h-8" @click="handleEditProduct(row)">
              <Icon icon="svg-icon:eye" color="#16215B" />
            </el-button>
            <el-popover
              placement="bottom-start"
              trigger="click"
              popper-class="!p-0 !px-2 !min-w-auto !rounded-lg !w-auto"
              :show-arrow="false"
            >
              <template #reference>
                <el-button class="w-8 h-8">
                  <Icon icon="svg-icon:ellipsis-vertical" color="#16215B" />
                </el-button>
              </template>
              <rightButtons :row="row" @action="handleRowAction" />
            </el-popover>
          </div>
        </template>
      </BaseTable>
    </div>

    <ProductDetail
      v-model:visible="detailVisible"
      :product-id="currentProductId"
      @save="handleSaveProduct"
      @delete="fetchData"
      @close="detailVisible = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, onBeforeUnmount, nextTick } from "vue";
import * as echarts from "echarts";
import ProductFilter from "./components/ProductFilter.vue";
import ProductDetail from "./components/productDetail.vue";
import {
  exportInventoryProducts,
  getInventoryProducts,
  getProductDetail,
  removeProductVirtualName,
} from "@/api/inventory";
import { ElMessage } from "element-plus";
import { createHeaderHintRenderer } from "@/components/common/TableHeaderHint";
import rightButtons from "./components/rightButtons.vue";

// ----------------- 临时数据
import productImage from "@/views/icon/yf.png";
// -----------------

// Product Detail State
const detailVisible = ref(false);
const currentProductId = ref<string | undefined>(undefined);

const handleAddProduct = () => {
  currentProductId.value = undefined;
  detailVisible.value = true;
};

const handleEditProduct = (row: any) => {
  currentProductId.value = row.id;
  detailVisible.value = true;
};

const handleImport = async () => {
  try {
    const res = await exportInventoryProducts({});
    if (res?.url) {
      window.open(res.url, "_blank");
      ElMessage.success("Export started successfully");
    }
  } catch (error) {
    ElMessage.error("Export failed");
  }
};

const handleSaveProduct = async (data: any) => {
  // Mock save logic
  console.log("Saved:", data);
  detailVisible.value = false;
  fetchData();
};

// Filter State
const filterRef = ref();
const currentFilters = ref({});

const handleFilterSearch = (params: any) => {
  currentFilters.value = params;
  page.value = 1;
  fetchData();
};

// Table Configuration
const columns = [
  { type: "selection", width: 50 },
  { type: "expand", width: 50, slot: "expand" },
  { label: "Product / SKU ID", slot: "product", width: 260 },
  { label: "Details", slot: "details", showOverflowTooltip: true },
  {
    label: "Incoming",
    slot: "incoming",
    width: 110,
    align: "center",
    headerRender: createHeaderHintRenderer(
      "Units that are currently being received or processed in the warehouse but are not yet available for fulfillment.",
    ),
  },
  {
    label: "Reserved",
    slot: "reserved",
    width: 110,
    align: "center",
    headerRender: createHeaderHintRenderer(
      "Units that have been allocated to existing orders and cannot be used for new orders.",
    ),
  },
  {
    label: "Available",
    slot: "available",
    width: 110,
    align: "center",
    headerRender: createHeaderHintRenderer(
      "Units currently in stock and ready to be allocated to new orders.",
    ),
  },
  {
    label: "Total",
    slot: "total",
    width: 80,
    align: "center",
    headerRender: createHeaderHintRenderer(
      "Total number of units stored in the warehouse, including reserved and available stock.",
    ),
  },
  {
    label: "COG",
    slot: "cog",
    width: 80,
    align: "center",
    headerRender: createHeaderHintRenderer(
      "The cost per unit of the product, used to calculate inventory value and margins.",
    ),
  },
  { label: "Actions", slot: "actions", width: 100, fixed: "right" },
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
const showCards = ref(true);
const expandDetailMap = ref<Record<string, any>>({});
const expandLoadingMap = ref<Record<string, boolean>>({});

const getExpandRow = (row: any) => {
  return expandDetailMap.value[row.id] || row;
};

const getVirtualNames = (row: any) => {
  if (Array.isArray(row.virtualNames) && row.virtualNames.length > 0)
    return row.virtualNames;
  const name = row.name || "Product";
  return [name, `${name} S`, `${name} M`, `${name} L`];
};

const formatMoney = (value: number | string) => {
  const num = typeof value === "number" ? value : Number(value || 0);
  return `$ ${num.toFixed(2)}`;
};

const getStatusType = (status: string) => {
  if (status === "In Stock") return "success";
  if (status === "Low Stock") return "warning";
  if (status === "Out of Stock") return "danger";
  return "info";
};

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
  // Calculate total inventory
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
    const res = await getInventoryProducts({
      page: page.value,
      pageSize: limit.value,
      ...currentFilters.value,
    });
    tableData.value = res.list;
    total.value = res.total;
    await nextTick();
    updateStatsAndChart();
  } catch (error) {
    console.error("Failed to fetch products:", error);
  } finally {
    loading.value = false;
  }
};

const handleExpandChange = async (row: any, expandedRows: any[]) => {
  if (!row?.id) return;
  const expanded =
    Array.isArray(expandedRows) &&
    expandedRows.some((item) => item.id === row.id);
  if (!expanded) return;
  if (expandDetailMap.value[row.id]) return;
  expandLoadingMap.value = { ...expandLoadingMap.value, [row.id]: true };
  try {
    const detail = await getProductDetail(row.id);
    if (detail) {
      expandDetailMap.value = { ...expandDetailMap.value, [row.id]: detail };
    }
  } finally {
    expandLoadingMap.value = { ...expandLoadingMap.value, [row.id]: false };
  }
};

const handleClose = async (row: any, tag: string) => {
  if (!row?.id || !tag) return;
  const res = await removeProductVirtualName(row.id, tag);
  if (!res?.success) return;
  const current = getExpandRow(row);
  expandDetailMap.value = {
    ...expandDetailMap.value,
    [row.id]: {
      ...current,
      virtualNames: res.virtualNames || [],
    },
  };
  ElMessage.success("Virtual name removed");
};

const handleRowAction = (action: string, row: any) => {
  switch (action) {
    case "view":
    case "edit":
      handleEditProduct(row);
      break;
    case "export":
      ElMessage.info(`Export/Print for product ${row.id}`);
      break;
    case "support":
      ElMessage.info(`Contact support for product ${row.id}`);
      break;
    case "delete":
      ElMessage.warning(`Delete action for product ${row.id}`);
      break;
    default:
      break;
  }
};

onMounted(async () => {
  await nextTick();
  if (filterRef.value) {
    currentFilters.value = filterRef.value.getSearchParams();
  }
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
