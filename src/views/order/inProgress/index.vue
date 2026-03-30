<template>
  <div class="products h-full flex flex-col">
    <div class="flex justify-between items-center mb-4 flex-shrink-0">
      <div>
        <div class="flex items-center gap-1 line-height-22px">
          <div class="text-#000 text-28px line-height-36px">Orders</div>
          <div class="text-#9A9A9A text-20px pt-1">/In Progress</div>
        </div>
        <div class="text-14px text-#6B6B6B">
          Track orders currently being processed. No action required.
        </div>
      </div>
      <div class="flex items-center gap-3">
        <el-button type="primary" size="large" @click="handleAddProduct">
          <span class="flex items-center gap-1.5">
            <Icon icon="svg-icon:plus" color="#fff" />
            <span>Create Order</span>
          </span>
        </el-button>
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
                class="flex justify-between items-start px-6 py-3 !border-b-1.5 border-0 border-solid border-#ECECEC"
              >
                <div>
                  <div class="flex items-center gap-3 mb-2">
                    <span class="text-lg font-bold text-gray-900">
                      {{ getExpandRow(row).title }}
                    </span>
                    <span
                      class="px-2 py-0.5 rounded text-xs font-medium bg-[#EEF2FF] text-[#1D4ED8]"
                    >
                      {{ getExpandRow(row).deliveryStatus }}
                    </span>
                  </div>
                  <div class="text-xs text-gray-500 flex gap-4">
                    <span>Create {{ getExpandRow(row).code }}</span>
                    <span>Fulfilled Date {{ getExpandRow(row).code }}</span>
                  </div>
                </div>

                <div class="text-left text-sm">
                  <div class="mb-1">
                    <span class="text-gray-500 mr-2">Sending to</span>
                    <span class="text-gray-900">{{
                      getExpandRow(row).destination
                    }}</span>
                  </div>
                  <div class="mt-2 text-xs text-gray-500">
                    <span>Estimated arrived at</span>
                    <span class="text-gray-900 font-semibold ml-1">{{
                      getExpandRow(row).etaText
                    }}</span>
                  </div>
                </div>
              </div>

              <div class="px-6 py-4">
                <Steps
                  class="mb-4"
                  :steps="getTaskSteps(getExpandRow(row))"
                  :active="getActiveStep(getExpandRow(row))"
                  :show-state-icon="true"
                />
                <div class="flex justify-between items-center">
                  <div class="text-lg font-bold text-sm">
                    <span text="text-#6B6B6B">Tracking No.:</span>
                    <span class="text-#000">{{ "0123456789" }}</span>
                  </div>
                  <el-button
                    class="!font-semibold w-[166px] hover:!bg-#F4F6FA !px-4 !h-8 !color-[#F6540C]"
                    @click="handleSupport(getExpandRow(row))"
                  >
                    <span class="flex items-center gap-2">
                      <Icon icon="svg-icon:headphones" />
                      Contact Support
                    </span>
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </template>

        <template #order="{ row }">
          <div class="flex items-center gap-3">
            <img
              :src="productImage"
              alt="Product Image"
              class="w-10 h-10 rounded-lg"
            />
            <div class="flex flex-col">
              <span class="text-sm font-medium text-gray-800">{{
                row.orderId
              }}</span>
              <span class="text-xs text-gray-500">{{ row.platformId }}</span>
            </div>
          </div>
        </template>
        <template #stage="{ row }">
          <span class="text-sm text-gray-700">{{ row.stage }}</span>
        </template>
        <template #status="{ row }">
          <el-tag
            effect="dark"
            class="!rounded-full !px-3 !border-none !bg-[#EEF2FF] !text-[#1D4ED8]"
          >
            {{ row.status }}
          </el-tag>
        </template>
        <template #customer="{ row }">
          <div class="flex flex-col">
            <span class="text-sm font-medium text-gray-800">{{
              row.customerName
            }}</span>
            <span class="text-xs text-gray-500">{{ row.customerRegion }}</span>
          </div>
        </template>
        <template #date="{ row }">
          <div class="text-left text-xs text-gray-500">
            <div>
              Create:
              <span class="text-gray-900 font-semibold ml-1">{{
                row.createDate
              }}</span>
            </div>
            <div class="mt-1">
              Due:
              <span class="text-gray-900 font-semibold ml-1">{{
                row.dueDate
              }}</span>
            </div>
          </div>
        </template>
        <template #actions="{ row }">
          <div class="flex flex-1 justify-center gap-1">
            <el-button
              class="!w-99px h-8 !p-2 !rounded-lg box-border !color-#16215B"
              @click="openInterceptDialog(row)"
            >
              <Icon icon="svg-icon:circle-exclamation" />
              <span class="text-14px">Intercept</span>
            </el-button>
            <el-button class="w-8 h-8 !ml-0" @click="handleViewDetail(row)">
              <Icon icon="svg-icon:eye" color="#16215B" />
            </el-button>
            <el-popover
              placement="bottom-start"
              trigger="click"
              popper-class="!p-0 !px-2 !min-w-auto !rounded-lg !w-auto"
              :show-arrow="false"
            >
              <template #reference>
                <el-button class="w-8 h-8 !ml-0">
                  <Icon icon="svg-icon:ellipsis-vertical" color="#16215B" />
                </el-button>
              </template>
              <rightButtons
                :row="row"
                :items="btnItems"
                @action="handleRowAction"
              />
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

    <InterceptDialog
      :visible="interceptVisible"
      :record="interceptRecord"
      :steps="getTaskSteps(interceptRecord)"
      :active="getActiveStep(interceptRecord)"
      @update:visible="interceptVisible = $event"
      @confirm="submitIntercept"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import ProductFilter from "./components/ProductFilter.vue";
