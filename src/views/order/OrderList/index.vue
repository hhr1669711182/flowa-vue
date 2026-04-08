<template>
  <div class="products h-full flex flex-col">
    <div class="flex justify-between items-center mb-4 flex-shrink-0">
      <div>
        <div class="flex items-center gap-1 line-height-22px">
          <div class="text-#000 text-28px line-height-36px">Orders</div>
          <div class="text-#9A9A9A text-20px pt-1">/All Orders</div>
        </div>
        <div class="text-14px text-#6B6B6B">
          View and manage all your orders and their status.
        </div>
      </div>
      <div class="flex items-center gap-3">
        <el-button type="primary" size="large" :disabled="orderActionGlobalPending" @click="handleAddProduct">
          <span class="flex items-center gap-1.5">
            <Icon icon="svg-icon:plus" color="#fff" />
            <span>Create Order</span>
          </span>
        </el-button>
        <el-button
          type="primary"
          plain
          size="large"
          :disabled="!selectedOrderIds.length || orderActionGlobalPending"
          @click="batchTrackingSelected"
        >
          <span>Tracking</span>
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
        row-key="id"
        @pagination-change="fetchData"
        @expand-change="handleExpandChange"
        @selection-change="onSelectionChange"
      >
        <template #expand="{ row }">
          <div class="py-4 px-6 bg-#F7F7F7">
            <div v-if="expandLoadingMap[row.id]" class="px-6 py-8 text-center text-gray-500">Loading...</div>
            <div v-else class="bg-#fff rounded-lg border border-gray-200">
              <div
                class="flex justify-between items-start px-6 py-3 !border-b-1.5 border-0 border-solid border-#ECECEC"
              >
                <div>
                  <div class="flex items-center gap-3 mb-2">
                    <span class="text-lg font-bold text-gray-900">
                      {{ getExpandData(row).orderId }}
                    </span>
                    <span
                      class="px-2 py-0.5 rounded text-xs font-medium"
                      :class="
                        /cancelled|blocked/i.test(getExpandData(row).status)
                          ? 'bg-[#FDEAEA] text-[#C62828]'
                          : 'bg-[#EEF2FF] text-[#1D4ED8]'
                      "
                    >
                      {{ getExpandData(row).status || getExpandData(row).stage }}
                    </span>
                  </div>
                  <div class="text-xs text-gray-500 flex gap-4">
                    <span>Create {{ getExpandData(row).createDate }}</span>
                    <span>Due {{ getExpandData(row).dueDate }}</span>
                  </div>
                </div>

                <div class="text-left text-sm">
                  <div class="mb-1">
                    <span class="text-gray-500 mr-2">Sending to</span>
                    <span class="text-gray-900">{{ getExpandData(row).customerRegion || getExpandData(row).customerCountry || '-' }}</span>
                  </div>
                  <div class="mt-2 text-xs text-gray-500">
                    <span>Estimated arrived at</span>
                    <span class="text-gray-900 font-semibold ml-1">{{ getExpandData(row).dueDate || '-' }}</span>
                  </div>
                </div>
              </div>

              <div class="px-6 py-4">
                <BaseTable
                  :data="getExpandTableRows(row)"
                  :columns="expandColumns"
                  :pagination="false"
                >
                  <template #salesOrder="{ row: r }">
                    <a href="javascript:;" class="text-[#1D4ED8] hover:underline" @click="handleViewDetail({ id: r.salesOrder })">
                      {{ r.salesOrder }}
                    </a>
                  </template>
                  <template #status="{ row: r }">
                    <el-tag effect="dark" class="!rounded-full !px-3 !border-none !bg-[#EEF2FF] !text-[#1D4ED8]">
                      {{ r.status }}
                    </el-tag>
                  </template>
                </BaseTable>
                <div class="flex justify-between items-center mt-4">
                  <div class="text-lg font-bold text-sm">
                    <span class="text-#6B6B6B">Tracking No.:</span>
                    <span class="text-#000">{{ getExpandData(row).trackingNo || getExpandTableRows(row)[0]?.deliveryNo || '-' }}</span>
                  </div>
                  <el-button
                    class="!font-semibold w-[166px] hover:!bg-#F4F6FA !px-4 !h-8 !color-[#F6540C]"
                    @click="handleSupport(getExpandData(row))"
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
            <el-avatar :size="32" class="bg-gray-100 text-gray-700"
              >O</el-avatar
            >
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
          <el-tag effect="dark" :class="orderRowStatusTagClass(row)">
            {{ orderRowStatusText(row) }}
          </el-tag>
        </template>
        <template #country="{ row }">
          <span class="text-sm text-gray-700">{{ row.customerCountry || row.customerRegion || '-' }}</span>
        </template>
        <template #deliveryOrderNo="{ row }">
          <span class="text-sm text-gray-700">{{ row.platformId || '-' }}</span>
        </template>
        <template #date="{ row }">
          <div class="text-left text-xs text-gray-500">
            <div>
              Create:
              <span class="text-gray-900 font-semibold ml-1">{{ row.createDate }}</span>
            </div>
            <div class="mt-1">
              Due:
              <span class="text-gray-900 font-semibold ml-1">{{ row.dueDate }}</span>
            </div>
          </div>
        </template>
        <template #actions="{ row }">
          <div class="flex flex-1 justify-center gap-1 items-center">
            <el-button
              type="default"
              class="!h-8 !px-2 !rounded-md !ml-0 shrink-0 !min-w-[108px] !w-[108px] !inline-flex !items-center !justify-center !gap-1 !border !border-solid !border-[#D0D7E3] !bg-[#EEF2F6] !text-[#16215B] !shadow-none hover:!bg-[#E2E8F0] hover:!border-[#B8C4D4] hover:!text-[#16215B]"
              @click="handlePrimaryRowAction(row)"
            >
              <Icon :icon="getPrimaryActionMeta(row).icon" color="#16215B" />
              <span class="text-14px truncate">{{ getPrimaryActionMeta(row).label }}</span>
            </el-button>
            <el-button
              type="default"
              class="w-8 h-8 !ml-0 !p-0 !border !border-solid !border-[#D0D7E3] !bg-[#EEF2F6] hover:!bg-[#E2E8F0]"
              @click="handleViewDetail(row)"
            >
              <Icon icon="svg-icon:eye" color="#16215B" />
            </el-button>
            <el-popover
              v-if="getActionMenuItemsForRow(row).length > 0"
              placement="bottom-start"
              trigger="click"
              popper-class="!p-0 !px-2 !min-w-auto !rounded-lg !w-auto"
              :show-arrow="false"
            >
              <template #reference>
                <el-button
                  type="default"
                  class="w-8 h-8 !ml-0 !p-0 !border !border-solid !border-[#D0D7E3] !bg-[#EEF2F6] hover:!bg-[#E2E8F0]"
                >
                  <Icon icon="svg-icon:ellipsis-vertical" color="#16215B" />
                </el-button>
              </template>
              <rightButtons
                :row="row"
                :items="getActionMenuItemsForRow(row)"
                @action="handleRowAction"
              />
            </el-popover>
            <div
              v-else
              class="w-8 h-8 shrink-0 !ml-0 rounded-md border border-solid border-[#D0D7E3] bg-[#EEF2F6]"
              aria-hidden="true"
            />
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

    <OrderDetailDrawer
      v-model="detailDrawerVisible"
      :loading="detailDrawerLoading"
      :row="detailDrawerData?.row ?? null"
      :doc="detailDrawerData?.doc ?? null"
      :line-items="detailDrawerData?.lineItems ?? []"
      :company="authStore.currentCompany ?? undefined"
      @contact-support="onDetailDrawerSupport"
      @shipping-saved="reloadDetailDrawerDoc"
      @add-items="onDetailDrawerAddItems"
    />

    <OrderSplitOrderDialog
      v-model="splitDialogVisible"
      :loading="splitDialogLoading"
      :lines="splitDialogLines"
      :sales-order-name="String(splitTargetRow?.id ?? '')"
      :company="authStore.currentCompany ?? undefined"
      :list-row="splitTargetRow"
      @success="onSplitOrderSuccess"
    />

    <OrderAddItemsDialog
      v-model="addItemsDialogVisible"
      :sales-order-name="addItemsSalesOrderName"
      :company="authStore.currentCompany ?? undefined"
      :initial-line-items="addItemsInitialLines"
      :currency="addItemsDialogCurrency"
      @saved="onAddItemsSaved"
    />

    <Teleport to="body">
      <div
        v-if="orderActionGlobalPending"
        class="flowa-order-action-global-overlay fixed inset-0 z-[10000] flex flex-col items-center justify-center gap-4 bg-[rgba(15,23,42,0.5)] backdrop-blur-[2px]"
        role="alertdialog"
        aria-live="polite"
        aria-busy="true"
      >
        <div
          class="rounded-xl bg-white px-10 py-8 shadow-2xl min-w-[300px] max-w-[min(420px,92vw)] flex flex-col items-stretch gap-5 border border-solid border-[#E8ECF4]"
        >
          <el-progress :percentage="100" :indeterminate="true" :stroke-width="10" :show-text="false" />
          <p class="text-14px text-[#475569] m-0 text-center leading-normal">
            Processing your request, please wait…
          </p>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from "vue";
