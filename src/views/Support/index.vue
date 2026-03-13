<template>
  <div class="h-full flex flex-col overflow-hidden">
    <div class="flex justify-between items-start mb-6">
      <div>
        <span class="text-2xl font-bold text-gray-900">Support Center</span>
        <p class="text-gray-500 mt-1 text-sm">
          Connect directly with the Flowa Support Team. Create tickets and manage inquiries related to your operations.
        </p>
      </div>
      <el-button
        size="large"
        type="primary"
        class="!bg-[#16215B] !border-none !rounded-lg"
        :icon="Plus"
        @click="createVisible = true"
        >Create Ticket</el-button
      >
    </div>

    <SupportFilter @search="handleFilterChange" />

    <div class="flex gap-3 mb-4">
      <el-tag
        :effect="activePriority === 'High' ? 'light' : 'plain'"
        class="!rounded-full !px-4 !py-1.5 cursor-pointer !border-solid"
        :class="activePriority === 'High' ? '!bg-red-50 !text-red-600 !border-red-100' : '!bg-white !text-gray-600 !border-gray-200'"
        @click="setPriority('High')"
      >
        High Priority ({{ stats.High.toString().padStart(2, "0") }})
      </el-tag>
      <el-tag
        :effect="activePriority === 'Medium' ? 'light' : 'plain'"
        class="!rounded-full !px-4 !py-1.5 cursor-pointer !border-solid"
        :class="activePriority === 'Medium' ? '!bg-orange-50 !text-orange-600 !border-orange-100' : '!bg-white !text-gray-600 !border-gray-200'"
        @click="setPriority('Medium')"
      >
        Medium Priority ({{ stats.Medium.toString().padStart(2, "0") }})
      </el-tag>
      <el-tag
        :effect="activePriority === 'Low' ? 'light' : 'plain'"
        class="!rounded-full !px-4 !py-1.5 cursor-pointer !border-solid"
        :class="activePriority === 'Low' ? '!bg-blue-50 !text-blue-600 !border-blue-100' : '!bg-white !text-gray-600 !border-gray-200'"
        @click="setPriority('Low')"
      >
        Low Priority ({{ stats.Low.toString().padStart(2, "0") }})
      </el-tag>
    </div>

    <div
      class="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
    >
      <BaseTable
        :data="tickets"
        :columns="columns"
        :loading="loading"
        :pagination="true"
        :total="total"
        v-model:page="pagination.page"
        v-model:limit="pagination.pageSize"
        @pagination-change="fetchTickets"
      >
        <template #ticketId="{ row }">
          <div class="flex items-center gap-2 font-medium text-gray-900">
            <div class="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
            {{ row.ticketId }}
          </div>
        </template>

        <template #status="{ row }">
          <el-tag
            :type="getStatusType(row.status)"
            effect="light"
            round
            size="small"
            class="!border-0 font-medium"
          >
            {{ row.status }}
          </el-tag>
        </template>

        <template #priority="{ row }">
          <el-tag
            :type="getPriorityType(row.priority)"
            effect="light"
            round
            size="small"
            class="!border-0 font-medium"
          >
            {{ row.priority }}
          </el-tag>
        </template>

        <template #date="{ row }">
          <div class="text-xs text-gray-500">
            <div>Create: {{ row.createDate }}</div>
            <div>Update: {{ row.updateDate }}</div>
          </div>
        </template>

        <template #actions="{ row }">
          <div class="flex items-center gap-2">
            <el-button
              plain
              size="small"
              class="!rounded-lg !w-8 !h-8 !p-0 !border-none bg-transparent hover:bg-gray-100"
              @click="handleView(row)"
            >
              <el-icon class="text-gray-400"><View /></el-icon>
            </el-button>

            <el-dropdown
              trigger="click"
              @command="(cmd: string) => handleRowCommand(cmd, row)"
              popper-class="support-actions-menu"
            >
              <el-button plain size="small" class="!rounded-lg !w-8 !h-8 !p-0 !border-none bg-transparent hover:bg-gray-100">
                <el-icon class="text-gray-400"><MoreFilled /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="view">
                    <div class="flex items-center gap-2">
                      <el-icon class="text-[#1e3a8a]"><View /></el-icon>
                      <span>View Ticket</span>
                    </div>
                  </el-dropdown-item>
                  <el-dropdown-item command="close">
                    <div class="flex items-center gap-2">
                      <el-icon class="text-red-500"
                        ><CircleCloseFilled
                      /></el-icon>
                      <span class="text-red-600">Close Ticket</span>
                    </div>
                  </el-dropdown-item>
                  <el-dropdown-item command="open">
                    <div class="flex items-center gap-2">
                      <el-icon class="text-green-600"
                        ><CircleCheckFilled
                      /></el-icon>
                      <span class="text-green-700">Open Ticket</span>
                    </div>
                  </el-dropdown-item>
                  <el-dropdown-item command="delete">
                    <div class="flex items-center gap-2">
                      <el-icon class="text-red-500"><Delete /></el-icon>
                      <span class="text-red-600">Delete</span>
                    </div>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </template>
      </BaseTable>
    </div>

    <TicketDetail v-model="detailVisible" :ticket="selectedTicket" />

    <TicketCreate
      v-model:visible="createVisible"
      @success="() => { pagination.page = 1; fetchTickets(); }"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import {
  Plus,
  Clock,
  View,
  MoreFilled,
  CircleCloseFilled,
  CircleCheckFilled,
  Delete,
} from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import SupportFilter from "./components/SupportFilter.vue";
import TicketDetail from "./components/TicketDetail.vue";
import TicketCreate from "./components/TicketCreate.vue";
import {
  deleteTicket,
  getTicketDetail,
  getTickets,
  updateTicketStatus,
  type Ticket,
  type TicketPriority,
  type TicketStatus,
  type TicketsStats,
} from "@/api/support";