import ProductDetail from "./components/productDetail.vue";
import {
  createInProgressSupportTicket,
  getInProgressOrderDetail,
  getInProgressOrderList,
  interceptInProgressOrder,
  type InProgressInventoryStatus,
  type InProgressOrderListParams,
  type InProgressOrderStage,
  type InProgressOrderStatus,
} from "@/api/order/inProgress";
import { ElMessage, ElMessageBox } from "element-plus";
import rightButtons from "./components/rightButtons.vue";
import { Steps } from "@/components/base/Steps";
import InterceptDialog from "./components/InterceptDialog.vue";
import { StepItem } from "@/components/base/Steps/src/Steps.vue";
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

const handleViewDetail = async (row: any) => {
  if (!row?.id) return;
  try {
    const res: any = await getInProgressOrderDetail(row.id);
    await ElMessageBox.alert(
      `${res.orderId}\n${res.platformId}\n${res.stage}\n${res.status}\n${res.customerName} · ${res.customerRegion}\nSKU ${res.sku}`,
      "Order Detail",
      { confirmButtonText: "Close" },
    );
  } catch (error) {
    ElMessage.error("Failed to load detail");
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
  { label: "Order ID / Platform ID", slot: "order", width: "auto" },
  { label: "Stages", slot: "stage", width: 120 },
  { label: "Status", slot: "status", width: 150, align: "center" },
  { label: "Customer", slot: "customer", width: 150 },
  { label: "Date", slot: "date", width: 150 },
  {
    label: "Actions",
    slot: "actions",
    width: 200,
    fixed: "right",
    align: "center",
  },
];

const btnItems = [
  {
    key: "view",
    label: "View Details",
    icon: "svg-icon:eye",
    tone: "primary",
  },
  {
    key: "support",
    label: "Contact Support",
    icon: "svg-icon:headphones",
    tone: "danger",
  },
] as any;

// Data Logic
const tableData = ref<any>([]);
const loading = ref(false);
const total = ref(0);
const page = ref(1);
const limit = ref(10);
const expandDetailMap = ref<Record<string, any>>({});
const expandLoadingMap = ref<Record<string, boolean>>({});
const interceptVisible = ref(false);
const interceptRecord = ref<any>(null);

const mapStage = (stage: string): InProgressOrderStage | "" => {
  if (!stage || stage === "all") return "";
  if (stage === "fix") return "Review & Fix";
  if (stage === "redelivery") return "Local Delivery";
  if (stage === "clearance") return "Export Processing";
  if (stage === "discontinued") return "Warehouse Processing";
  return "";
};

const mapStatus = (status: string): InProgressOrderStatus | "" => {
  if (!status || status === "all") return "";
  if (status === "cancelled") return "Pick & Pack";
  if (status === "not") return "In Transit";
  return "";
};

const mapInventory = (stock: string): InProgressInventoryStatus | "" => {
  if (!stock || stock === "all") return "";
  if (stock === "low") return "Reserved";
  if (stock === "out") return "Out of Stock";
  return "";
};

const buildParams = (): InProgressOrderListParams => {
  const p: any = currentFilters.value || {};
  const keyword = (p.sku || p.keyword || "").toString().trim();
  const stage = mapStage(p.stage);
  const status = mapStatus(p.status);
  const inventory = mapInventory(p.stock);
  const toDateText = (val: any) => {
    if (!val) return "";
    if (typeof val === "string") return val;
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return "";
    const mm = `${d.getMonth() + 1}`.padStart(2, "0");
    const dd = `${d.getDate()}`.padStart(2, "0");
    return `${d.getFullYear()}-${mm}-${dd}`;
  };
  const dateRange: InProgressOrderListParams["dateRange"] = Array.isArray(
    p.range,
  )
    ? ([toDateText(p.range[0]), toDateText(p.range[1])] as [string, string])
    : [];
  return {
    page: page.value,
    pageSize: limit.value,
    keyword: keyword || undefined,
    stage,
    status,
    inventory,
    dateRange,
  };
};

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await getInProgressOrderList(buildParams());
    tableData.value = res.list;
    total.value = res.total;
    await nextTick();
  } catch (error) {
    console.error("Failed to fetch products:", error);
  } finally {
    loading.value = false;
  }
};