import ProductFilter from "./components/ProductFilter.vue";
import ProductDetail from "./components/productDetail.vue";
import OrderDetailDrawer from "./components/OrderDetailDrawer.vue";
import OrderAddItemsDialog from "./components/OrderAddItemsDialog.vue";
import OrderSplitOrderDialog from "./components/OrderSplitOrderDialog.vue";
import {
  reactivateCancelledOrder,
  updateCancelledOrderStatus,
  type CancelledOrderStage,
} from "@/api/order/cancelled";
import { getInProgressOrderDetail } from "@/api/order/inProgress";
import { getOrders } from "@/api/order";
import { extractOmsSalesOrderDetail, parseFlowaListSalesOrdersResult } from "@/utils/frappeResponse";
import {
  mapRowToOrderRecord,
  patchRowFromSalesOrderDoc,
  extractExpandTableRows,
  extractOrderDetailLineItems,
  type ExpandTableRow,
  type OrderDetailLineItem,
} from "@/utils/flowaSalesOrderRowMap";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/modules/auth";
import { ElMessage, ElMessageBox } from "element-plus";
import rightButtons from "./components/rightButtons.vue";
import { Steps } from "@/components/base/Steps";
import type { StepItem } from "@/components/base/Steps/src/Steps.vue";
import type { MenuButtonItem } from "@/views/components/menuButtons";
import { orderRowStatusTagClass, orderRowStatusText } from "@/utils/orderRowStatusDisplay";
import {
  primaryActionKeyForOrderRow,
  primaryActionButtonMeta,
  orderListFilteredMenuItems,
  orderListRowIsReadonlyClosedOrCompleted,
} from "@/utils/orderListPrimaryAction";
import {
  flowaOrderActionApprove,
  flowaOrderActionCancel,
  flowaOrderActionBlock,
  flowaOrderActionContactSupport,
  flowaOrderActionMarkPending,
  flowaOrderActionDuplicateOrder,
  extractFlowaOrderActionResult,
} from "@/api/order/omsActions";

