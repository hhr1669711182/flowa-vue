<template>
  <div class="dashboard flex flex-col gap-4">
    <div class="mb-2 flex flex-col gap-2">
      <div class="flex justify-between w-full h-17 items-center">
        <div>
          <h1 class="text-2xl font-700 font-bold text-gray-800 tracking-tight">
            Welcome {{ welcomeName }}
          </h1>
          <p class="text-gray-500 mt-1 text-sm font-500">
            View and manage all your individual products and their stock status.
          </p>
        </div>
        <el-button class="!rounded-lg text-[#16215B]" :icon="Plus"
          >Create Order</el-button
        >
      </div>
    </div>

    <div>
      <div class="flex justify-end space-x-3 px-3 py-2">
        <EditPopover
          v-model="editVisible"
          :items="editItems"
          @toggle="toggleItem"
          @hide-all="hideAll"
        >
          <el-link type="primary" class="!rounded-lg text-[#16215B]">
            <el-icon class="mr-2"><Edit /></el-icon>
            Edit Data
          </el-link>
        </EditPopover>
      </div>
      <el-row :gutter="16">
        <el-col
          :xs="24"
          :lg="8"
          class="mb-6 lg:mb-0"
          v-if="dataVisibility.reservedCredits"
        >
          <div
            class="card bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-59.5 animate__animated animate__fadeInUp flex flex-col"
            style="animation-delay: 0.4s"
          >
            <div class="flex justify-between items-center mb-6">
              <div>
                <h3 class="text-lg font-bold text-#000">Balance</h3>
                <div
                  class="text-xs text-#0211A3 mt-0.5 flex items-center gap-2"
                >
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
              <el-button
                type="primary"
                size="large"
                class="!w-[128px] !rounded-2"
                @click="handleRecharge"
              >
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
            <div class="flex-1 w-full min-h-0">
              <div
                v-for="item in progressItems"
                :key="item.label"
                class="w-full mt-4.5"
              >
                <el-row
                  justify="space-between"
                  class="text-xs text-gray-600 mb-1"
                >
                  <el-col :span="12">{{ item.label }}</el-col>
                  <el-col
                    :span="12"
                    class="text-right"
                    :style="{ color: item.color }"
                    >{{ item.value }}</el-col
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
        </el-col>

        <el-col :xs="24" :lg="16" v-if="dataVisibility.orderSummary">
          <div
            class="card bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-59.5 animate__animated animate__fadeInUp flex flex-col"
            style="animation-delay: 0.5s"
          >
            <div class="flex-1 w-full min-h-0">
              <CategoryChart :order-stats="orderStatsForChart" />
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
    <el-row
      :gutter="16"
      class="rounded-xl overflow-hidden animate__animated animate__fadeInUp"
      style="animation-delay: 0.6s"
    >
      <el-col :xs="24" :sm="12" :lg="9">
        <div
          class="notifications-card bg-white rounded-xl shadow-sm border border-gray-100 p-1 animate__animated animate__fadeInUp"
          style="animation-delay: 0.6s"
        >
          <div class="flex justify-between items-center p-2">
            <div class="text-lg font-bold text-#000 text-16px">
              Notifications
            </div>
            <el-button
              type="default"
              plain
              class="!rounded-2 !px-4 !py-1.5"
              :loading="markReadLoading"
              @click="onMarkAllRead"
            >
              <Icon
                icon="hugeicons:tick-double-01"
                width="24"
                height="24"
                style="color: #1e7f4e"
              />
              <span class="text-[14px] text-#1E7F4E">Mark all as read</span>
            </el-button>
          </div>
          <el-divider class="!my-2"></el-divider>
          <div class="notification-list">
            <div
              v-for="item in notifications"
              :key="item.id"
              class="notification-item"
              :class="{ 'cursor-pointer': item.type === 'tt' }"
              @click="item.type === 'tt' ? onTTClick(item) : undefined"
            >
              <div class="notification-icon" :style="{ background: item.bg }">
                <el-icon :size="20">
                  <component :is="item.icon" />
                </el-icon>
              </div>
              <div class="notification-content">
                <div class="notification-title">{{ item.title }}</div>
                <div class="notification-time">{{ item.time }}</div>
              </div>
              <span v-if="item.unread" class="notification-dot"></span>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="15">
        <div class="bg-white rounded-xl action-table overflow-auto p-1">
          <div class="flex items-center justify-between p-2">
            <div class="text-lg font-bold text-#000 text-16px">
              Action Required
            </div>
            <el-button type="default" plain class="!rounded-2 !px-4 !py-1.5">
              <Icon
                icon="hugeicons:share-05"
                width="24"
                height="24"
                style="color: #16215b"
              />
              <span class="text-[14px] text-#16215B">View All Pending</span>
            </el-button>
          </div>
          <el-divider class="!my-2"></el-divider>
          <el-table :data="recentOrders" height="100%" :show-header="false">
            <el-table-column prop="order" min-width="100">
              <template #default="{ row }">
                <div class="flex items-center gap-3">
                  <img
                    :src="row.image"
                    class="w-10 h-10 rounded-lg object-cover border border-gray-200"
                  />
                  <div class="flex flex-col">
                    <span class="text-sm font-semibold text-gray-900">{{
                      row.title
                    }}</span>
                    <span class="text-xs text-gray-400">{{ row.code }}</span>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="action" width="auto">
              <template #default="{ row }">
                <span class="text-sm text-gray-700">{{ row.action }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" width="130">
              <template #default="{ row }">
                <div class="flex flex-col gap-1">
                  <el-tag
                    :type="getStatusType(row.status)"
                    size="small"
                    effect="plain"
                    class="rounded-full px-3 w-fit"
                  >
                    {{ row.status }}
                  </el-tag>
                  <span class="text-xs text-gray-400">{{
                    row.statusNote
                  }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column width="180">
              <template #default>
                <div class="flex justify-end gap-2">
                  <el-button size="small" plain class="!rounded-full !px-3">
                    <el-icon class="mr-1"><CircleCheck /></el-icon>
                    Review & Fix
                  </el-button>
                  <el-button size="small" circle class="!rounded-full">
                    <el-icon><View /></el-icon>
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, markRaw, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useRequest } from "alova/client";
import CategoryChart from "@/components/dashboard/CategoryChart.vue";
import EditPopover from "./components/editPopover.vue";
import {
  getDashboardStats,
  getActionRequiredSalesOrders,
  getUnreadTroubleTickets,
  markTroubleTicketViewed,
  markAllTroubleTicketsViewed,
  type HomeStats,
} from "@/api/dashboard";
import { useAuthStore } from "@/store/modules/auth";
import {
  Plus,
  Edit,
  Message,
  CircleCheck,
  View,
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import productImage from "../icon/yf.png";
import { Icon } from "@/components/base/Icon";

const authStore = useAuthStore();
const welcomeName = computed(() => authStore.displayName);
const price = ref("$2,400");
const dashboardLoading = ref(true);
const stats = ref<HomeStats | null>(null);
const editVisible = ref(false);
const router = useRouter();

const handleRecharge = () => {
  router.push("/billing/recharge");
};

const { send: sendStats } = useRequest(
  (company?: string) => getDashboardStats(company),
  { immediate: false }
);
const { send: sendMarkAllTTRead } = useRequest(
  (company?: string) => markAllTroubleTicketsViewed(company),
  { immediate: false }
);
const { send: sendActionRequired } = useRequest(
  (company: string) => getActionRequiredSalesOrders(company, 10),
  { immediate: false }
);
const dataVisibility = reactive({
  totalInventory: true,
  totalStorage: true,
  inventoryValue: true,
  orderSummary: true,
  totalRevenue: true,
  creditRemaining: true,
  reservedCredits: true,
  totalSavings: true,
});

const editItems = computed(() => [
  {
    key: "totalInventory",
    label: "Total Inventory",
    visible: dataVisibility.totalInventory,
  },
  {
    key: "totalStorage",
    label: "Total Storage",
    visible: dataVisibility.totalStorage,
  },
  {
    key: "inventoryValue",
    label: "Inventory Value",
    visible: dataVisibility.inventoryValue,
  },
  {
    key: "orderSummary",
    label: "Order Summary",
    visible: dataVisibility.orderSummary,
  },
  {
    key: "totalRevenue",
    label: "Total Revenue",
    visible: dataVisibility.totalRevenue,
  },
  {
    key: "creditRemaining",
    label: "Credit Remaining",
    visible: dataVisibility.creditRemaining,
  },
  {
    key: "reservedCredits",
    label: "Reserved Credits",
    visible: dataVisibility.reservedCredits,
  },
  {
    key: "totalSavings",
    label: "Total Savings",
    visible: dataVisibility.totalSavings,
  },
  { key: "hideData", label: "Hide Data", visible: false },
]);

const toggleItem = (key: string) => {
  if (key in dataVisibility) {
    const typedKey = key as keyof typeof dataVisibility;
    dataVisibility[typedKey] = !dataVisibility[typedKey];
  }
};

const hideAll = () => {
  Object.keys(dataVisibility).forEach((key) => {
    const typedKey = key as keyof typeof dataVisibility;
    dataVisibility[typedKey] = false;
  });
};

const markReadLoading = ref(false);

/** 从 get_home_stats 推导的订单汇总，供 CategoryChart 使用 */
const orderStatsForChart = computed(() => {
  const s = stats.value;
  if (!s) return null;
  const pending = s.orders_action_required ?? 0;
  const inProcess = s.orders_in_progress ?? 0;
  const delivered = s.orders_delivered ?? 0;
  const total = pending + inProcess + delivered || 1;
  return {
    pending,
    inProcess,
    delivered,
    percentPending: total ? Math.round((pending / total) * 100) : 0,
    percentInProcess: total ? Math.round((inProcess / total) * 100) : 0,
    percentDelivered: total ? Math.round((delivered / total) * 100) : 0,
  };
});

const progressItems = ref([
  { label: "Available", value: 2400, total: 4250, percent: 88, color: "#0211A3" },
  { label: "Reserved", value: 1850, total: 4250, percent: 38, color: "#FF7214" },
]);

const notifications = ref<Array<{ id: string; type?: 'tt'; title: string; time: string; icon: any; bg: string; unread: boolean; ttName?: string }>>([]);

const recentOrders = ref([
  {
    title: "Order X012345",
    code: "LGF20241212",
    action: "Review & Fix",
    status: "Awaiting Approval",
    statusNote: "",
    image: productImage,
  },
  {
    title: "Order X012345",
    code: "LGF20241212",
    action: "Review & Fix",
    status: "Need Attention",
    statusNote: "Address Error",
    image: productImage,
  },
  {
    title: "Order X012345",
    code: "LGF20241212",
    action: "Review & Fix",
    status: "Need Attention",
    statusNote: "Out of Stock",
    image: productImage,
  },
  {
    title: "Order X012345",
    code: "LGF20241212",
    action: "Review & Fix",
    status: "Need Attention",
    statusNote: "Info Missing",
    image: productImage,
  },
  {
    title: "Order X012345",
    code: "LGF20241212",
    action: "Review & Fix",
    status: "Need Attention",
    statusNote: "Issue Detected",
    image: productImage,
  },
  {
    title: "Order X012345",
    code: "LGF20241212",
    action: "Export Processing",
    status: "Need Attention",
    statusNote: "Wrong Declaration",
    image: productImage,
  },
]);

const getStatusType = (status: string) => {
  switch (status) {
    case "Awaiting Approval":
      return "warning";
    case "Need Attention":
      return "danger";
    default:
      return "info";
  }
};

async function loadDashboard() {
  dashboardLoading.value = true;
  try {
    const authStore = useAuthStore();
    if (!authStore.user?.name) {
      await authStore.fetchUserInfo();
    }
    let company = await authStore.ensureCompany();

    const [statsRes, ttListRes] = await Promise.allSettled([
      sendStats(company),
      company ? getUnreadTroubleTickets(company, 20) : Promise.resolve([]),
    ]);
    const statsDataRaw = statsRes.status === "fulfilled" ? statsRes.value : null;
    const statsData = (statsDataRaw != null && (statsDataRaw as any)?.message != null)
      ? (statsDataRaw as any).message
      : statsDataRaw;
    let ttList: any[] = [];
    if (ttListRes.status === "fulfilled" && ttListRes.value != null) {
      const raw = ttListRes.value;
      ttList = Array.isArray(raw) ? raw : (Array.isArray((raw as any)?.message) ? (raw as any).message : []);
    }

    const statsCompany = (statsData as any)?.company;
    if (statsCompany && !company) {
      company = statsCompany;
      authStore.setCompanyFromStats(statsCompany);
      ttList = await getUnreadTroubleTickets(company, 20);
    }

    if (statsData && typeof statsData === "object") {
      stats.value = statsData as HomeStats;
      const bal = Number((statsData as HomeStats).balance ?? 0);
      const reserved = Number((statsData as HomeStats).reserved_logistics_today ?? 0);
      const total = bal + reserved;
      const fmtMoney = (n: number) => Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      price.value = `$${fmtMoney(bal)}`;
      const totalForPct = total || 1;
      // Available 单数：后端 (balance − reserved) / avg_logistics_fee_usd
      const estOrders = Number((statsData as any)?.estimated_orders_affordable ?? 0);
      progressItems.value = [
        { label: "Available", value: Number.isFinite(estOrders) ? String(Math.trunc(estOrders)) : "0", total: totalForPct, percent: total ? Math.round((bal / totalForPct) * 100) : 0, color: "#0211A3" },
        { label: "Reserved", value: `$${fmtMoney(reserved)}`, total: totalForPct, percent: total ? Math.round((reserved / totalForPct) * 100) : 0, color: "#FF7214" },
      ];
    }

    const ttItems = ttList.map((tt: any) => ({
      id: `tt-${tt.name}`,
      type: "tt" as const,
      ttName: tt.name,
      title: (tt.subject || tt.subject_en || "").trim() || `Ticket ${tt.name}`,
      time: tt.created_at ? formatTimeAgo(tt.created_at) : "",
      icon: markRaw(Message),
      bg: "#EEF2FF",
      unread: true,
    }));
    notifications.value = [...ttItems];
    const companyForOrders = company || ((statsData as HomeStats)?.company ?? "");
    if (companyForOrders) {
      const ordersResRaw = await sendActionRequired(companyForOrders);
      const ordersPayload = (ordersResRaw as any)?.message ?? ordersResRaw;
      const ordersData = Array.isArray(ordersPayload?.data) ? ordersPayload.data : [];
      recentOrders.value = (ordersData as any[]).map((o: any) => ({
        title: o.name || "",
        code: o.name || "",
        action: "Review & Fix",
        status: o.status || "Need Attention",
        statusNote: (o.subject || "").trim() || "",
        image: productImage,
      }));
    } else {
      recentOrders.value = [];
    }
  } catch (_) {
    recentOrders.value = [];
  } finally {
    dashboardLoading.value = false;
  }
}

function formatTimeAgo(creation: string) {
  try {
    const d = new Date(creation);
    const diff = (Date.now() - d.getTime()) / 3600000;
    if (diff < 1) return "Just now";
    if (diff < 24) return `${Math.floor(diff)} hours ago`;
    return `${Math.floor(diff / 24)} days ago`;
  } catch {
    return "";
  }
}

async function onTTClick(item: { ttName: string; unread?: boolean }) {
  if (!item?.ttName) return;
  const company = useAuthStore().company ?? stats.value?.company ?? "";
  if (!company) {
    ElMessage.error("Company not resolved");
    return;
  }
  try {
    const res = await markTroubleTicketViewed(item.ttName, company);
    if (res?.ok) {
      await loadDashboard();
    } else {
      ElMessage.error(res?.message || "Failed to mark as viewed");
    }
  } catch {
    ElMessage.error("Failed to mark as viewed");
  }
}

async function onMarkAllRead() {
  markReadLoading.value = true;
  try {
    const company = useAuthStore().company ?? stats.value?.company ?? "";
    if (company) {
      await sendMarkAllTTRead(company);
    }
    ElMessage.success("Marked all as read");
    await loadDashboard();
  } catch {
    ElMessage.error("Failed to mark as read");
  } finally {
    markReadLoading.value = false;
  }
}

onMounted(() => {
  loadDashboard();
});
</script>

<style scoped>
.shadow-card {
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
}

.card {
  box-shadow: 0px 1px 3px 0px #0000000f;
}

.notifications-card {
  /* width: 100%; */
}

.notification-list {
  display: grid;
  gap: 4px;
}

.notification-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  border-radius: 12px;
  background: #ffffff;
}

.notification-icon {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  color: #1f3aa9;
  border: 1px solid #16215b1a;
  border-radius: 6px;
}

.notification-content {
  flex: 1;
  display: grid;
  gap: 4px;
}

.notification-title {
  font-size: 16px;
  font-weight: 600;
  color: #16215b;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.notification-time {
  font-size: 14px;
  color: #9a9a9a;
}

.notification-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #16a34a;
}

.action-table :deep(.el-table__inner-wrapper) {
  border-radius: 16px;
  border: 1px solid #eef2ff;
}

.action-table :deep(.el-table__row) {
  height: 64px;
}

.action-table :deep(.el-table__cell) {
  border-bottom: 1px solid #f1f5f9;
}

.action-table :deep(.el-table__body tr:last-child .el-table__cell) {
  border-bottom: 0;
}
</style>
