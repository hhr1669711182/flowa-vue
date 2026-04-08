<template>
  <div class="products h-full flex flex-col">
    <div class="flex justify-between items-center mb-4 flex-shrink-0">
      <div>
        <div class="flex items-center gap-1 line-height-22px">
          <div class="text-#000 text-28px line-height-36px">Orders</div>
          <div class="text-#9A9A9A text-20px pt-1">/Blocked</div>
        </div>
        <div class="text-14px text-#6B6B6B">
          Orders manually placed on hold. Reactivate them at any time to resume
          processing.
        </div>
      </div>
      <div class="flex items-center gap-3">
        <el-button
          type="primary"
          plain
          size="large"
          :disabled="!selectedOrderIds.length"
          @click="batchTrackingSelected"
        >
          <span>Batch Tracking</span>
        </el-button>
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
                      class="px-2 py-0.5 rounded text-xs font-medium bg-[#FDEAEA] text-[#C62828]"
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
                    <span class="text-gray-500 mr-2">Carrier</span>
                    <span class="text-gray-900">{{
                      getExpandRow(row).carrier
                    }}</span>
                  </div>
                  <div>
                    <span class="text-gray-500 mr-2">Method</span>
                    <span class="text-gray-900">{{
                      getExpandRow(row).method
                    }}</span>
                  </div>
                </div>
              </div>

              <div
                class="px-6 py-4 bg-#FDEAEA border-0 border-l-15 border-solid border-[rgba(198,40,40,0.5)]"
              >
                <div class="text-#C62828 text-12px font-medium">
                  Order Blocked. Reactivate it at any time to resume processing.
                </div>
              </div>

              <div class="px-6 py-4">
                <Steps
                  class="mb-4"
                  :steps="getTaskSteps(getExpandRow(row))"
                  :active="getActiveStep(getExpandRow(row))"
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
            <div class="flex flex-col">
              <span
                class="text-sm font-medium text-gray-800 cursor-pointer hover:underline"
                title="Open tracking page"
                @click="goToTracking(row?.id)"
              >{{ row.orderId }}</span>
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
            class="!rounded-full !px-3 !border-none !bg-[#FCE8E6] !text-[#D93025]"
          >
            {{ row.status }}
          </el-tag>
        </template>
        <template #inventory="{ row }">
          <el-tag
            effect="dark"
            class="!rounded-full !px-3 !border-none"
            :class="
              row.inventoryStatus === 'In Stock'
                ? '!bg-[#E6F4EA] !text-[#1E8E3E]'
                : row.inventoryStatus === 'Reserved'
                  ? '!bg-[#EEF2FF] !text-[#1D4ED8]'
                  : '!bg-[#FCE8E6] !text-[#D93025]'
            "
          >
            {{ row.inventoryStatus }}
          </el-tag>
        </template>
        <template #destinationCountry="{ row }">
          <span class="text-sm text-gray-700">{{ row.customerCountry || row.customerRegion || '-' }}</span>
        </template>
        <template #date="{ row }">
          <div class="text-left text-xs text-gray-500">
            <div>
              Order Transaction Time:
              <span class="text-gray-900 font-semibold ml-1">{{ row.createDate }}</span>
            </div>
            <div class="mt-1">
              Shipping Time:
              <span class="text-gray-900 font-semibold ml-1">{{ row.dueDate }}</span>
            </div>
          </div>
        </template>
        <template #actions="{ row }">
          <div class="flex flex-1 justify-center gap-1">
            <el-popover
              placement="bottom-start"
              trigger="click"
              popper-class="!p-0 !px-2 !min-w-auto !rounded-lg !w-auto"
              :show-arrow="false"
            >
              <template #reference>
                <el-button
                  class="!w-105px h-8 !p-2 !rounded-lg box-border !color-#fff !bg-[#9A9A9A]"
                >
                  <!-- @click="handleViewDetail(row)" -->
                  <Icon icon="svg-icon:circle-minus" />
                  <span class="text-14px">Blocked</span>
                </el-button>
              </template>
              <rightButtons
                :row="row"
                :items="btnItems1"
                @action="handleRowAction"
              />
            </el-popover>

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
                :items="btnItems2"
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import ProductFilter from "./components/ProductFilter.vue";
import ProductDetail from "./components/productDetail.vue";
import {
  createBlockedSupportTicket,
  getBlockedOrderDetail,
  getBlockedOrderList,
  reactivateBlockedOrder,
  updateBlockedOrderStatus,
  type BlockedInventoryStatus,
  type BlockedOrderListParams,
  type BlockedOrderStage,
  type BlockedOrderStatus,
} from "@/api/order/blocked";
import { extractOmsSalesOrderDetail, parseFlowaListSalesOrdersResult } from "@/utils/frappeResponse";
import { mapRowToBlockedRecord, patchRowFromSalesOrderDoc } from "@/utils/flowaSalesOrderRowMap";
import { useAuthStore } from "@/store/modules/auth";
import { ElMessage, ElMessageBox } from "element-plus";
import rightButtons from "./components/rightButtons.vue";
import { Steps } from "@/components/base/Steps";

const authStore = useAuthStore();
const router = useRouter();

// Selection for batch tracking
const selectedRows = ref<any[]>([]);
const selectedOrderIds = computed(() =>
  selectedRows.value.map((r) => r?.id).filter(Boolean)
);

function onSelectionChange(rows: any[]) {
  selectedRows.value = Array.isArray(rows) ? rows : [];
}