const authStore = useAuthStore();
const router = useRouter();

const selectedRows = ref<any[]>([]);
const selectedOrderIds = computed(() =>
  selectedRows.value.map((r) => r?.id).filter(Boolean)
);

/** 订单列表：全屏进度遮罩，任一订单 API 进行中时为 true */
const orderActionGlobalPending = ref(false);

function tryBeginGlobalOrderAction(): boolean {
  if (orderActionGlobalPending.value) {
    ElMessage.warning("Another request is in progress. Please wait.");
    return false;
  }
  orderActionGlobalPending.value = true;
  return true;
}

function endGlobalOrderAction() {
  orderActionGlobalPending.value = false;
}

function goToTracking(orderId: string) {
  const kw = (orderId && String(orderId).trim()) || "";
  router.push({ path: "/orders/tracking", query: kw ? { kw } : {} });
}

function onSelectionChange(rows: any[]) {
  selectedRows.value = Array.isArray(rows) ? rows : [];
}

function batchTrackingSelected() {
  const ids = selectedOrderIds.value;
  if (!ids.length) return;
  const kw = ids.join("\n");
  router.push({ path: "/orders/tracking", query: { kw } });
}

// Product Detail State
const detailVisible = ref(false);
const currentProductId = ref<string | undefined>(undefined);

const handleAddProduct = () => {
  currentProductId.value = undefined;
  detailVisible.value = true;
};

const detailDrawerVisible = ref(false);
const detailDrawerLoading = ref(false);
const detailDrawerData = ref<{
  row: any;
  expandRows: ExpandTableRow[];
  doc: Record<string, unknown> | null;
  lineItems: OrderDetailLineItem[];
} | null>(null);

