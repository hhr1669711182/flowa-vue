<template>
  <div class="products h-full flex flex-col" v-show="!showHistory">
    <div class="flex justify-between items-center mb-4 flex-shrink-0">
      <div>
        <div class="flex items-center gap-1 line-height-22px">
          <div class="text-#000 text-28px line-height-36px">Billing</div>
          <div class="text-#9A9A9A text-20px pt-1">/Outbound</div>
        </div>
        <div class="text-14px text-#6B6B6B">
          Review outbound shipping costs, performance insights, and savings
          generated with Flowa.
        </div>
      </div>
      <div class="flex items-center gap-3">
        <el-button type="default" size="large" @click="showHistory = true">
          <span class="flex items-center gap-1">
            <Icon icon="svg-icon:file-dollar" color="#16215B" />
            <span class="text-16px text-#16215B">Transaction History</span>
          </span>
        </el-button>
        <el-button type="primary" size="large" @click="handleAddCredit">
          <span class="flex items-center gap-1">
            <Icon icon="svg-icon:circle-dollar" color="#fff" />
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
        class="bg-white rounded-xl border border-gray-100 shadow-card p-6 flex animate__animated animate__fadeInUp"
      >
        <div class="font-semibold">
          <div class="whitespace-nowrap text-[16px] line-height-24px">
            Balance
            <el-tooltip
              class="box-item"
              effect="dark"
              content="!!!!"
              placement="top-start"
            >
              <Icon icon="svg-icon:circle-question" color="#9A9A9A" />
            </el-tooltip>
          </div>
          <div class="flex items-center gap-1 text-[14px]">
            <Icon icon="svg-icon:circle-arrow-up" color="#0211A3" />
            <div class="text-#0211A3">{{ price }}</div>
            <div class="text-#9A9A9A">/ {{ creditTotal }}</div>
          </div>
        </div>

        <div ref="storageChartRef" class="w-full h-44 py-4"></div>
      </div>

      <div
        class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-59.5 animate__animated animate__fadeInUp flex flex-col flex-justify-around"
      >
        <div class="flex justify-between items-center mb-6">
          <div>
            <div class="text-lg font-bold text-#000">
              Reserved Credits
              <el-tooltip
                class="box-item"
                effect="dark"
                content="Highlighted amount = latest month outbound revenue (same as Total Revenue below). Progress rows use that month. Balance card is account snapshot."
                placement="top-start"
              >
                <Icon icon="svg-icon:circle-question" color="#9A9A9A" />
              </el-tooltip>
            </div>
            <div v-if="latestMonthLabel" class="text-xs text-gray-400 mt-0.5">
              Latest month: {{ latestMonthLabel }}
            </div>
            <div class="text-xs text-#0211A3 mt-0.5 flex items-center gap-2">
              <Icon
                icon="material-symbols:arrow-circle-up-outline-rounded"
                width="16"
                height="16"
                class="text-gray-400"
                color="#0211A3"
              />
              <span class="text-[14px]">{{ reservedDisplay }}</span>
            </div>
          </div>
          <el-button type="primary" size="large" class="!w-[128px] !rounded-2" @click="handleAddCredit">
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
                >{{ item.prefix ?? '$' }}{{ item.value }}</el-col
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

      <div
        class="card position-relative w-full animate__animated animate__fadeInUp"
      >
        <div
          class="position-absolute bottom-0 left-0 w-full h-85% box-border bg-[url('@/assets/svgs/bo-lang-blue.svg')] bg-no-repeat bg-contain bg-bottom"
        />
        <div
          class="flex items-center justify-between mb-2 p-6 position-absolute w-full box-border"
        >
          <div class="text-sm font-semibold opacity-80">
            <div class="text-16px">Total Savings</div>
            <div class="flex items-center gap-1">
              <Icon icon="svg-icon:circle-arrow-up" color="#BDBDBD" />
              <div class="text-#BDBDBD text-12px">Outbound total</div>
            </div>
          </div>
          <div class="flex items-center justify-end mb-1">
            <span class="text-3xl font-bold">{{ totalSavings }}</span>
          </div>
        </div>
      </div>
    </div>

    <ProductFilter ref="filterRef" :company="authStore.currentCompany ?? undefined" @search="handleFilterSearch" />

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
        <template #trackingNo="{ row }">
          <span class="text-sm text-gray-700">{{ row.tracking_no || "-" }}</span>
        </template>
        <template #chargeWeight="{ row }">
          <span class="text-sm text-gray-700">{{ row.charge_weight ?? 0 }}</span>
        </template>
        <template #totalUsd="{ row }">
          <span class="font-bold text-gray-900">${{ (row.total_cost_usd ?? 0).toFixed(2) }}</span>
        </template>
        <template #actions="{ row }">
          <div class="flex flex-1 items-center gap-1">
            <el-button class="w-8 h-8" title="View Fee Details" @click="handleViewDetail(row)">
              <Icon icon="svg-icon:eye" color="#16215B"/>
            </el-button>
            <el-dropdown trigger="click" @command="(cmd) => cmd === 'view' && handleViewDetail(row)">
              <el-button class="w-8 h-8">
                <Icon icon="svg-icon:ellipsis-vertical" color="#16215B"/>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="view">
                    <Icon icon="svg-icon:eye" class="mr-2" />
                    View Fee Details
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </template>
      </BaseTable>
    </div>

    <ProductDetail
      v-model:visible="detailVisible"
      :billing-detail-id="currentDetailId"
      :company="authStore.currentCompany ?? undefined"
      @close="detailVisible = false"
    />

    <AddCredit
      v-model:visible="addCreditVisible"
      @success="loadData"
    />
  </div>
  <div v-if="showHistory">
    <History ref="historyRef" @close="showHistory = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, onBeforeUnmount, nextTick, markRaw } from "vue";
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
import AddCredit from "./components/addCredit.vue";
import History from "./components/History.vue";
import { useAuthStore } from "@/store/modules/auth";
import {
  getOutboundBillingList,
  getOutboundStats,
  getBillingNotifications,
} from "@/api/billing";
import { getDefaultMonthStartToToday } from "@/utils/dateRange";
import { ElMessage } from "element-plus";
import productImage from "@/views/icon/yf.png";

