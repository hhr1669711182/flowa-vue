<template>
  <div class="dashboard flex flex-col gap-6">
    <!-- Header Section -->
    <div class="mb-2 flex flex-col gap-2">
      <div class="flex justify-between w-full items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-800 tracking-tight">
            Welcome Evan
          </h1>
          <p class="text-gray-500 mt-1 text-sm">
            View and manage all your individual products and their stock status.
          </p>
        </div>
        <el-button class="!rounded-lg text-[#16215B]" :icon="Plus"
          >Create Order</el-button
        >
      </div>

      <div class="flex justify-end space-x-3">
        <el-link type="primary" class="!rounded-lg text-[#16215B]">
          <el-icon class="mr-2"><Edit /></el-icon>
          Edit Data
        </el-link>
      </div>
    </div>

    <!-- <el-row :gutter="16">
      <el-col :xs="24" :sm="12" :lg="7">
        <img
          class="h-full w-full object-contain"
          src="./icon/zhu.png"
          alt="Statistics"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :lg="16">
        <img
          class="h-full w-full object-contain"
          src="./icon/echart.png"
          alt="Charts"
        />
      </el-col>
    </el-row> -->

    <el-row :gutter="16">
      <el-col :xs="24" :lg="16" class="mb-6 lg:mb-0">
        <div
          class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96 animate__animated animate__fadeInUp flex flex-col"
          style="animation-delay: 0.4s"
        >
          <div class="flex justify-between items-center mb-6">
            <div>
              <h3 class="text-lg font-bold text-gray-800">Sales Trend</h3>
              <p class="text-xs text-gray-400 mt-0.5">
                Overview of your sales performance
              </p>
            </div>
            <!-- <el-select v-model="timeRange" size="small" class="w-32">
              <el-option label="Weekly" value="week" />
              <el-option label="Monthly" value="month" />
              <el-option label="Yearly" value="year" />
            </el-select> -->
          </div>
          <div class="flex-1 w-full min-h-0">
            <SalesChart />
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :lg="8">
        <div
          class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96 animate__animated animate__fadeInUp flex flex-col"
          style="animation-delay: 0.5s"
        >
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-bold text-gray-800">Top Categories</h3>
            <el-button link size="small">View All</el-button>
          </div>
          <div class="flex-1 w-full min-h-0">
            <CategoryChart />
          </div>
        </div>
      </el-col>
    </el-row>
    <el-row
      :gutter="16"
      class="rounded-xl shadow-sm border border-gray-100 overflow-hidden animate__animated animate__fadeInUp"
      style="animation-delay: 0.6s"
    >
      <el-col :xs="24" :sm="12" :lg="6">
        <div
          class="h-full rounded-xl bg-white p-6 border-b border-gray-50 flex justify-between items-center"
        >
          <h3 class="text-lg font-bold text-gray-800">Recent Orders</h3>
          <el-button type="primary" link>View All Orders</el-button>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="18">
        <el-table
          :data="recentOrders"
          class="bg-white rounded-xl"
          style="width: 100%"
          :header-cell-style="{ background: '#f9fafb' }"
        >
          <el-table-column prop="id" label="Order ID" width="140">
            <template #default="{ row }">
              <span class="font-medium text-gray-700">{{ row.id }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="product" label="Product" min-width="180">
            <template #default="{ row }">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400"
                >
                  <el-icon><Picture /></el-icon>
                </div>
                <span class="text-gray-700">{{ row.product }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="customer" label="Customer" width="150" />

          <el-table-column prop="date" label="Date" width="120" />

          <el-table-column prop="amount" label="Total" width="120">
            <template #default="{ row }">¥{{ row.amount }}</template>
          </el-table-column>

          <el-table-column prop="status" label="Status" width="120">
            <template #default="{ row }">
              <el-tag
                :type="getStatusType(row.status)"
                size="small"
                effect="light"
                class="rounded-full px-3"
              >
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Plus, Edit, Picture } from "@element-plus/icons-vue";
import SalesChart from "../components/dashboard/SalesChart.vue";
import CategoryChart from "../components/dashboard/CategoryChart.vue";

const recentOrders = ref([
  {
    id: "#ORD-7782",
    product: "Wireless Headphones Pro",
    customer: "Evan Doe",
    date: "Feb 10, 2026",
    amount: "1,299",
    status: "Completed",
  },
  {
    id: "#ORD-7781",
    product: "Ergonomic Office Chair",
    customer: "Sarah Smith",
    date: "Feb 09, 2026",
    amount: "899",
    status: "Processing",
  },
  {
    id: "#ORD-7780",
    product: "Smart Fitness Watch",
    customer: "Mike Johnson",
    date: "Feb 09, 2026",
    amount: "599",
    status: "Pending",
  },
  {
    id: "#ORD-7779",
    product: "Organic Cotton T-Shirt",
    customer: "Lisa Wang",
    date: "Feb 08, 2026",
    amount: "129",
    status: "Cancelled",
  },
]);

const getStatusType = (status: string) => {
  switch (status) {
    case "Completed":
      return "success";
    case "Processing":
      return "primary";
    case "Pending":
      return "warning";
    case "Cancelled":
      return "danger";
    default:
      return "info";
  }
};
</script>

<style scoped>
.shadow-card {
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
}
</style>