const splitDialogVisible = ref(false);
const splitDialogLoading = ref(false);
const splitTargetRow = ref<any>(null);
const splitDialogLines = ref<OrderDetailLineItem[]>([]);

const addItemsDialogVisible = ref(false);
const addItemsSalesOrderName = ref("");
const addItemsInitialLines = ref<OrderDetailLineItem[]>([]);

const addItemsDialogCurrency = computed(() => {
  const cur = detailDrawerData.value?.doc?.currency;
  if (cur == null || cur === "") return undefined;
  return String(cur);
});

const handleViewDetail = async (row: any) => {
  const id = row?.id ?? row?.salesOrder;
  if (!id) return;
  detailDrawerLoading.value = true;
  detailDrawerVisible.value = true;
  detailDrawerData.value = null;
  try {
    const listRow = tableData.value.find((r: any) => r.id === id) ?? row;
    const raw = await getInProgressOrderDetail(id, authStore.currentCompany ?? undefined).send();
    const doc = extractOmsSalesOrderDetail(raw);
    const patchedRow = doc ? patchRowFromSalesOrderDoc(listRow, doc) : listRow;
    const expandRows = extractExpandTableRows(doc, listRow as Record<string, unknown>);
    const lineItems = extractOrderDetailLineItems(doc);
    detailDrawerData.value = {
      row: patchedRow,
      expandRows,
      doc: doc as Record<string, unknown> | null,
      lineItems,
    };
  } catch {
    ElMessage.error("Failed to load detail");
    detailDrawerVisible.value = false;
  } finally {
    detailDrawerLoading.value = false;
  }
};

async function reloadDetailDrawerDoc() {
  const id = detailDrawerData.value?.row?.id;
  if (!id) return;
  detailDrawerLoading.value = true;
  try {
    const listRow = tableData.value.find((r: any) => r.id === id) ?? detailDrawerData.value!.row;
    const raw = await getInProgressOrderDetail(id, authStore.currentCompany ?? undefined).send();
    const doc = extractOmsSalesOrderDetail(raw);
    const patchedRow = doc ? patchRowFromSalesOrderDoc(listRow, doc) : listRow;
    const expandRows = extractExpandTableRows(doc, listRow as Record<string, unknown>);
    const lineItems = extractOrderDetailLineItems(doc);
    detailDrawerData.value = {
      row: patchedRow,
      expandRows,
      doc: doc as Record<string, unknown> | null,
      lineItems,
    };
  } catch {
    ElMessage.error("Failed to refresh order");
  } finally {
    detailDrawerLoading.value = false;
  }
}

function onDetailDrawerSupport() {
  const r = detailDrawerData.value?.row;
  if (r) void handleSupport(r);
}

function onDetailDrawerAddItems() {
  const r = detailDrawerData.value?.row;
  const lines = detailDrawerData.value?.lineItems ?? [];
  if (r?.id) openAddLineItemDialog(r, lines);
  else ElMessage.warning("No order loaded");
}

async function openSplitOrderDialog(row: any) {
  const id = row?.id;
  if (!id) return;
  if (!tryBeginGlobalOrderAction()) return;
  splitTargetRow.value = row;
  splitDialogVisible.value = true;
  splitDialogLoading.value = true;
  splitDialogLines.value = [];
  try {
    const raw = await getInProgressOrderDetail(id, authStore.currentCompany ?? undefined).send();
    const doc = extractOmsSalesOrderDetail(raw);
    const lines = extractOrderDetailLineItems(doc);
    splitDialogLines.value = lines;
    if (!lines.length) {
      ElMessage.warning("No lines to split");
      splitDialogVisible.value = false;
    }
  } catch {
    ElMessage.error("Failed to load order lines");
    splitDialogVisible.value = false;
  } finally {
    splitDialogLoading.value = false;
    endGlobalOrderAction();
  }
}

function onSplitOrderSuccess() {
  const row = splitTargetRow.value;
  if (row?.id) {
    const m = { ...expandDetailMap.value };
    delete m[row.id];
    expandDetailMap.value = m;
  }
  fetchData();
}

function openAddLineItemDialog(row: any, initialLines?: OrderDetailLineItem[]) {
  if (!row?.id) return;
  addItemsSalesOrderName.value = String(row.id);
  addItemsInitialLines.value = initialLines?.length ? [...initialLines] : [];
  addItemsDialogVisible.value = true;
}

