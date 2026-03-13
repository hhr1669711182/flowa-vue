<template>
  <div class="p-6 space-y-6">
    <!-- Header Text -->
    <div>
      <h2 class="text-2xl font-bold text-gray-800">Billing/Outbound</h2>
      <p class="text-gray-500 mt-1">
        Track your performance, savings, credits, and forecasted orders — all in one place.
      </p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div v-for="(stat, index) in statsCards" :key="index" class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-32">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm text-gray-500 font-medium">{{ stat.label }}</p>
            <h3 class="text-2xl font-bold text-gray-900 mt-2">{{ stat.value }}</h3>
          </div>
          <div :class="`p-2 rounded-lg ${stat.bgClass}`">
            <component :is="stat.icon" class="w-5 h-5" :class="stat.textClass" />
          </div>
        </div>
        <!-- Simple trend indicator -->
        <div class="flex items-center text-xs font-medium" :class="stat.trend >= 0 ? 'text-green-600' : 'text-red-600'">
          <el-icon class="mr-1"><Top v-if="stat.trend >= 0" /><Bottom v-else /></el-icon>
          <span>{{ Math.abs(stat.trend) }}% from last month</span>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <!-- Toolbar -->
      <div class="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div class="flex items-center gap-3 w-full sm:w-auto">
          <!-- Search -->
          <el-input
            v-model="searchQuery"
            placeholder="Search Order ID..."
            :prefix-icon="Search"
            class="w-64"
            clearable
            @input="handleSearch"
          />
          
          <!-- Filters -->
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="-"
            start-placeholder="Start date"
            end-placeholder="End date"
            class="!w-64"
            @change="fetchData"
          />
          
          <el-select v-model="statusFilter" placeholder="Status" clearable class="!w-32" @change="fetchData">
            <el-option label="Paid" value="Paid" />
            <el-option label="Pending" value="Pending" />
            <el-option label="Overdue" value="Overdue" />
            <el-option label="Failed" value="Failed" />
          </el-select>
        </div>

        <!-- Action Button -->
        <el-button type="primary" plain class="!border-gray-200 !text-gray-700 hover:!bg-gray-50 hover:!text-primary" @click="handleDownload">
          <template #icon>
            <el-icon><Download /></el-icon>
          </template>
          Download Table
        </el-button>
      </div>

      <!-- Table -->
      <el-table 
        v-loading="loading" 
        :data="data?.list || []" 
        style="width: 100%"
        :header-cell-style="{ background: '#F9FAFB', color: '#374151', fontWeight: '600' }"
      >
        <el-table-column label="Order ID" min-width="140">
          <template #default="{ row }">
            <div class="font-medium text-gray-900">{{ row.orderId }}</div>
            <div class="text-xs text-gray-400">{{ row.platformId }}</div>
          </template>
        </el-table-column>
        
        <el-table-column prop="fulfilledDate" label="Fulfilled Date" min-width="120" />
        
        <el-table-column label="Picking" min-width="100" align="right">
          <template #default="{ row }">
            ${{ row.picking.toFixed(2) }}
          </template>
        </el-table-column>
        
        <el-table-column label="Packaging" min-width="100" align="right">
          <template #default="{ row }">
            ${{ row.packaging.toFixed(2) }}
          </template>
        </el-table-column>
        
        <el-table-column label="Shipping" min-width="100" align="right">
          <template #default="{ row }">
            ${{ row.shipping.toFixed(2) }}
          </template>
        </el-table-column>
        
        <el-table-column label="TAX" min-width="80" align="right">
          <template #default="{ row }">
            ${{ row.tax.toFixed(2) }}
          </template>
        </el-table-column>
        
        <el-table-column label="Total" min-width="100" align="right">
          <template #default="{ row }">
            <span class="font-bold text-gray-900">${{ row.total.toFixed(2) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Actions" width="100" fixed="right" align="center">
          <template #default>
            <el-button link type="primary" size="small">Details</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="flex justify-end mt-6">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="data?.total || 0"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRequest } from 'alova/client';
import { getOutboundBillingList, getOutboundStats } from '@/api/billing';
import { 
  Search, 
  Download, 
  Money, 
  ShoppingCart, 
  TrendCharts,
  Top,
  Bottom
} from '@element-plus/icons-vue';

// State
const currentPage = ref(1);
const pageSize = ref(10);
const statusFilter = ref('');
const searchQuery = ref('');
const dateRange = ref([]);

// API Request
const { loading, data, send: fetchData } = useRequest(
  () => getOutboundBillingList({
    page: currentPage.value,
    pageSize: pageSize.value,
    status: statusFilter.value,
    search: searchQuery.value,
    // dateRange: dateRange.value // Adapt based on backend support
  }),
  {
    immediate: true,
    initialData: { list: [], total: 0 }
  }
);

const { data: statsData } = useRequest(getOutboundStats, { immediate: true });

// Computed Stats
const statsCards = computed(() => [
  {
    label: 'Total Revenue',
    value: `$${statsData.value?.totalRevenue?.toLocaleString() || '0.00'}`,
    icon: Money,
    bgClass: 'bg-blue-50',
    textClass: 'text-blue-600',
    trend: 12.5
  },
  {
    label: 'Total Orders',
    value: statsData.value?.totalOrders?.toLocaleString() || '0',
    icon: ShoppingCart,
    bgClass: 'bg-purple-50',
    textClass: 'text-purple-600',
    trend: 8.2
  },
  {
    label: 'Avg. Order Value',
    value: `$${statsData.value?.avgOrderValue?.toLocaleString() || '0.00'}`,
    icon: TrendCharts,
    bgClass: 'bg-green-50',
    textClass: 'text-green-600',
    trend: -2.4
  }
]);

// Handlers
let searchTimer: any = null;
const handleSearch = () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    currentPage.value = 1;
    fetchData();
  }, 300);
};

const handleDownload = () => {
  console.log('Download table');
};
</script>

<style scoped>
:deep(.el-table__inner-wrapper::before) {
  display: none;
}
</style>
