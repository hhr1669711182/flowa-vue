<template>
  <div class="h-full flex flex-col p-6 overflow-hidden">
    <div class="flex justify-between items-start mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Support Center</h1>
        <p class="text-gray-500 mt-1 text-sm">
          View open and resolved tickets, track their status, and chat directly
          with the Flowa Support Team.
        </p>
      </div>
      <el-button
        type="primary"
        class="!bg-[#1e3a8a] !border-none !rounded-lg"
        :icon="Plus"
        @click="createVisible = true"
        >Create Ticket</el-button
      >
    </div>

    <TableFilter :config="filterConfig" @change="handleFilterChange" />

    <div class="flex gap-3 mb-4">
      <el-check-tag
        :checked="activePriority === 'High'"
        class="!rounded-full !px-4 !py-1.5 !border !border-solid cursor-pointer"
        :class="
          activePriority === 'High'
            ? 'bg-red-50 text-red-600 border-red-100'
            : 'bg-white border-gray-200 text-gray-600'
        "
        @click="setPriority('High')"
      >
        High Priority ({{ stats.High.toString().padStart(2, "0") }})
      </el-check-tag>
      <el-check-tag
        :checked="activePriority === 'Medium'"
        class="!rounded-full !px-4 !py-1.5 !border !border-solid cursor-pointer"
        :class="
          activePriority === 'Medium'
            ? 'bg-orange-50 text-orange-600 border-orange-100'
            : 'bg-white border-gray-200 text-gray-600'
        "
        @click="setPriority('Medium')"
      >
        Medium Priority ({{ stats.Medium.toString().padStart(2, "0") }})
      </el-check-tag>
      <el-check-tag
        :checked="activePriority === 'Low'"
        class="!rounded-full !px-4 !py-1.5 !border !border-solid cursor-pointer"
        :class="
          activePriority === 'Low'
            ? 'bg-blue-50 text-blue-600 border-blue-100'
            : 'bg-white border-gray-200 text-gray-600'
        "
        @click="setPriority('Low')"
      >
        Low Priority ({{ stats.Low.toString().padStart(2, "0") }})
      </el-check-tag>
    </div>

    <div
      class="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
    >
      <el-table
        v-loading="loading"
        :data="tickets"
        class="support-table"
        style="width: 100%"
        height="100%"
        :header-cell-style="{
          background: '#f9fafb',
          color: '#111827',
          fontWeight: '600',
        }"
        row-key="id"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column type="expand" width="44">
          <template #default="{ row }">
            <div class="p-4 bg-gray-50/50">
              <el-card shadow="never" class="!rounded-xl !border-gray-100">
                <div class="flex items-start justify-between gap-6">
                  <div>
                    <div class="flex items-center gap-2">
                      <div class="text-base font-bold text-gray-900">
                        {{ row.ticketId }}
                      </div>
                      <el-tag
                        :type="getStatusType(row.status)"
                        effect="light"
                        round
                        size="small"
                        class="!border-0"
                      >
                        {{ row.status }}
                      </el-tag>
                    </div>
                    <div class="text-xs text-gray-500 mt-1">
                      {{ row.stage }}&nbsp;&nbsp;{{ row.stageDetail }}
                    </div>
                  </div>

                  <div class="text-right">
                    <div class="text-xs text-gray-400">Due Date</div>
                    <div
                      class="text-sm text-gray-700 mt-0.5 flex items-center justify-end gap-2"
                    >
                      <span>{{ row.dueDate }}</span>
                      <el-tag
                        v-if="row.dueTime"
                        :type="row.dueUrgent ? 'danger' : 'info'"
                        effect="light"
                        round
                        size="small"
                        class="!border-0"
                      >
                        <el-icon class="mr-1"><Clock /></el-icon>
                        {{ row.dueTime }}
                      </el-tag>
                    </div>
                    <div class="text-xs text-gray-500 mt-2">
                      <div>Create Date&nbsp;&nbsp;{{ row.createDate }}</div>
                      <div>Update Date&nbsp;&nbsp;{{ row.updateDate }}</div>
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div>
                    <div class="text-xs text-gray-400 mb-1">Stage</div>
                    <div class="font-medium text-gray-900">
                      {{ row.stage }} / {{ row.stageDetail }}
                    </div>
                  </div>
                  <div>
                    <div class="text-xs text-gray-400 mb-1">
                      Type of Inquiry
                    </div>
                    <div class="font-medium text-gray-900">
                      {{ row.typeOfInquiry || row.type }}
                    </div>
                  </div>
                  <div>
                    <div class="text-xs text-gray-400 mb-1">Type ID</div>
                    <div
                      class="font-medium text-gray-900 underline decoration-gray-300 underline-offset-4 cursor-pointer"
                    >
                      {{ row.typeId || row.stageDetail }}
                    </div>
                  </div>
                  <div>
                    <div class="text-xs text-gray-400 mb-1">Type Details</div>
                    <div class="font-medium text-gray-900">
                      {{ row.typeDetails || "N/A" }}
                    </div>
                  </div>
                  <div class="md:col-span-2">
                    <div class="text-xs text-gray-400 mb-1">Notes</div>
                    <div class="text-sm text-gray-600">
                      {{
                        row.notes || "Additional notes regarding the ticket."
                      }}
                    </div>
                  </div>
                </div>
              </el-card>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Ticket ID" min-width="180">
          <template #default="{ row }">
            <div class="flex items-center gap-2 font-medium text-gray-900">
              <!-- <el-icon class="cursor-pointer text-gray-400 hover:text-gray-600"><CirclePlus /></el-icon> -->
              {{ row.ticketId }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Stages" min-width="160">
          <template #default="{ row }">
            <div>
              <div class="font-medium text-gray-900">{{ row.stage }}</div>
              <div class="text-xs text-gray-500">{{ row.stageDetail }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column
          label="Type"
          prop="type"
          min-width="140"
          class-name="font-medium text-gray-900"
        />

        <el-table-column label="Status" min-width="120">
          <template #default="{ row }">
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
        </el-table-column>

        <el-table-column label="Priority" min-width="100">
          <template #default="{ row }">
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
        </el-table-column>

        <el-table-column label="Date" min-width="160">
          <template #default="{ row }">
            <div class="text-xs text-gray-500">
              <div>Create: {{ row.createDate }}</div>
              <div>Update: {{ row.updateDate }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Due Date" min-width="140">
          <template #default="{ row }">
            <div class="text-xs text-gray-500">{{ row.dueDate }}</div>
            <div class="mt-1">
              <el-tag
                v-if="row.dueTime"
                :type="row.dueUrgent ? 'danger' : 'info'"
                effect="light"
                round
                size="small"
                class="!border-0"
              >
                <el-icon class="mr-1"><Clock /></el-icon>
                {{ row.dueTime }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Actions" width="100" fixed="right">
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <el-button
                plain
                size="small"
                class="!rounded-lg !w-9 !h-9 !p-0"
                @click="handleView(row)"
              >
                <el-icon><View /></el-icon>
              </el-button>

              <el-dropdown
                trigger="click"
                @command="(cmd: any) => handleRowCommand(cmd, row)"
                popper-class="support-actions-menu"
              >
                <el-button plain size="small" class="!rounded-lg !w-9 !h-9 !p-0">
                  <el-icon><MoreFilled /></el-icon>
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
        </el-table-column>
      </el-table>

      <div class="px-4 py-3 border-t border-gray-100 flex justify-end">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="total"
          layout="prev, pager, next"
          background
          @current-change="fetchTickets"
        />
      </div>
    </div>

    <TicketDetail v-model="detailVisible" :ticket="selectedTicket" />

    <el-dialog
      v-model="createVisible"
      title="Create Ticket"
      width="520px"
      destroy-on-close
    >
      <el-form :model="createForm" label-position="top">
        <el-form-item label="Stage">
          <el-select v-model="createForm.stage" class="w-full">
            <el-option label="Order" value="Order" />
            <el-option label="Inventory" value="Inventory" />
            <el-option label="Billing" value="Billing" />
            <el-option label="Invoices" value="Invoices" />
            <el-option label="Settings" value="Settings" />
          </el-select>
        </el-form-item>
        <el-form-item label="Stage Detail">
          <el-input v-model="createForm.stageDetail" />
        </el-form-item>
        <el-form-item label="Type">
          <el-input v-model="createForm.type" />
        </el-form-item>
        <el-form-item label="Priority">
          <el-select v-model="createForm.priority" class="w-full">
            <el-option label="High" value="High" />
            <el-option label="Medium" value="Medium" />
            <el-option label="Low" value="Low" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="createVisible = false">Cancel</el-button>
          <el-button
            type="primary"
            class="!bg-[#1e3a8a] !border-none"
            @click="handleCreate"
            >Create</el-button
          >
        </div>
      </template>
    </el-dialog>
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
import TableFilter from "@/components/common/TableFilter.vue";
import TicketDetail from "./components/TicketDetail.vue";
import {
  createTicket,
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

// Filter Configuration
const filterConfig = {
  search: { placeholder: "Search by Ticket ID, Order ID, SKU..." },
  quickRanges: [
    { label: "Last 7 days", value: "last7" },
    { label: "Last 30 days", value: "last30" },
  ],
  dateRange: true,
  selects: [
    {
      key: "stage",
      placeholder: "Stage",
      options: [
        { label: "Order", value: "Order" },
        { label: "Inventory", value: "Inventory" },
        { label: "Billing", value: "Billing" },
        { label: "Invoices", value: "Invoices" },
        { label: "Settings", value: "Settings" },
      ],
    },
    {
      key: "type",
      placeholder: "Type",
      options: [
        { label: "General Issue", value: "General Issue" },
        { label: "Miss Information", value: "Miss Information" },
        { label: "Unpaid Invoice", value: "Unpaid Invoice" },
        { label: "Profile", value: "Profile" },
        { label: "Address Error", value: "Address Error" },
      ],
    },
    {
      key: "status",
      placeholder: "Status",
      options: [
        { label: "Open", value: "Open" },
        { label: "Investigating", value: "Investigating" },
        { label: "Info. Required", value: "Info. Required" },
        { label: "Awaiting Support", value: "Awaiting Support" },
        { label: "Resolved", value: "Resolved" },
        { label: "Closed", value: "Closed" },
      ],
    },
  ],
};

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
  currentFilters.quickRange = (filters.quickRange || "last7") as
    | "last7"
    | "last30"
    | "";
  currentFilters.dateRange = filters.dateRange || null;
  currentFilters.stage = filters.stage || "";
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

const handleCreate = async () => {
  await createTicket(createForm);
  createVisible.value = false;
  ElMessage.success("Created");
  pagination.page = 1;
  fetchTickets();
};

const getStatusType = (status: string) => {
  switch (status) {
    case "Open":
      return "success";
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
      return "info";
    default:
      return "info";
  }
};
</script>

<style scoped>
:deep(.support-table .el-table__inner-wrapper) {
  border-radius: 12px;
}

:deep(.support-table .el-table__row) {
  height: 64px;
}

:deep(.support-table .el-table__cell) {
  border-bottom: 1px solid #f1f5f9;
}

:deep(.support-table .el-table__header-wrapper th.el-table__cell) {
  border-bottom: 1px solid #eef2ff;
}

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