const tickets = ref<Ticket[]>([]);
const loading = ref(false);
const total = ref(0);
const stats = reactive<TicketsStats>({ High: 0, Medium: 0, Low: 0 });
const activePriority = ref<TicketPriority>("High");

const pagination = reactive({
  page: 1,
  pageSize: 10,
});

const currentFilters = reactive({
  search: "",
  quickRange: "last7" as "last7" | "last30" | "",
  dateRange: null as [string, string] | null,
  stage: "",
  type: "",
  status: "" as TicketStatus | "",
});

const detailVisible = ref(false);
const selectedTicket = ref<Ticket | null>(null);

const createVisible = ref(false);
const createForm = reactive({
  stage: "Order",
  stageDetail: "Order ID X12345",
  type: "General Issue",
  priority: "High" as TicketPriority,
});

const columns = [
  { type: 'selection', width: 55 },
  { label: 'Ticket ID', slot: 'ticketId', width: 180 },
  { label: 'Type of enquire', prop: 'type', width: 150 },
  { label: 'Type ID', prop: 'stageDetail', width: 180 },
  { label: 'Status', slot: 'status', width: 120 },
  { label: 'Priority', slot: 'priority', width: 120 },
  { label: 'Date', slot: 'date', width: 200 },
  { label: 'Actions', slot: 'actions', width: 100, fixed: 'right' }
];

const fetchTickets = async () => {
  loading.value = true;
  try {
    const res = await getTickets({
      ...currentFilters,
      priority: activePriority.value,
      page: pagination.page,
      pageSize: pagination.pageSize,
    });
    tickets.value = res.list;
    total.value = res.total;
    stats.High = res.stats.High;
    stats.Medium = res.stats.Medium;
    stats.Low = res.stats.Low;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchTickets();
});

const handleFilterChange = (filters: any) => {
  currentFilters.search = filters.search || "";
  currentFilters.quickRange = (filters.quickDate === "7" ? "last7" : "") as any;
  currentFilters.dateRange = filters.dateRange || null;
  currentFilters.type = filters.type || "";
  currentFilters.status = (filters.status || "") as TicketStatus | "";
  pagination.page = 1;
  fetchTickets();
};

const setPriority = (p: TicketPriority) => {
  activePriority.value = p;
  pagination.page = 1;
  fetchTickets();
};

const handleView = async (row: Ticket) => {
  const detail = await getTicketDetail(row.id);
  selectedTicket.value = detail || row;
  detailVisible.value = true;
};

const handleRowCommand = async (cmd: string, row: Ticket) => {
  if (cmd === "view") {
    await handleView(row);
    return;
  }

  if (cmd === "close") {
    await updateTicketStatus(row.id, "Closed");
    ElMessage.success("Ticket closed");
    fetchTickets();
    return;
  }

  if (cmd === "open") {
    await updateTicketStatus(row.id, "Open");
    ElMessage.success("Ticket opened");
    fetchTickets();
    return;
  }

  if (cmd === "delete") {
    try {
      await ElMessageBox.confirm("Delete this ticket?", "Confirm", {
        type: "warning",
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
      });
    } catch {
      return;
    }
    await deleteTicket(row.id);
    ElMessage.success("Deleted");
    fetchTickets();
  }
};

const getStatusType = (status: string) => {
  switch (status) {
    case "Open":
      return "primary";
    case "Investigating":
      return "warning";
    case "Info. Required":
      return "danger";
    case "Awaiting Support":
      return "warning";
    case "Resolved":
      return "success";
    case "Closed":
      return "info";
    default:
      return "info";
  }
};

const getPriorityType = (priority: string) => {
  switch (priority) {
    case "High":
      return "danger";
    case "Medium":
      return "warning";
    case "Low":
      return "primary";
    default:
      return "info";
  }
};
</script>

<style scoped>
:global(.support-actions-menu) {
  border-radius: 12px;
  padding: 8px;
}

:global(.support-actions-menu .el-dropdown-menu__item) {
  border-radius: 10px;
  padding: 10px 12px;
  line-height: 20px;
}

:global(.support-actions-menu .el-dropdown-menu__item:hover) {
  background-color: #f3f4f6;
}
</style>
