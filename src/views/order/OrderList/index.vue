<template>
  <div class="products h-full flex flex-col">
    <div class="flex justify-between items-center mb-4 flex-shrink-0">
      <div>
        <div class="flex items-center gap-1 line-height-22px">
          <div class="text-#000 text-28px line-height-36px">Orders</div>
          <div class="text-#9A9A9A text-20px pt-1">/All Orders</div>
        </div>
        <div class="text-14px text-#6B6B6B">
          View and manage all synced orders across every stage of fulfillment.
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

    <div class="w-full flex justify-between items-end">
      <el-select
        v-model="dateRange"
        class="!w-30 mb-1"
        placeholder="Status"
        @change="handleDateRangeChange"
        clearable
      >
        <el-option label="this week" value="1" />
        <el-option label="this month" value="2" />
        <el-option label="this year" value="3" />
      </el-select>

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

    <div v-show="showCards" class="flex gap-4 mb-4">
      <div
        class="boxShadow bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-59.5 animate__animated animate__fadeInUp flex flex-col min-w-60%"
        style="animation-delay: 0.5s"
      >
        <div class="flex-1 w-full min-h-0">
          <CategoryChart />
        </div>
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
            <div class="text-16px">Total Revenue</div>
            <div class="flex items-center gap-1">
              <Icon icon="svg-icon:circle-arrow-up" color="#BDBDBD" />
              <div class="text-#BDBDBD">12% vs. last Week</div>
            </div>
          </div>
          <div class="flex items-center justify-end mb-1">
            <span class="text-3xl font-bold">$1,200</span>
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
                class="flex justify-between items-start px-6 py-3 !border-b-1.5 border-0 border-solid border-#ECECEC"
              >
                <div>
                  <div class="flex items-center gap-3 mb-2">
                    <span class="text-lg font-bold text-gray-900">
                      {{ getExpandRow(row).title }}
                    </span>
                    <span
                      class="px-2 py-0.5 rounded text-xs font-medium bg-[#FFF3E8] text-[#F6540C]"
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
                  variant="success"
                  :show-state-icon="true"
                />
                <div class="flex justify-between items-center">
                  <div class="text-lg font-bold text-sm">
                    <span text="text-#6B6B6B">Tracking No.:</span>
                    <span class="text-#000">{{
                      getExpandRow(row).trackingNo
                    }}</span>
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

              <div class="px-6 pb-6 overflow-auto">
                <BaseTable
                  :data="getExpandRow(row).items || []"
                  :columns="itemColumns"
                  :loading="false"
                  :pagination="false"
                  :height="null"
                >
                  <template #product="{ row: item }">
                    <div class="flex items-center gap-3">
                      <img
                        :src="productImage"
                        alt="Product Image"
                        class="w-10 h-10 rounded-lg"
                      />
                      <div class="flex flex-col">
                        <span class="text-sm font-medium text-gray-800">{{
                          item.name
                        }}</span>
                        <span class="text-xs text-gray-500">{{
                          item.sku
                        }}</span>
                      </div>
                    </div>
                  </template>
                  <template #details="{ row: item }">
                    <span class="text-xs text-gray-500">{{
                      item.details
                    }}</span>
                  </template>
                  <template #quantity="{ row: item }">
                    <span class="text-sm text-gray-700">{{
                      item.quantity
                    }}</span>
                  </template>
                  <template #price="{ row: item }">
                    <span class="text-sm text-gray-700">{{ item.price }}</span>
                  </template>
                  <template #warehouse="{ row: item }">
                    <span class="text-xs text-gray-500">{{
                      item.warehouse
                    }}</span>
                  </template>
                  <template #itemActions="{ row: item }">
                    <el-button
                      class="w-8 h-8 !ml-0"
                      @click="handleDeleteItem(getExpandRow(row), item)"
                    >
                      <Icon icon="svg-icon:trash-bin" color="#C62828" />
                    </el-button>
                  </template>
                </BaseTable>
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
            class="!rounded-full !px-3 !border-none !bg-[#FCE8E6] !text-[#D93025]"
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
          <div class="flex flex-1 justify-end gap-1">
            <el-button
              class="h-8 !p-2 !rounded-lg box-border !color-#fff !bg-[#9A9A9A]"
              @click="handleRowAction('await', row)"
            >
              <Icon icon="svg-icon:circle-xmark" />
              <span class="text-14px">Pending Approval</span>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import ProductFilter from "./components/ProductFilter.vue";