const authStore = useAuthStore();

function defaultPeriod(): [string, string] {
  return getDefaultMonthStartToToday();
}

/** ProductFilter 传的是 period_start/period_end；onMounted 可能还带 range。二者择一，否则默认当月。 */
function resolveBillingPeriod(f: Record<string, any> | undefined | null): [string, string] {
  const src = f || {};
  if (src.period_start && src.period_end) {
    return [String(src.period_start), String(src.period_end)];
  }
  if (Array.isArray(src.range) && src.range.length === 2 && src.range[0] && src.range[1]) {
    return [String(src.range[0]), String(src.range[1])];
  }
  return defaultPeriod();
}

/** Balance 卡：可用余额 / 账户总余额（来自 summary.available_balance_usd / summary.balance） */
const price = ref("$0");
const creditTotal = ref("$0");
/** 中间卡「Latest month」下主金额：与当月 Total Revenue 相同（by_month[0].total_revenue_usd） */
const reservedDisplay = ref("$0.00");
/** Total Savings 卡：全历史 OMS Outbound Billing Detail 费用合计（接口 lifetime_total_revenue_usd，与日期筛选无关） */
const totalSavings = ref("$0.00");
/** 中间卡三项：来自 by_month[0] 的月份标签，如 2024-03 */
const latestMonthLabel = ref("");
/** 供 Balance 圆环：与后端 _outbound_billing_balance_snapshot 一致 */
const availBalanceUsd = ref(0);
const totalBalanceUsd = ref(0);
const reservedLogisticsUsd = ref(0);

