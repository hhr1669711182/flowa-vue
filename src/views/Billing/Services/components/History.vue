<template>
  <div class="h-full flex flex-col">
    <div class="flex justify-between items-center mb-4 flex-shrink-0">
      <div>
        <div class="flex items-center gap-1 line-height-22px">
          <div class="font-bold text-#111 text-28px line-height-36px">
            Billing
          </div>
          <div class="text-#6B7280 text-20px pt-1">/ Transaction History</div>
        </div>
        <div class="text-14px text-#6B7280 mt-1">
          View a complete log of all credit and debit transactions with full
          operational transparency.
        </div>
      </div>
      <div class="flex items-center gap-3">
        <el-button @click="$emit('close')" class="w-11 !h-11 !p-0" size="large" type="default">
          <!-- <Icon icon="svg-icon:xmark" color="#16215B" size="22px" /> -->
          <Icon icon="formkit:close" :size="5.5"  style="color: #16215B" />
        </el-button>
      </div>
    </div>

    <div class="flex items-center gap-3 mb-4">
      <div class="w-64">
        <el-input
          v-model="search"
          placeholder="Search"
          prefix-icon="Search"
          class="!rounded-lg"
          @input="handleSearch"
        >
          <template #prefix>
            <Icon icon="svg-icon:search" class="text-gray-400" />
          </template>
        </el-input>
      </div>

      <el-popover placement="bottom" :width="300" trigger="click">
        <template #reference>
          <el-button
            class="!rounded-full !bg-[#F3F4F6] !border-none !text-[#111] !px-4"
          >
            Last 7 days <span class="mx-2 text-gray-300">|</span> 15 Mar - 21
            Mar
            <Icon icon="svg-icon:calendar" class="ml-2 text-gray-500" />
          </el-button>
        </template>
        <div class="p-2">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            value-format="YYYY-MM-DD"
            range-separator="To"
            start-placeholder="Start date"
            end-placeholder="End date"
            size="small"
            class="w-full"
            @change="handleFilterChange"
          />
        </div>
      </el-popover>

      <el-dropdown trigger="click" @command="handleTypeChange">
        <el-button
          class="!rounded-full !bg-[#F3F4F6] !border-none !text-[#111] !px-4"
        >
          {{ selectedType || "Type" }}
          <Icon icon="ep:arrow-down" class="ml-2 text-gray-500" />
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="">All</el-dropdown-item>
            <el-dropdown-item command="Credit">Credit</el-dropdown-item>
            <el-dropdown-item command="Debit">Debit</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- Table -->
    <div
      class="flex-1 min-h-0 rounded-xl overflow-hidden bg-white border border-gray-200 shadow-sm"
    >
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
        <template #transactionTime="{ row }">
          <div class="whitespace-pre-line text-gray-900">
            {{ row.transactionTime }}
          </div>
        </template>

        <template #type="{ row }">
          <span
            :class="row.type === 'Credit' ? 'text-green-600' : 'text-red-600'"
            >{{ row.type }}</span
          >
        </template>

        <template #description="{ row }">
          <div class="truncate text-gray-500" :title="row.description">
            {{ row.description }}
          </div>
        </template>

        <template #amount="{ row }">
          <span class="text-gray-900">{{ row.amount }}</span>
        </template>

        <template #currentBalance="{ row }">
          <span class="text-gray-900">{{ row.currentBalance }}</span>
        </template>
      </BaseTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from "vue";
import { getBillingTransactions } from "@/api/billing/outbound";
import BaseTable from "@/components/common/BaseTable.vue";

defineEmits(["close"]);

const search = ref("");
const dateRange = ref([]);
const selectedType = ref("");
const tableData = ref<any[]>([]);
const loading = ref(false);
const total = ref(0);
const page = ref(1);
const limit = ref(10);

const columns = [
  { label: "ID", prop: "id", width: 80 },
  { label: "TRANSACTION TIME", slot: "transactionTime", width: 180 },
  { label: "TYPE", slot: "type", width: 120 },
  { label: "DESCRIPTION", slot: "description", minWidth: 300 },
  { label: "AMOUNT", slot: "amount", width: 150 },
  { label: "CURRENT BALANCE", slot: "currentBalance", width: 180 },
];

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await getBillingTransactions({
      company: "UU",
      page: page.value,
      pageSize: limit.value,
      search: search.value,
      type: selectedType.value,
    }).send();
    tableData.value = res.list;
    total.value = res.total;
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  page.value = 1;
  fetchData();
};

const handleFilterChange = () => {
  page.value = 1;
  fetchData();
};

const handleTypeChange = (command: string) => {
  selectedType.value = command;
  page.value = 1;
  fetchData();
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
:deep(.el-input__wrapper) {
  background-color: #fff;
  box-shadow: 0 0 0 1px #e5e7eb inset;
}
</style>