const handleExpandChange = async (row: any, expanded: any[]) => {
  if (!row?.id) return;
  const isExpanded = Array.isArray(expanded) && expanded.includes(row);
  if (!isExpanded) return;
  if (expandDetailMap.value[row.id]) return;
  expandLoadingMap.value = { ...expandLoadingMap.value, [row.id]: true };
  try {
    const res = await getInProgressOrderDetail(row.id);
    expandDetailMap.value = { ...expandDetailMap.value, [row.id]: res };
  } catch (error) {
    console.error("Failed to fetch in-progress order detail:", error);
  } finally {
    expandLoadingMap.value = { ...expandLoadingMap.value, [row.id]: false };
  }
};

const getExpandRow = (row: any) => {
  if (!row?.id) return row;
  return expandDetailMap.value[row.id] || row;
};

const handleSupport = async (row: any) => {
  if (!row?.id) return;
  try {
    await createInProgressSupportTicket({
      id: row.id,
      subject: `Order support: ${row.orderId}`,
      message: "Need help with this in-progress order.",
      priority: "High",
    });
    ElMessage.success("Support ticket created");
  } catch (error) {
    ElMessage.error("Failed to create ticket");
  }
};

const openInterceptDialog = async (row: any) => {
  if (!row?.id) return;
  try {
    const detail = await getInProgressOrderDetail(row.id);
    interceptRecord.value = detail;
    interceptVisible.value = true;
  } catch (error) {
    ElMessage.error("Failed to load order detail");
  }
};

const submitIntercept = async () => {
  const record = interceptRecord.value;
  if (!record?.id) return;
  try {
    await interceptInProgressOrder({
      id: record.id,
      note: "Order interception requested.",
    });
    interceptVisible.value = false;
    ElMessage.success("Interception requested");
    fetchData();
  } catch (error) {
    ElMessage.error("Request failed");
  }
};

const handleRowAction = (action: string, row: any) => {
  switch (action) {
    case "view":
      handleViewDetail(row);
      break;
    case "support":
      createInProgressSupportTicket({
        id: row.id,
        subject: `Order support: ${row.orderId}`,
        message: "Need help with this in-progress order.",
        priority: "High",
      }).then(() => {
        ElMessage.success("Support ticket created");
      });
      break;
    default:
      break;
  }
};

const getActiveStep = (row: any) => {
  const stage = String(row?.stage || "");
  if (stage.includes("Review")) return 0;
  if (stage.includes("Warehouse")) return 1;
  if (stage.includes("Export")) return 2;
  if (stage.includes("Local")) return 3;
  return 1;
};

const getTaskSteps = (row: any): StepItem[] => {
  const active = getActiveStep(row);
  const subtitle = row?.status || "Awaiting";
  return [
    {
      title: "Review & Fix",
      subtitle: active > 0 ? "Completed" : subtitle,
      state: active > 0 ? "completed" : active === 0 ? "active" : "pending",
    },
    {
      title: "Warehouse",
      subtitle: active > 1 ? "Completed" : active === 1 ? subtitle : "Awaiting",
      state: active > 1 ? "completed" : active === 1 ? "active" : "pending",
    },
    {
      title: "Export",
      subtitle: active > 2 ? "Completed" : active === 2 ? subtitle : "Awaiting",
      state: active > 2 ? "completed" : active === 2 ? "active" : "pending",
    },
    {
      title: "Local Delivery",
      subtitle: active > 3 ? "Completed" : active === 3 ? subtitle : "Awaiting",
      state: active > 3 ? "completed" : active === 3 ? "active" : "pending",
    },
    { title: "Delivered", subtitle: "Awaiting", state: "pending" },
  ];
};

onMounted(async () => {
  await nextTick();
  if (filterRef.value) {
    currentFilters.value = filterRef.value.getSearchParams();
  }
  fetchData();
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
