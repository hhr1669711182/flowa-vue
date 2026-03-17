<template>
  <div class="products h-full flex flex-col" v-show="!showHistory">
    <div class="flex justify-between items-center mb-4 flex-shrink-0">
      <div>
        <div class="flex items-center gap-1 line-height-22px">
          <div class="text-#000 text-28px line-height-36px font-bold">
            Billing
          </div>
          <div class="text-#9A9A9A text-20px pt-1">/Exception</div>
        </div>
        <div class="text-14px text-#6B6B6B">
          Track approved extra service fees and operational adjustments.
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
            Credit Remaining
            <el-tooltip
              class="box-item"
              effect="dark"
              content="Details about credit remaining"
              placement="top-start"
            >
              <Icon icon="svg-icon:circle-question" color="#9A9A9A" />
            </el-tooltip>
          </div>
          <div class="flex items-center gap-1 text-[14px]">
            <Icon icon="svg-icon:circle-arrow-up" color="#0211A3" />
            <div class="text-#0211A3">{{ statsData.creditRemaining }}</div>
            <div class="text-#9A9A9A">/ {{ statsData.creditTotal }}</div>
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
            <div class="text-lg font-bold text-#000">
              Reserved Credits
              <el-tooltip
                class="box-item"
                effect="dark"
                content="Details about reserved credits"
                placement="top-start"
              >
                <Icon icon="svg-icon:circle-question" color="#9A9A9A" />
              </el-tooltip>
            </div>
            <div class="text-xs text-#0211A3 mt-0.5 flex items-center gap-2">
              <Icon
                icon="material-symbols:arrow-circle-up-outline-rounded"
                width="16"
                height="16"
                class="text-gray-400"
                color="#0211A3"
              />
              <span class="text-[14px]">{{ statsData.reservedCredits }}</span>
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

      <div
        class="card position-relative w-full animate__animated animate__fadeInUp"
      >
        <div
          class="flex items-center justify-between mb-2 p-6 position-absolute w-full box-border"
        >
          <div class="text-sm font-semibold opacity-80">
            <div class="text-16px">Total Savings</div>
            <div class="flex items-center gap-1">
              <Icon icon="svg-icon:circle-arrow-up" color="#BDBDBD" />
              <div class="text-#BDBDBD">
                {{ statsData.savingsPercent }} vs. Traditional Method
              </div>
            </div>
          </div>
          <div class="flex items-center justify-end mb-1">
            <span class="text-3xl font-bold">{{ statsData.totalSavings }}</span>
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

    <div class="flex-1 min-h-0 rounded-xl overflow-hidden mt-4">
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
        <template #expand="{ row }">
          <div class="py-4 px-6 bg-#F7F7F7">
            <div class="bg-#fff rounded-lg border border-gray-200">
              <div class="grid grid-cols-2 items-center px-6 py-6">
                <div class="text-left text-sm">
                  <div class="flex items-center gap-3 mb-2">
                    <span class="text-lg font-bold text-gray-900">
                      {{ row.orderId }}
                    </span>
                    <span
                      class="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700"
                    >
                      Delivered
                    </span>
                  </div>
                  <div class="text-xs text-gray-500 flex gap-4">
                    <span
                      >Tracking No
                      <span class="font-bold text-gray-900 underline ml-1">{{
                        row.trackingNo
                      }}</span></span
                    >
                  </div>
                </div>

                <div class="text-left text-sm">
                  <div class="mb-1">
                    <span class="text-gray-500 mr-2">Approved By</span>
                    <span class="text-gray-900 font-medium">Evan Su</span>
                  </div>
                  <div>
                    <span class="text-gray-500 mr-2">Approved Date</span>
                    <span class="text-gray-900 font-medium">dd/mm/yyyy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <template #orderId="{ row }">
          <span class="font-bold text-gray-900">{{ row.orderId }}</span>
        </template>

        <template #approvedDate="{ row }">
          <span class="text-gray-500">{{ row.approvedDate }}</span>
        </template>

        <template #trackingNo="{ row }">
          <span class="text-gray-500 border-b border-gray-300">{{
            row.trackingNo
          }}</span>
        </template>

        <template #type="{ row }">
          <span class="text-gray-500">{{ row.type }}</span>
        </template>

        <template #total="{ row }">
          <span class="text-gray-500">{{ row.total }}</span>
        </template>

        <template #actions="{ row }">
          <div class="flex flex-1">
            <el-popover
              placement="bottom-start"
              trigger="click"
              popper-class="!p-0 !px-6 !min-w-auto !rounded-lg !w-auto"
              :show-arrow="false"
            >
              <template #reference>
                <el-button class="w-8 h-8">
                  <Icon icon="svg-icon:ellipsis-vertical" color="#16215B" />
                </el-button>
              </template>
              <div class="py-2 px-1">
                <el-button
                  link
                  class="!text-blue-600 !font-semibold w-full !justify-start hover:!bg-#F4F6FA !h-9"
                >
                  <span class="flex justify-center items-center gap-2">
                    <Icon icon="svg-icon:shopping-cart" />
                    View Order
                  </span>
                </el-button>
                <el-button
                  link
                  class="!text-red-600 !font-semibold w-full !justify-start hover:!bg-#F4F6FA !h-9"
                >
                  <span class="flex justify-center items-center gap-2">
                    <Icon icon="svg-icon:headphones" />
                    Contact Support
                  </span>
                </el-button>
              </div>
            </el-popover>
            <!-- <el-button class="w-8 h-8" @click="handleMoreActions(row)">
              <Icon
                icon="gravity-ui:ellipsis-vertical"
                width="16"
                height="16"
                style="color: #16215b"
              />
            </el-button> -->
          </div>
        </template>
      </BaseTable>
    </div>
  </div>

  <History v-show="showHistory" ref="historyRef" @close="showHistory = false" />

  <AddCredit v-model:visible="addCreditVisible" @success="loadData" />
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, onBeforeUnmount, nextTick } from "vue";
import { Icon } from "@iconify/vue";
import * as echarts from "echarts";
import ProductFilter from "./components/ProductFilter.vue";
import AddCredit from "./components/addCredit.vue";
import History from "./components/History.vue";
import { getExceptionStats, getExceptionList } from "@/api/billing/exception";
import BaseTable from "@/components/common/BaseTable.vue";