async function onAddItemsSaved() {
  const id = addItemsSalesOrderName.value;
  if (!id) return;
  const m = { ...expandDetailMap.value };
  delete m[id];
  expandDetailMap.value = m;
  await fetchData();
  if (detailDrawerVisible.value && detailDrawerData.value?.row?.id === id) {
    await handleViewDetail({ id });
  }
}

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

// Table Configuration - 与 In Progress 列表样式一致
const columns = [
  { type: "selection", width: 50 },
  { type: "expand", width: 50, slot: "expand" },
  { label: "Order ID / Platform ID", slot: "order", width: 180 },
  { label: "Stages", slot: "stage", width: 120 },
  { label: "Status", slot: "status", width: 120, align: "center" },
  { label: "Country", slot: "country", width: 150 },
  { label: "Delivery Order No", slot: "deliveryOrderNo", width: 160 },
  { label: "Date", slot: "date", width: 180 },
  { label: "Actions", slot: "actions", width: 228, fixed: "right" },
];

const expandColumns = [
  { label: "Sales Order", prop: "salesOrder", slot: "salesOrder", width: 140 },
  { label: "Order Date", prop: "orderDate", width: 120 },
  { label: "Delivery Date", prop: "deliveryDate", width: 120 },
  { label: "Delivery No", prop: "deliveryNo", width: 180 },
  { label: "Delivery Order No", prop: "deliveryOrderNo", width: 160 },
  { label: "Country", prop: "country", width: 120 },
  { label: "Qty", prop: "qty", width: 80 },
  { label: "Weight", prop: "weight", width: 100 },
  { label: "Status", prop: "status", slot: "status", width: 120 },
];

const btnItems: MenuButtonItem[] = [
  { key: "mark_pending", label: "Mark Pending", icon: "svg-icon:sliders", tone: "primary" },
  { key: "approve", label: "Approve Order", icon: "svg-icon:circle-check", tone: "primary" },
  { key: "cancel_order", label: "Cancel Order", icon: "svg-icon:circle-xmark", tone: "danger" },
  { key: "block_order", label: "Block Order", icon: "svg-icon:circle-minus", tone: "danger" },
  {
    key: "view",
    label: "View Order Details",
    icon: "svg-icon:eye",
    tone: "primary",
    dividerBefore: true,
  },
  { key: "edit", label: "Edit Order", icon: "svg-icon:pencil", tone: "primary" },
  { key: "duplicate", label: "Duplicate Order", tone: "primary" },
  { key: "add_item", label: "Add Item", icon: "svg-icon:plus", tone: "primary" },
  { key: "split", label: "Split Order", icon: "svg-icon:sliders", tone: "primary" },
  { key: "tracking", label: "Tracking", icon: "svg-icon:circle-arrow-up", tone: "primary" },
  { key: "support", label: "Contact Support", icon: "svg-icon:headphones", tone: "danger" },
];

// Data Logic
const tableData = ref<any>([]);
const loading = ref(false);
const total = ref(0);
const page = ref(1);
const limit = ref(10);
const expandDetailMap = ref<Record<string, any>>({});
const expandLoadingMap = ref<Record<string, boolean>>({});

const buildParams = () => {
  const p: any = currentFilters.value || {};
  const keyword = (p.sku || p.keyword || "").toString().trim();
  return {
    company: authStore.currentCompany || undefined,
    page: page.value,
    page_size: limit.value,
    order_no: keyword || undefined,
    // 不传 menu_key，获取所有订单
  };
};

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await getOrders(buildParams()).send();
    const { data: rows, total: n } = parseFlowaListSalesOrdersResult(res);
    tableData.value = rows.map((o: unknown) => mapRowToOrderRecord(o as Record<string, unknown>));
    total.value = n;
    await nextTick();
  } catch (error) {
    console.error("Failed to fetch orders:", error);
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
    const raw = await getInProgressOrderDetail(row.id, authStore.currentCompany ?? undefined).send();
    const doc = extractOmsSalesOrderDetail(raw);
    const patchedRow = doc ? patchRowFromSalesOrderDoc(row, doc) : row;
    const expandRows = extractExpandTableRows(doc, row as Record<string, unknown>);
    expandDetailMap.value = { ...expandDetailMap.value, [row.id]: { row: patchedRow, expandRows } };
  } catch (error) {
    console.error("Failed to fetch order detail:", error);
  } finally {
    expandLoadingMap.value = { ...expandLoadingMap.value, [row.id]: false };
  }
};