function goToTracking(orderId: string) {
  const kw = (orderId && String(orderId).trim()) || "";
  router.push({ path: "/orders/tracking", query: kw ? { kw } : {} });
}

function batchTrackingSelected() {
  const ids = selectedOrderIds.value;
  if (!ids.length) return;
  const kw = ids.join("\n");
  router.push({ path: "/orders/tracking", query: { kw } });
}

function formatAmount(val: any) {
  const n = Number(val);
  return Number.isFinite(n) ? n.toFixed(2) : (val ?? "0.00");
}

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
    const raw = await getBlockedOrderDetail(row.id, authStore.currentCompany ?? undefined).send();
    const doc = extractOmsSalesOrderDetail(raw);
    const detail = doc ? patchRowFromSalesOrderDoc(row, doc) : row;
    await ElMessageBox.alert(
      `${detail.orderId}\n${detail.platformId}\n${detail.stage}\n${detail.status}\n${detail.customerName} · ${detail.customerRegion}\nSKU ${detail.sku}`,
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
  { label: "Delivery Order No", slot: "order", width: 180 },
  { label: "Stages", slot: "stage", width: 120 },
  { label: "Status", slot: "status", width: 120, align: "center" },
  { label: "Inventory", slot: "inventory", width: 120, align: "center" },
  { label: "Destination Country", slot: "destinationCountry", width: 120 },
  { label: "Date", slot: "date", width: 180 },
  { label: "Actions", slot: "actions", width: 150, fixed: "right", align: "center" },
];

const btnItems1 = [
  {
    key: "unblock",
    label: "Unblock Order",
    icon: "svg-icon:circle-minus",
    tone: "primary",
  },
  {
    key: "cancel",
    label: "Cancel Order",
    icon: "svg-icon:trash-bin",
    tone: "danger",
  },
] as any;

const btnItems2 = [
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

const mapStage = (stage: string): BlockedOrderStage | "" => {
  if (!stage || stage === "all") return "";
  if (stage === "fix") return "Review and Fix";
  if (stage === "redelivery") return "Return Processing";
  if (stage === "clearance") return "Export Processing";
  if (stage === "discontinued") return "Warehouse Processing";
  return "";
};

const mapStatus = (status: string): BlockedOrderStatus | "" => {
  if (!status || status === "all") return "";
  if (status === "cancelled") return "Blocked";
  if (status === "not") return "Resolved";
  return "";
};

const mapInventory = (stock: string): BlockedInventoryStatus | "" => {
  if (!stock || stock === "all") return "";
  if (stock === "low") return "Reserved";
  if (stock === "out") return "Out of Stock";
  return "";
};

const buildParams = (): BlockedOrderListParams => {
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
  const dateRange: BlockedOrderListParams["dateRange"] = Array.isArray(p.range)
    ? ([toDateText(p.range[0]), toDateText(p.range[1])] as [string, string])
    : [];
  return {
    company: authStore.currentCompany || undefined,
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
    const res = await getBlockedOrderList(buildParams()).send();
    const { data: rows, total: n } = parseFlowaListSalesOrdersResult(res);
    tableData.value = rows.map((o: unknown) => mapRowToBlockedRecord(o as Record<string, unknown>));
    total.value = n;
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
    const res = await getBlockedOrderDetail(row.id);
    expandDetailMap.value = { ...expandDetailMap.value, [row.id]: res };
  } catch (error) {
    console.error("Failed to fetch blocked order detail:", error);
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
    await createBlockedSupportTicket({
      id: row.id,
      subject: `Order support: ${row.orderId}`,
      message: "Need help with this blocked order.",
      priority: "High",
      company: authStore.currentCompany ?? undefined,
    }).send();
    ElMessage.success("Support ticket created");
  } catch (error) {
    ElMessage.error("Failed to create ticket");
  }
};

const handleRowAction = (action: string, row: any) => {
  switch (action) {
    case "view":
      handleViewDetail(row);
      break;
    case "tracking":
      goToTracking(row?.id);
      break;
    case "unblock":
      reactivateBlockedOrder({
        id: row.id,
        note: "Unblocked by operator.",
      }).then(() => {
        ElMessage.success("Order unblocked");
        fetchData();
      });
      break;
    case "cancel":
      updateBlockedOrderStatus({
        id: row.id,
        status: "Cancelled",
        company: authStore.currentCompany ?? undefined,
      }).send().then(() => {
        ElMessage.success("Status updated");
        fetchData();
      });
      break;
    case "support":
      createBlockedSupportTicket({
        id: row.id,
        subject: `Order support: ${row.orderId}`,
        message: "Need help with this blocked order.",
        priority: "High",
      }).then(() => {
        ElMessage.success("Support ticket created");
      });
      break;
    default:
      break;
  }
};

const getTaskSteps = (row: any) => {
  const subtitle = row?.status || "Blocked";
  return [
    { title: "Review & Fix", subtitle },
    { title: "Warehouse", subtitle },
    { title: "Export", subtitle },
    { title: "Local Delivery", subtitle },
    { title: "Delivered", subtitle },
  ];
};

const getActiveStep = (row: any) => {
  const stage = String(row?.stage || "");
  if (stage.includes("Review")) return 0;
  if (stage.includes("Warehouse")) return 1;
  if (stage.includes("Export")) return 2;
  if (stage.includes("Return")) return 3;
  return 0;
};

onMounted(async () => {
  await authStore.ensureCompany();
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