import ProductDetail from "./components/productDetail.vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/modules/auth";
import {
  flowaOrderActionApprove,
  flowaOrderActionBlock,
  flowaOrderActionCancel,
  flowaOrderActionDuplicateOrder,
  extractFlowaOrderActionResult,
} from "@/api/order/omsActions";
import {
  createOrderTicket,
  getOrderDetail,
  getOrderList,
  updateOrderStatus,
  deleteOrderItem,
  type OrderListParams,
  type OrderStage,
  type OrderStatus,
  type InventoryStatus,
} from "@/api/order/orderList";
import { ElMessage, ElMessageBox } from "element-plus";
import rightButtons from "./components/rightButtons.vue";
import CategoryChart from "./components/CategoryChart.vue";
import { Steps } from "@/components/base/Steps";

// ----------------- 临时数据
import productImage from "@/views/icon/yf.png";
// -----------------

// Product Detail State
const detailVisible = ref(false);
const currentProductId = ref<string | undefined>(undefined);
const showCards = ref(true);
const dateRange = ref("");

const isMock = (import.meta as any).env?.VITE_USE_MOCK === "true";
const router = useRouter();
const authStore = useAuthStore();

const handleAddProduct = () => {
  currentProductId.value = undefined;
  detailVisible.value = true;
};