const getExpandData = (row: any) => {
  if (!row?.id) return row;
  const entry = expandDetailMap.value[row.id];
  return entry?.row ?? row;
};

const getExpandTableRows = (row: any): ExpandTableRow[] => {
  if (!row?.id) return [];
  const entry = expandDetailMap.value[row.id];
  return entry?.expandRows ?? extractExpandTableRows(null, row as Record<string, unknown>);
};

const handleSupport = async (row: any) => {
  const target = row?.id ? getExpandData(row) : row;
  if (!target?.id) return;
  if (!tryBeginGlobalOrderAction()) return;
  try {
    const raw = await flowaOrderActionContactSupport({
      sales_order_name: target.id,
      company: authStore.currentCompany ?? undefined,
      subject: `Order support: ${target.orderId}`,
      message: "Need help with this order.",
      priority: "High",
    }).send();
    const r = extractFlowaOrderActionResult(raw);
    if (!r.ok) {
      ElMessage.error(r.error || "Failed");
      return;
    }
    ElMessage.success(r.message || "Support ticket created");
  } catch {
    ElMessage.error("Failed to create ticket");
  } finally {
    endGlobalOrderAction();
  }
};

function getPrimaryActionMeta(row: any) {
  const key = primaryActionKeyForOrderRow(row);
  return { key, ...primaryActionButtonMeta(key) };
}

function handlePrimaryRowAction(row: any) {
  const m = getPrimaryActionMeta(row);
  handleRowAction(m.key, row);
}

function getActionMenuItemsForRow(row: any) {
  return orderListFilteredMenuItems(btnItems, row);
}

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
    { title: "Review & Fix", subtitle: active > 0 ? "Completed" : subtitle, state: active > 0 ? "completed" : active === 0 ? "active" : "pending" },
    { title: "Warehouse", subtitle: active > 1 ? "Completed" : active === 1 ? subtitle : "Awaiting", state: active > 1 ? "completed" : active === 1 ? "active" : "pending" },
    { title: "Export", subtitle: active > 2 ? "Completed" : active === 2 ? subtitle : "Awaiting", state: active > 2 ? "completed" : active === 2 ? "active" : "pending" },
    { title: "Local Delivery", subtitle: active > 3 ? "Completed" : active === 3 ? subtitle : "Awaiting", state: active > 3 ? "completed" : active === 3 ? "active" : "pending" },
    { title: "Delivered", subtitle: "Awaiting", state: "pending" },
  ];
};

