<template>
  <div class="dashboard flex flex-col gap-4">
    <div class="mb-2 flex flex-col gap-2">
      <div class="flex justify-between w-full h-17 items-center">
        <div>
          <h1 class="text-2xl font-700 font-bold text-gray-800 tracking-tight">
            Welcome Evan
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
            class="card bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-59.5 animate__animated animate__fadeInUp flex flex-col flex-justify-around"
            style="animation-delay: 0.4s"
          >
            <div class="flex justify-between items-center mb-6">
              <div>
                <div class="text-lg font-bold text-#000">Reserved Credits</div>
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
            <div class="w-full min-h-0">
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
        </el-col>

        <el-col :xs="24" :lg="16" v-if="dataVisibility.orderSummary">
          <div
            class="card bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-59.5 animate__animated animate__fadeInUp flex flex-col"
            style="animation-delay: 0.5s"
          >
            <div class="flex-1 w-full min-h-0">
              <CategoryChart />
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
            <el-button type="default" plain class="!rounded-2 !px-4 !py-1.5">
              <Icon
                icon="hugeicons:tick-double-01"
                width="24"
                height="24"
                style="color: #1e7f4e"
              />
              <span class="text-[14px] text-#1E7F4E" @click="markAllAsRead">Mark all as read</span>
            </el-button>
          </div>
          <el-divider class="!my-2"></el-divider>
          <div class="notification-list">
            <div
              v-for="item in notifications"
              :key="item.id"
              class="notification-item"
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
        <div class="bg-white rounded-xl action-table overflow-auto box-border">
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
              <span class="text-[14px] text-#16215B">View All</span>
            </el-button>
          </div>
          <el-divider class="!my-0"></el-divider>
          <BaseTable
            :data="recentOrders"
            :columns="recentOrderColumns"
            :pagination="false"
            height="calc(100vh - 585px)"
          >
            <template #order="{ row }">
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
            <template #stage="{ row }">
              <span class="text-sm text-gray-700">{{ row.action }}</span>
            </template>
            <template #status="{ row }">
              <div class="flex flex-col gap-1">
                <el-tag
                  :type="getStatusType(row.status)"
                  size="small"
                  class="rounded-full px-3 w-fit"
                >
                  {{ row.status }}
                </el-tag>
                <span class="text-xs text-gray-400">{{
                  row.statusNote
                }}</span>
              </div>
            </template>
            <template #actions="{ row }">
              <div class="flex items-center justify-end gap-2">
                <el-button size="small" plain class="!rounded-full !px-3" @click="handleReview(row)">
                  <el-icon class="mr-1"><CircleCheck /></el-icon>
                  Review & Fix
                </el-button>
                <el-button size="small" circle class="!rounded-full" @click="handleView(row)">
                  <el-icon><View /></el-icon>
                </el-button>
              </div>
            </template>
          </BaseTable>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, markRaw, onMounted } from "vue";
import CategoryChart from "@/components/dashboard/CategoryChart.vue";
import BaseTable from "@/components/common/BaseTable.vue";
import EditPopover from "./components/editPopover.vue";
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
import productImage from "../icon/yf.png";
import { getDashboardStats, getDashboardNotifications, getDashboardRecentOrders, markNotificationAsRead } from "@/api/dashboard";
import { ElMessage } from "element-plus";

const price = ref("$0");
const editVisible = ref(false);
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
const progressItems = ref<any[]>([]);

const notifications = ref<any[]>([]);

const recentOrders = ref<any[]>([]);

const recentOrderColumns = [
  { label: "Order ID", slot: "order", minWidth: 100 },
  { label: "Stages", slot: "stage", width: "auto" },
  { label: "Status", slot: "status", width: 150 },
  { label: "Actions", slot: "actions", width: 180, align: "center", fixed: "right" },
];

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

const loadData = async () => {
  try {
    const [statsRes, notifRes, ordersRes] = await Promise.all([
      getDashboardStats(),
      getDashboardNotifications(),
      getDashboardRecentOrders()
    ]);
    
    price.value = statsRes.price;
    progressItems.value = statsRes.progressItems;
    
    // Process notifications icons
    notifications.value = notifRes.map(n => ({
      ...n,
      icon: getIconComponent(n.iconType)
    }));
    
    // Process orders images
    recentOrders.value = ordersRes.map(o => ({
      ...o,
      image: o.image.includes('placeholder') ? productImage : o.image
    }));
  } catch (error) {
    console.error("Failed to load dashboard data:", error);
  }
};

const getIconComponent = (type: string) => {
  const map: Record<string, any> = {
    ShoppingCart,
    Box,
    CreditCard,
    Document,
    Message,
    Lock
  };
  return markRaw(map[type] || Message);
};

const markAllAsRead = async () => {
  try {
    await markNotificationAsRead();
    notifications.value.forEach(n => n.unread = false);
    ElMessage.success("All notifications marked as read");
  } catch (error) {
    ElMessage.error("Failed to update notifications");
  }
};

const handleReview = (row: any) => {
  ElMessage.info(`Reviewing order ${row.code}`);
};

const handleView = (row: any) => {
  ElMessage.info(`Viewing details for ${row.code}`);
};

onMounted(() => {
  loadData();
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
  /* border: 1px solid #eef2ff; */
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