const statsData = reactive({
  creditRemaining: "$0",
  creditTotal: "$0",
  creditPercent: 0,
  reservedCredits: "$0",
  availableCredits: "$0",
  reservedAmount: "$0",
  totalSavings: "$0",
  savingsPercent: "0%",
});

const showHistory = ref(false);
const addCreditVisible = ref(false);

const progressItems = ref<any[]>([]);

const loadData = async () => {
  try {
    const statsRes = await getExceptionStats();
    Object.assign(statsData, statsRes);
    progressItems.value = statsRes.progressItems || [];
    updateCharts();
  } catch (error) {
    console.error("Failed to load dashboard data:", error);
  }
};

const handleAddCredit = () => {
  addCreditVisible.value = true;
};

// Filter State
const filterRef = ref();
const currentFilters = ref({});

const handleFilterSearch = (params: any) => {
  currentFilters.value = params;
  page.value = 1;
  fetchData();
};

const columns = [
  { type: "selection", width: 50 },
  { type: "expand", width: 50, slot: "expand" },
  { label: "Order ID", slot: "orderId", minWidth: 150 },
  { label: "Approved Date", slot: "approvedDate", minWidth: 150 },
  { label: "Tracking No.", slot: "trackingNo", minWidth: 150 },
  { label: "Type", slot: "type", minWidth: 150 },
  { label: "Total", slot: "total", minWidth: 100 },
  { label: "Actions", slot: "actions", width: 80, align: "center" },
];

// Data Logic
const tableData = ref([]) as any;
const loading = ref(false);
const total = ref(0);
const page = ref(1);
const limit = ref(10);
const storageChartRef = ref<HTMLElement | null>(null);
const valueChartRef = ref<HTMLElement | null>(null);
let storageChart: echarts.ECharts | null = null;
let valueChart: echarts.ECharts | null = null;
const showCards = ref(true);

const updateCharts = () => {
  // Chart 1: Credit Remaining (Pie)
  const storageOption: echarts.EChartsOption = {
    title: {
      text: "50%\nAvailable",
      left: "center",
      top: "center",
      textStyle: {
        color: "#0211A3",
        fontSize: 14,
        fontWeight: "bold",
        lineHeight: 20,
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
        data: [{ value: 100, name: "Full", itemStyle: { color: "#E0E7FF" } }],
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
            itemStyle: { color: "#0211A3", borderRadius: 10 },
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

  // Chart 3: Total Savings (Wavy Line)
  const valueOption: echarts.EChartsOption = {
    grid: { left: 0, right: 0, top: 0, bottom: 0 },
    xAxis: {
      type: "category",
      boundaryGap: false,
      show: false,
      data: Array.from({ length: 50 }).map((_, i) => i),
    },
    yAxis: { type: "value", show: false },
    series: [
      {
        type: "line",
        smooth: 0.5,
        showSymbol: false,
        data: Array.from({ length: 50 }).map(
          (_, i) => Math.sin(i / 5) * 20 + 50 + Math.random() * 10,
        ),
        lineStyle: { color: "#4facfe", width: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(79, 172, 254, 0.5)" },
            { offset: 1, color: "rgba(79, 172, 254, 0)" },
          ]),
        },
      },
    ],
  };
  if (!valueChart && valueChartRef.value) {
    valueChart = echarts.init(valueChartRef.value);
  }
  if (valueChart) valueChart.setOption(valueOption);
};

const handleMoreActions = (row: any) => {
  // Logic for more actions (e.g. dropdown menu)
  console.log("More actions for", row);
};

const onResize = () => {
  if (storageChart) storageChart.resize();
  if (valueChart) valueChart.resize();
};

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await getExceptionList({
      page: page.value,
      pageSize: limit.value,
      ...currentFilters.value,
    });
    tableData.value = res.list;
    total.value = res.total;
    await nextTick();
    updateCharts();
  } catch (error) {
    console.error("Failed to fetch list:", error);
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
  window.addEventListener("resize", onResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", onResize);
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