const handleRowAction = async (action: string, row: any) => {
  const id = row?.id as string | undefined;
  const company = authStore.currentCompany ?? undefined;

  if (
    orderListRowIsReadonlyClosedOrCompleted(row) &&
    action !== "view" &&
    action !== "support" &&
    action !== "edit"
  ) {
    ElMessage.warning(
      "This order is closed or completed. You can only view details or contact support."
    );
    return;
  }

  switch (action) {
    case "edit":
      await handleViewDetail(row);
      break;
    case "mark_pending": {
      if (!id) return;
      if (!tryBeginGlobalOrderAction()) return;
      try {
        const raw = await flowaOrderActionMarkPending({ sales_order_name: id, company }).send();
        const r = extractFlowaOrderActionResult(raw);
        if (!r.ok) {
          ElMessage.error(r.error || "Failed");
          return;
        }
        ElMessage.success(r.message || "Updated");
        fetchData();
      } catch {
        ElMessage.error("Request failed");
      } finally {
        endGlobalOrderAction();
      }
      break;
    }
    case "duplicate": {
      if (!id) return;
      if (!tryBeginGlobalOrderAction()) return;
      let newName = "";
      try {
        const raw = await flowaOrderActionDuplicateOrder({ sales_order_name: id, company }).send();
        const r = extractFlowaOrderActionResult(raw);
        if (!r.ok) {
          endGlobalOrderAction();
          ElMessage.error(String(r.error || "Failed"));
          return;
        }
        newName = String(r.data?.new_order_name ?? "").trim();
        ElMessage.success(newName ? `Duplicated as ${newName}` : r.message || "Duplicated");
        await fetchData();
      } catch {
        endGlobalOrderAction();
      } finally {
        endGlobalOrderAction();
      }
      if (newName) await handleViewDetail({ id: newName, orderId: newName });
      break;
    }
    case "split":
      await openSplitOrderDialog(row);
      break;
    case "add_item":
      openAddLineItemDialog(row);
      break;
    case "approve": {
      if (!id) return;
      if (!tryBeginGlobalOrderAction()) return;
      try {
        const raw = await flowaOrderActionApprove({ sales_order_name: id, company }).send();
        const r = extractFlowaOrderActionResult(raw);
        if (!r.ok) {
          endGlobalOrderAction();
          ElMessage.error(String(r.error || "Failed"));
          return;
        }
        ElMessage.success(r.message || "Submitted");
        fetchData();
      } catch {
        endGlobalOrderAction();
      } finally {
        endGlobalOrderAction();
      }
      break;
    }
    case "cancel_order": {
      if (!id) return;
      let cancelReason = "";
      try {
        const promptBox = (await ElMessageBox.prompt("Cancellation reason (required)", "Cancel order", {
          confirmButtonText: "Confirm",
          cancelButtonText: "Back",
          inputPattern: /\S/,
          inputErrorMessage: "Reason is required",
        })) as { value: string };
        cancelReason = String(promptBox.value ?? "").trim();
        if (!cancelReason) {
          ElMessage.warning("Reason is required");
          return;
        }
      } catch (e: unknown) {
        if (e !== "cancel") ElMessage.error("Request failed");
        return;
      }
      if (!tryBeginGlobalOrderAction()) return;
      try {
        const raw = await flowaOrderActionCancel({
          sales_order_name: id,
          company,
          cancel_reason: cancelReason,
        }).send();
        const r = extractFlowaOrderActionResult(raw);
        if (!r.ok) {
          ElMessage.error(r.error || "Failed");
          return;
        }
        ElMessage.success(r.message || "Cancelled");
        fetchData();
      } catch {
        ElMessage.error("Request failed");
      } finally {
        endGlobalOrderAction();
      }
      break;
    }
    case "block_order": {
      if (!id) return;
      if (!tryBeginGlobalOrderAction()) return;
      try {
        const raw = await flowaOrderActionBlock({ sales_order_name: id, company }).send();
        const r = extractFlowaOrderActionResult(raw);
        if (!r.ok) {
          ElMessage.error(r.error || "Failed");
          return;
        }
        ElMessage.success(r.message || "OK");
        fetchData();
      } catch {
        ElMessage.error("Request failed");
      } finally {
        endGlobalOrderAction();
      }
      break;
    }
    case "view":
      handleViewDetail(row);
      break;
    case "tracking":
      goToTracking(row?.id);
      break;
    case "reactivate": {
      if (!tryBeginGlobalOrderAction()) return;
      try {
        await reactivateCancelledOrder({
          id: row.id,
          note: "Manual reactivation requested.",
          targetStage: (row.stage || "Review and Fix") as CancelledOrderStage,
          company: authStore.currentCompany ?? undefined,
        }).send();
        ElMessage.success("Reactivation requested");
        fetchData();
      } catch {
        ElMessage.error("Request failed");
      } finally {
        endGlobalOrderAction();
      }
      break;
    }
    case "status": {
      if (!tryBeginGlobalOrderAction()) return;
      try {
        await updateCancelledOrderStatus({
          id: row.id,
          status: "Archived",
          company: authStore.currentCompany ?? undefined,
        }).send();
        ElMessage.success("Status updated");
        fetchData();
      } catch {
        ElMessage.error("Request failed");
      } finally {
        endGlobalOrderAction();
      }
      break;
    }
    case "support": {
      if (!id) return;
      if (!tryBeginGlobalOrderAction()) return;
      try {
        const raw = await flowaOrderActionContactSupport({
          sales_order_name: id,
          company,
          subject: `Order support: ${row.orderId}`,
          message: "Need help with this order.",
          priority: "High",
        }).send();
        const r = extractFlowaOrderActionResult(raw);
        if (!r.ok) {
          ElMessage.error(r.error || "Failed");
          return;
        }
        ElMessage.success(r.message || "Support ticket created");
      } catch {
        ElMessage.error("Failed to create ticket");
      } finally {
        endGlobalOrderAction();
      }
      break;
    }
    default:
      break;
  }
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