const handleViewDetail = async (row: any) => {
  if (!row?.id) return;
  try {
    const res = await getOrderDetail(row.id);
    const firstSku =
      Array.isArray(res.items) && res.items.length
        ? res.items[0]?.sku
        : undefined;
    await ElMessageBox.alert(
      `${res.orderId}\n${res.platformId}\n${res.stage}\n${res.status}\n${res.customerName} · ${res.customerRegion}${
        firstSku ? `\n${firstSku}` : ""
      }`,
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
  { label: "Order ID / Platform ID", slot: "order" },
  { label: "Stages", slot: "stage", width: 120 },
  { label: "Status", slot: "status", width: 120, align: "center" },
  { label: "Customer", slot: "customer", width: 150 },
  { label: "Inventory", slot: "inventory", width: 120, align: "center" },
  { label: "Date", slot: "date", width: 180 },
  {
    label: "Actions",
    slot: "actions",
    width: 240,
    fixed: "right",
    align: "center",
  },
];

const itemColumns = [
  { label: "Product/ SKU ID", slot: "product", width: 280 },
  { label: "Details", slot: "details" },
  { label: "Quantity", slot: "quantity", width: 100, align: "center" },
  { label: "Price", slot: "price", width: 120, align: "center" },
  { label: "Warehouse", slot: "warehouse", width: 120, align: "center" },
  { label: "Actions", slot: "itemActions", width: 90, align: "center" },
];
const btnItems = [
  {
    key: "view",
    label: "View Details",
    icon: "svg-icon:eye",
    tone: "primary",
  },
  {
    key: "track",
    label: "Tracking",
    icon: "svg-icon:location-arrow",
    tone: "primary",
  },
  {
    key: "approve",
    label: "Approve",
    icon: "svg-icon:check",
    tone: "primary",
    disabled: isMock,
  },
  {
    key: "cancel",
    label: "Cancel",
    icon: "svg-icon:ban",
    tone: "danger",
    disabled: isMock,
  },
  {
    key: "block",
    label: "Block",
    icon: "svg-icon:ban",
    tone: "danger",
    disabled: isMock,
  },
  {
    key: "duplicate",
    label: "Duplicate",
    icon: "svg-icon:copy",
    tone: "primary",
    disabled: isMock,
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

const mapStage = (stage: string): OrderStage | "" => {
  if (!stage || stage === "all") return "";
  if (stage === "fix") return "Review & Fix";
  if (stage === "redelivery") return "Local Delivery";
  if (stage === "clearance") return "Export";
  if (stage === "discontinued") return "Warehouse";
  return "";
};

const mapStatus = (status: string): OrderStatus | "" => {
  if (!status || status === "all") return "";
  if (status === "cancelled") return "Awaiting Approval";
  if (status === "not") return "Processing";
  return "";
};

const mapInventory = (stock: string): InventoryStatus | "" => {
  if (!stock || stock === "all") return "";
  if (stock === "low") return "Reserved";
  if (stock === "out") return "Out of Stock";
  return "";
};

const buildParams = (): OrderListParams => {
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
  const range: OrderListParams["dateRange"] = Array.isArray(p.range)
    ? ([toDateText(p.range[0]), toDateText(p.range[1])] as [string, string])
    : [];
  return {
    page: page.value,
    pageSize: limit.value,
    keyword: keyword || undefined,
    stage,
    status,
    inventory,
    dateRange: range,
    quickRange:
      dateRange.value === "1"
        ? "last7"
        : dateRange.value === "2"
          ? "thisMonth"
          : "all",
  };
};

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await getOrderList(buildParams());
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
    const res = await getOrderDetail(row.id);
    expandDetailMap.value = { ...expandDetailMap.value, [row.id]: res };
  } catch (error) {
    console.error("Failed to fetch order detail:", error);
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
    await createOrderTicket({
      id: row.id,
      subject: `Order support: ${row.orderId}`,
      message: "Need help with this order.",
      priority: "High",
    });
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
    case "track": {
      const kw = (row?.orderId || row?.id || "").toString().trim();
      router.push({ path: "/orders/tracking", query: kw ? { kw } : {} });
      break;
    }
    case "approve":
      flowaOrderActionApprove({
        sales_order_name: String(row?.id || ""),
        company: (authStore as any).currentCompany ?? undefined,
      })
        .then((raw) => {
          const parsed = extractFlowaOrderActionResult(raw);
          if (!parsed.ok) throw new Error(parsed.error || "Failed");
          ElMessage.success(parsed.message || "Approved");
          fetchData();
        })
        .catch((e: any) => {
          ElMessage.error(e?.message || "Failed");
        });
      break;
    case "block":
      flowaOrderActionBlock({
        sales_order_name: String(row?.id || ""),
        company: (authStore as any).currentCompany ?? undefined,
      })
        .then((raw) => {
          const parsed = extractFlowaOrderActionResult(raw);
          if (!parsed.ok) throw new Error(parsed.error || "Failed");
          ElMessage.success(parsed.message || "Blocked");
          fetchData();
        })
        .catch((e: any) => {
          ElMessage.error(e?.message || "Failed");
        });
      break;
    case "duplicate":
      flowaOrderActionDuplicateOrder({
        sales_order_name: String(row?.id || ""),
        company: (authStore as any).currentCompany ?? undefined,
      })
        .then((raw) => {
          const parsed = extractFlowaOrderActionResult(raw);
          if (!parsed.ok) throw new Error(parsed.error || "Failed");
          ElMessage.success(parsed.message || "Duplicated");
          fetchData();
        })
        .catch((e: any) => {
          ElMessage.error(e?.message || "Failed");
        });
      break;
    case "cancel":
      ElMessageBox.prompt("Please enter cancel reason", "Cancel Order", {
        confirmButtonText: "Confirm",
        cancelButtonText: "Close",
        inputPlaceholder: "Reason",
      })
        .then((res: any) => {
          const reason = String(res?.value || "").trim();
          if (!reason) throw new Error("Cancel reason is required");
          return flowaOrderActionCancel({
            sales_order_name: String(row?.id || ""),
            company: (authStore as any).currentCompany ?? undefined,
            cancel_reason: reason,
          });
        })
        .then((raw) => {
          const parsed = extractFlowaOrderActionResult(raw);
          if (!parsed.ok) throw new Error(parsed.error || "Failed");
          ElMessage.success(parsed.message || "Cancelled");
          fetchData();
        })
        .catch((e: any) => {
          if (e === "cancel") return;
          ElMessage.error(e?.message || "Failed");
        });
      break;
    case "await":
      updateOrderStatus({
        id: row.id,
        status: "Awaiting Approval",
      }).then(() => {
        ElMessage.success("Marked as Awaiting Approval");
        fetchData();
      });
      break;
    case "support":
      createOrderTicket({
        id: row.id,
        subject: `Order support: ${row.orderId}`,
        message: "Need help with this order.",
        priority: "High",
      }).then(() => {
        ElMessage.success("Support ticket created");
      });
      break;
    default:
      break;
  }
};

const handleDeleteItem = async (order: any, item: any) => {
  if (!order?.id || !item?.id) return;
  await deleteOrderItem({ id: order.id, itemId: item.id });
  const detail = await getOrderDetail(order.id);
  expandDetailMap.value = { ...expandDetailMap.value, [order.id]: detail };
  ElMessage.success("Item removed");
};

const getActiveStep = (row: any) => {
  const stage = String(row?.stage || "");
  if (stage.includes("Review")) return 0;
  if (stage.includes("Warehouse")) return 1;
  if (stage.includes("Export")) return 2;
  if (stage.includes("Local")) return 3;
  if (stage.includes("Delivered")) return 4;
  return 0;
};

const getTaskSteps = (row: any) => {
  const active = getActiveStep(row);
  const subtitle = row?.status || "Awaiting";
  return [
    {
      title: "Review & Fix",
      subtitle,
      state: active > 0 ? "completed" : active === 0 ? "active" : "pending",
    },
    {
      title: "Warehouse",
      subtitle,
      state: active > 1 ? "completed" : active === 1 ? "active" : "pending",
    },
    {
      title: "Export",
      subtitle,
      state: active > 2 ? "completed" : active === 2 ? "active" : "pending",
    },
    {
      title: "Local Delivery",
      subtitle,
      state: active > 3 ? "completed" : active === 3 ? "active" : "pending",
    },
    {
      title: "Delivered",
      subtitle: active >= 4 ? "Completed" : "Awaiting",
      state: active >= 4 ? "completed" : "pending",
    },
  ] as any;
};

const handleDateRangeChange = () => {
  page.value = 1;
  fetchData();
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

.boxShadow {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.06);
}
</style>
