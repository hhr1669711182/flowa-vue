<template>
  <div class="products h-full flex flex-col">
    <div class="flex justify-between items-center mb-4 flex-shrink-0">
      <div>
        <div class="flex items-center gap-1 line-height-22px">
          <div class="text-#000 text-28px line-height-36px">Billing</div>
          <div class="text-#9A9A9A text-20px pt-1">/Services</div>
        </div>
        <div class="text-14px text-#6B6B6B">
          View charges related to operational services performed by Flowa.
        </div>
      </div>
      <div class="flex items-center gap-3">
        <el-button type="default" size="large">
          <span class="flex items-center gap-2">
            <Icon icon="svg-icon:document-text" color="#16215B" />
            <span class="text-16px text-#16215B">Transaction History</span>
          </span>
        </el-button>
        <el-button type="primary" size="large">
          <span class="flex items-center gap-2">
            <Icon icon="mage:dollar" color="#fff" width="20" height="20" />
            <span>Recharge Credit</span>
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
        class="bg-white rounded-xl border border-gray-100 shadow-card p-6 flex"
      >
        <div class="font-semibold">
          <div class="whitespace-nowrap">Credit Remaining</div>
          <div class="flex items-center gap-1">
            <div class="text-#0211A3">$5,250</div>
            <div class="text-#9A9A9A">/ $10,500</div>
          </div>
        </div>

        <div ref="storageChartRef" class="w-full h-44 py-4"></div>
      </div>

      <div
        class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-59.5 animate__animated animate__fadeInUp flex flex-col flex-justify-around"
        style="animation-delay: 0.4s"
      >
        <div class="flex justify-between items-center mb-6">
          <div>
            <div class="text-lg font-bold text-#000">Reserved Credits</div>
            <div class="text-xs text-#0211A3 mt-0.5 flex items-center gap-2">
              <Icon
                icon="material-symbols:arrow-circle-up-outline-rounded"
                width="16"
                height="16"
                class="text-gray-400"
                color="#0211A3"
              />
              <span class="text-[14px]">{{ price }}</span>
            </div>
          </div>
          <el-button type="primary" size="large" class="!w-[128px] !rounded-2">
            <template #icon>
              <Icon
                icon="mage:dollar"
                width="24"
                height="24"
                style="color: #fff"
              />
            </template>
            Recharge</el-button
          >
        </div>
        <div class="w-full min-h-0">
          <div
            v-for="item in progressItems"
            :key="item.label"
            class="w-full mt-4.5"
          >
            <el-row justify="space-between" class="text-xs text-gray-600 mb-1">
              <el-col :span="12">{{ item.label }}</el-col>
              <el-col
                :span="12"
                class="text-right"
                :style="{ color: item.color }"
                >${{ item.value }}</el-col
              >
            </el-row>
            <el-progress
              :percentage="item.percent"
              :stroke-width="16"
              :show-text="false"
              :color="item.color"
              :style="{ '--el-progress-bg-color': '#e5e7eb' }"
            />
          </div>
        </div>
      </div>

      <div class="card position-relative w-full">
        <div
          class="flex items-center justify-between mb-2 p-6 position-absolute w-full box-border"
        >
          <div class="text-sm font-semibold opacity-80">
            <div class="text-16px">Total Savings</div>
            <div class="flex items-center gap-1">
              <Icon icon="svg-icon:circle-arrow-up" color="#BDBDBD" />
              <div class="text-#BDBDBD">12% vs. Traditional Method</div>
            </div>
          </div>
          <div class="flex items-center justify-end mb-1">
            <span class="text-3xl font-bold">$2,430</span>
          </div>
        </div>
        <div class="position-absolute bottom-1 left-0 w-full h-45 box-border">
          <img
            src="@/assets/svgs/bo-lang-blue.svg"
            width="100%"
            height="100%"
          />
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
      >
        <template #serviceId="{ row }">
          <div class="flex items-center gap-2">
            <div
              class="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100"
            >
              <Icon
                icon="svg-icon:document-text"
                class="text-gray-500 w-4 h-4"
              />
            </div>
            <span class="font-medium text-gray-900">{{ row.title }}</span>
          </div>
        </template>

        <template #date="{ row }">
          <span class="text-gray-500">{{
            row.code?.replace("Approved Date ", "")
          }}</span>
        </template>

        <template #type="{ row }">
          <span class="text-gray-500">{{ row.action }}</span>
        </template>
        
        <template #total="{ row }">
          <span class="font-medium text-gray-900">{{ row.statusNote }}</span>
        </template>

        <template #actions="{ row }">
          <el-button link>
            <el-icon><MoreFilled /></el-icon>
          </el-button>
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
import {
  Plus,
  Edit,
  ShoppingCart,
  Box,
  CreditCard,
  Document,
  Message,
  Lock,
  CircleCheck,
  View,
} from "@element-plus/icons-vue";
import * as echarts from "echarts";
import ProductFilter from "./components/ProductFilter.vue";
import ProductDetail from "./components/productDetail.vue";
import { exportInventoryProducts, getInventoryProducts } from "@/api/inventory";
import {
  getOutboundStats,
  getBillingNotifications,
  getBillingRecentOrders,
  markBillingNotificationAsRead,
} from "@/api/billing";
import { ElMessage } from "element-plus";
import { MoreFilled } from "@element-plus/icons-vue";
import productImage from "@/views/icon/yf.png";

const price = ref("$0");
const editVisible = ref(false);
const progressItems = ref<any[]>([]);
const notifications = ref<any[]>([]);
const recentOrders = ref<any[]>([]);

// Product Detail State
const detailVisible = ref(false);
const currentProductId = ref<string | undefined>(undefined);

const getIconComponent = (type: string) => {
  const map: Record<string, any> = {
    ShoppingCart,
    Box,
    CreditCard,
    Document,
    Message,
    Lock,
  };
  return markRaw(map[type] || Message);
};
const loadData = async () => {
  try {
    const [statsRes, notifRes, ordersRes] = await Promise.all([
      getOutboundStats(),
      getBillingNotifications(),
      getBillingRecentOrders(),
    ]);

    price.value = statsRes.price;
    progressItems.value = statsRes.progressItems;

    notifications.value = notifRes.map((n) => ({
      ...n,
      icon: getIconComponent(n.iconType),
    }));

    recentOrders.value = ordersRes.map((o) => ({
      ...o,
      image: o.image.includes("placeholder") ? productImage : o.image,
    }));
  } catch (error) {
    console.error("Failed to load dashboard data:", error);
  }
};

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
  { label: "Service ID", slot: "serviceId", width: 200 },
  { label: "Approved Date", slot: "date", width: 200 },
  { label: "Type", slot: "type", width: 200 },
  { label: "Total", slot: "total", width: "auto" },
  { label: "Actions", slot: "actions", width: 100, fixed: "right" },
];

// Data Logic
const tableData = ref([]) as any;
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
      text: "50%\nAvailable",
      left: "center",
      top: "center",
      textStyle: {
        color: "#0211A3",
        fontSize: 16,
        fontWeight: "bold",
        lineHeight: 24,
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
            value: 50,
            name: "Available",
            itemStyle: { color: "#0211A3", borderRadius: "50%" },
          },
          { value: 50, name: "Used", itemStyle: { color: "transparent" } },
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
    const res = await getBillingRecentOrders();
    tableData.value = res;
    total.value = res.length;
    await nextTick();
    updateStatsAndChart();
  } catch (error) {
    console.error("Failed to fetch services:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await nextTick();
  if (filterRef.value) {
    currentFilters.value = filterRef.value.getSearchParams();
  }
  loadData();
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