function formatUsd(n: number) {
  const x = typeof n === "number" && Number.isFinite(n) ? n : 0;
  return `$${x.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function updateBalanceDonut() {
  const bal = totalBalanceUsd.value;
  const avail = availBalanceUsd.value;
  const res = reservedLogisticsUsd.value;
  const pct =
    bal > 0 ? Math.min(100, Math.round((avail / bal) * 100)) : avail > 0 ? 100 : 0;
  const vAvail = Math.max(0, avail);
  const vRes = Math.max(0, res);
  const storageOption: echarts.EChartsOption = {
    title: {
      text: `${pct}%\nAvailable`,
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
        data:
          bal > 0 && vAvail + vRes > 0
            ? [
                {
                  value: vAvail,
                  name: "Available",
                  itemStyle: { color: "#0211A3", borderRadius: "50%" },
                },
                {
                  value: Math.max(0, bal - vAvail),
                  name: "Other",
                  itemStyle: { color: "transparent" },
                },
              ]
            : bal > 0
              ? [
                  {
                    value: pct,
                    name: "Available",
                    itemStyle: { color: "#0211A3", borderRadius: "50%" },
                  },
                  { value: 100 - pct, name: "Rest", itemStyle: { color: "transparent" } },
                ]
              : [
                  { value: 100, name: "Available", itemStyle: { color: "#0211A31A" } },
                  { value: 0, name: "Empty", itemStyle: { color: "transparent" } },
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
}
const editVisible = ref(false);
const progressItems = ref<any[]>([]);
const notifications = ref<any[]>([]);
const recentOrders = ref<any[]>([]);
const showHistory = ref(false);

// Fee Detail Drawer State
const detailVisible = ref(false);
const currentDetailId = ref<string | undefined>(undefined);
// Add Credit State
const addCreditVisible = ref(false);

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
  const company = authStore.currentCompany ?? (await authStore.ensureCompany()) ?? "";
  if (!company) return;
  try {
    const [period_start, period_end] = resolveBillingPeriod(currentFilters.value as any);
    const [statsRes, notifRes] = await Promise.all([
      getOutboundStats({
        company,
        period_start,
        period_end,
      }).send(),
      getBillingNotifications(),
    ]);

    const msg = (statsRes as any)?.message ?? statsRes;
    const summary = msg?.summary ?? {};
    const byMonth = Array.isArray(msg?.by_month) ? msg.by_month : [];
    const latest = byMonth[0] || {};
    latestMonthLabel.value = (latest.month && String(latest.month).trim()) || "";

    const lifetimeRev = Number(
      (msg as any).lifetime_total_revenue_usd ??
        (summary as any).lifetime_total_revenue_usd ??
        0,
    );
    const monthRev = Number(
      latest.total_revenue_usd ?? summary.total_revenue_usd ?? 0,
    );
    const monthOrders = Number(
      latest.total_orders ?? summary.total_orders ?? 0,
    );
    const monthAvg = Number(
      latest.avg_order_value_usd ?? summary.avg_order_value_usd ?? 0,
    );

    const bal = Number(summary.balance ?? 0);
    const avail = Number(summary.available_balance_usd ?? bal);
    const resFee = Number(summary.reserved_logistics_fee_usd ?? 0);
    price.value = formatUsd(avail);
    creditTotal.value = formatUsd(bal);
    reservedDisplay.value = formatUsd(monthRev);
    availBalanceUsd.value = avail;
    totalBalanceUsd.value = bal;
    reservedLogisticsUsd.value = resFee;
    totalSavings.value = formatUsd(lifetimeRev);
    progressItems.value = [
      {
        label: "Total Revenue",
        value: monthRev,
        total: monthRev || 100,
        percent: 100,
        color: "#0211A3",
        prefix: "$",
      },
      {
        label: "Total Orders",
        value: monthOrders,
        total: Math.max(monthOrders, 1),
        percent: 100,
        color: "#0211A3",
        prefix: "",
      },
      {
        label: "Avg. Order Value",
        value: monthAvg,
        total: Math.max(monthAvg, 1),
        percent: 100,
        color: "#0211A3",
        prefix: "$",
      },
    ];

    notifications.value = (Array.isArray(notifRes) ? notifRes : []).map((n: any) => ({
      ...n,
      icon: getIconComponent(n.iconType),
    }));
    recentOrders.value = [];
    await nextTick();
    updateBalanceDonut();
  } catch (error) {
    console.error("Failed to load dashboard data:", error);
  }
};

const handleViewDetail = (row: any) => {
  const name = row?.name ?? row?.id;
  if (!name) return;
  currentDetailId.value = name;
  detailVisible.value = true;
};


const handleAddCredit = () => {
  addCreditVisible.value = true;
};

// Filter State
const filterRef = ref();
const currentFilters = ref({});

const handleFilterSearch = async (params: any) => {
  currentFilters.value = params;
  page.value = 1;
  await loadData();
  fetchData();
};

const columns = [
  { type: "selection", width: 50 },
  { label: "Sales Order", prop: "sales_order", width: 140 },
  { label: "Order Time", prop: "order_time", width: 110 },
  { label: "Pack Time", prop: "pack_time", width: 110 },
  { label: "Destination Country", prop: "destination_country", width: 140 },
  { label: "Tracking No", slot: "trackingNo", width: 160 },
  { label: "Charge Weight", slot: "chargeWeight", width: 110, align: "right" },
  { label: "Total (USD)", slot: "totalUsd", width: 120, align: "right" },
  { label: "Actions", slot: "actions", width: 100, fixed: "right", align: "center" },
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

  updateBalanceDonut();

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
  const company = authStore.currentCompany ?? (await authStore.ensureCompany()) ?? "";
  if (!company) {
    loading.value = false;
    return;
  }
  const [period_start, period_end] = resolveBillingPeriod(currentFilters.value as any);
  if (!period_start || !period_end) {
    ElMessage.warning("Please select Pack date range (period_start + period_end required).");
    loading.value = false;
    return;
  }
  loading.value = true;
  try {
    const res = await getOutboundBillingList({
      company,
      period_start,
      period_end,
      page: page.value,
      pageSize: limit.value,
      search: currentFilters.value?.search,
      destination_country: currentFilters.value?.destination_country,
    }).send();
    const msg = (res as any)?.message ?? res;
    const data = Array.isArray(msg?.data) ? msg.data : [];
    total.value = typeof msg?.total === "number" ? msg.total : 0;
    tableData.value = data.map((row: any) => {
      const toDate = (v: any) => (v ? String(v).slice(0, 10) : "-");
      return {
        id: row.name ?? row.sales_order,
        name: row.name,
        sales_order: row.sales_order,
        title: row.sales_order ?? row.name ?? "",
        order_time: toDate(row.order_time),
        pack_time: toDate(row.pack_time),
        destination_country: row.destination_country ?? "",
        tracking_no: row.tracking_no ?? "",
        charge_weight: Number(row.charge_weight ?? 0),
        total_cost_usd: Number(row.total_cost_usd ?? 0),
        code: toDate(row.pack_time),
        action: row.status ?? "",
        status: row.status ?? "",
        statusNote: `$${Number(row.total_cost_usd ?? 0).toFixed(2)}`,
        shipping: "-",
        tax: "-",
        grandTotal: `$${Number(row.total_cost_usd ?? 0).toFixed(2)}`,
        image: "",
      };
    });
    await nextTick();
    updateStatsAndChart();
  } catch (error) {
    console.error("Failed to fetch outbound billing:", error);
    ElMessage.error("Failed to fetch data");
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await authStore.ensureCompany();
  await nextTick();
  if (filterRef.value) {
    const params = filterRef.value.getSearchParams();
    if (!params.period_start || !params.period_end) {
      const [ps, pe] = defaultPeriod();
      params.period_start = ps;
      params.period_end = pe;
      params.range = [ps, pe];
    }
    currentFilters.value = params;
  }
  await loadData();
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
