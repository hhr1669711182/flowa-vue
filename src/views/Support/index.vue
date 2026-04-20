<template>
  <div class="h-full flex flex-col overflow-hidden">
    <div class="flex justify-between items-center">
      <div>
        <span class="text-2xl font-bold text-gray-900">Support Center</span>
        <p class="text-gray-500 mt-1 text-sm">
          Connect directly with the Flowa Support Team. Create tickets and
          manage inquiries related to your operations.
        </p>
      </div>
      <el-button
        size="large"
        type="primary"
        class="!bg-[#16215B] !border-none !rounded-lg"
        :icon="Plus"
        @click="openCreate"
        >Create Ticket</el-button
      >
    </div>

    <SupportFilter ref="filterRef" @search="handleFilterChange" />

    <div class="flex gap-3 mb-4">
      <el-tag
        :effect="activePriority === 'High' ? 'light' : 'plain'"
        class="!rounded-full !px-4 !py-1.5 cursor-pointer !border-solid"
        :class="
          activePriority === 'High'
            ? '!bg-red-50 !text-red-600 !border-red-100'
            : '!bg-white !text-gray-600 !border-gray-200'
        "
        @click="setPriority('High')"
      >
        High Priority ({{ stats.High.toString().padStart(2, "0") }})
      </el-tag>
      <el-tag
        :effect="activePriority === 'Medium' ? 'light' : 'plain'"
        class="!rounded-full !px-4 !py-1.5 cursor-pointer !border-solid"
        :class="
          activePriority === 'Medium'
            ? '!bg-orange-50 !text-orange-600 !border-orange-100'
            : '!bg-white !text-gray-600 !border-gray-200'
        "
        @click="setPriority('Medium')"
      >
        Medium Priority ({{ stats.Medium.toString().padStart(2, "0") }})
      </el-tag>
      <el-tag
        :effect="activePriority === 'Low' ? 'light' : 'plain'"
        class="!rounded-full !px-4 !py-1.5 cursor-pointer !border-solid"
        :class="
          activePriority === 'Low'
            ? '!bg-blue-50 !text-blue-600 !border-blue-100'
            : '!bg-white !text-gray-600 !border-gray-200'
        "
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
        @expand-change="handleExpandChange"
      >
        <template #expand="{ row }">
          <div class="py-4 px-6 bg-#F7F7F7">
            <div class="bg-#fff rounded-lg border border-gray-200">
              <div
                class="grid grid-cols-2 gap-4 px-6 py-3 !border-b-1.5 border-0 border-solid border-#ECECEC"
              >
                <div>
                  <div class="flex items-center gap-3 mb-2">
                    <span class="text-xl font-bold text-gray-900">
                      {{ getExpandRow(row).ticketId }}
                    </span>
                    <el-tag
                      :type="getStatusType(getExpandRow(row).status)"
                      effect="light"
                      round
                      size="small"
                      class="!border-0 font-medium"
                    >
                      {{ getExpandRow(row).status }}
                    </el-tag>
                  </div>
                  <div class="text-xs text-gray-500">
                    <span class="text-#000">{{ getExpandRow(row).stage }}</span>
                    <span class="mx-1"></span>
                    <span>{{ getExpandRow(row).stageDetail }}</span>
                  </div>
                </div>

                <div class="text-left text-sm">
                  <div class="mb-1">
                    <span class="text-gray-500 mr-2">Create Date</span>
                    <span class="text-#000 font-600">{{
                      getExpandRow(row).createDate
                    }}</span>
                  </div>
                  <div>
                    <span class="text-gray-500 mr-2">Update Date</span>
                    <span class="text-#000 font-600">{{
                      getExpandRow(row).updateDate
                    }}</span>
                  </div>
                </div>
              </div>
              <div class="px-6 py-4 grid grid-cols-2 gap-4">
                <div
                  v-for="item in getTicketInfos(getExpandRow(row))"
                  :key="item.id"
                  class="flex flex-col gap-1"
                >
                  <span class="text-gray-500 text-sm">{{ item.field }}</span>
                  <span class="text-#000 text-16px">{{ item.value }}</span>
                </div>
              </div>
            </div>
          </div>
        </template>

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
              <Icon icon="svg-icon:eye" color="#16215B" />
            </el-button>

            <el-dropdown
              trigger="click"
              @command="(cmd: string) => handleRowCommand(cmd, row)"
              popper-class="support-actions-menu"
            >
              <el-button
                plain
                size="small"
                class="!rounded-lg !w-8 !h-8 !p-0 !border-none bg-transparent hover:bg-gray-100"
              >
                <Icon icon="svg-icon:ellipsis-vertical" color="#16215B" />
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

    <TicketDetail
      v-model="detailVisible"
      :ticket="selectedTicket"
      @command="handleDetailCommand"
    />

    <TicketCreate
      v-model:visible="ticketModalVisible"
      :mode="ticketModalMode"
      :ticket="ticketModalTicket"
      @success="handleTicketModalSuccess"
    />

    <StartConversationDialog
      :visible="conversationVisible"
      @update:visible="conversationVisible = $event"
      @done="handleConversationDone"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import {
  Plus,
  View,
  MoreFilled,
  CircleCloseFilled,
  CircleCheckFilled,
  Delete,
} from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRequest } from "alova/client";
import SupportFilter from "./components/SupportFilter.vue";
import TicketDetail from "./components/TicketDetail.vue";
import TicketCreate from "./components/TicketCreate.vue";
import StartConversationDialog from "./components/StartConversationDialog.vue";
import {
  deleteTicket,
  getTicketDetail,
  getTickets,
  startTicketConversation,
  updateTicketStatus,
  type Ticket,
  type TicketPriority,
  type TicketStatus,
  type TicketsStats,
} from "@/api/support";

const tickets = ref<Ticket[]>([]);
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
const filterRef = ref();
const expandDetailMap = ref<Record<string, Ticket>>({});

const detailVisible = ref(false);
const selectedTicket = ref<Ticket | null>(null);

const ticketModalVisible = ref(false);
const ticketModalMode = ref<"create" | "edit">("create");
const ticketModalTicket = ref<Ticket | null>(null);
const conversationVisible = ref(false);
const pendingConversationTicket = ref<Ticket | null>(null);

const columns = [
  { type: "selection", width: 50 },
  { type: "expand", width: 50, slot: "expand" },
  { label: "Ticket ID", slot: "ticketId", minWidth: 180 },
  { label: "Type of enquire", prop: "type", width: 150 },
  { label: "Type ID", prop: "stageDetail", width: 180 },
  { label: "Status", slot: "status", width: 150 },
  { label: "Priority", slot: "priority", width: 150 },
  { label: "Date", slot: "date", width: 200 },
  {
    label: "Actions",
    slot: "actions",
    width: 100,
    fixed: "right",
    align: "center",
  },
];

const { loading, send: sendFetchTickets, onSuccess: onFetchTicketsSuccess } = useRequest(
  () => getTickets({
    ...currentFilters,
    priority: activePriority.value,
    page: pagination.page,
    pageSize: pagination.pageSize,
  }),
  { immediate: false }
);

onFetchTicketsSuccess((event) => {
  const res = event.data;
  tickets.value = res.list;
  total.value = res.total;
  stats.High = res.stats.High;
  stats.Medium = res.stats.Medium;
  stats.Low = res.stats.Low;
});

const fetchTickets = () => {
  sendFetchTickets();
};

onMounted(() => {
  if (filterRef.value?.getSearchParams) {
    const params = filterRef.value.getSearchParams();
    currentFilters.search = params.search || "";
    currentFilters.quickRange =
      params.quickDate === "7"
        ? "last7"
        : params.quickDate === "30"
          ? "last30"
          : "";
    currentFilters.dateRange = params.dateRange || null;
    currentFilters.stage = params.type || "";
    currentFilters.status = (params.status || "") as TicketStatus | "";
  }
  fetchTickets();
});

const handleFilterChange = (filters: any) => {
  currentFilters.search = filters.search || "";
  currentFilters.quickRange = (
    filters.quickDate === "7"
      ? "last7"
      : filters.quickDate === "30"
        ? "last30"
        : ""
  ) as any;
  currentFilters.dateRange = filters.dateRange || null;
  currentFilters.stage = filters.type || "";
  currentFilters.type = "";
  currentFilters.status = (filters.status || "") as TicketStatus | "";
  pagination.page = 1;
  fetchTickets();
};

const handleExpandChange = async (row: Ticket, expandedRows: Ticket[]) => {
  const expanded = expandedRows.some((item) => item.id === row.id);
  if (!expanded || expandDetailMap.value[row.id]) return;
  const detail = await getTicketDetail(row.id);
  if (detail) {
    expandDetailMap.value = { ...expandDetailMap.value, [row.id]: detail };
  }
};

const getExpandRow = (row: Ticket) => {
  return expandDetailMap.value[row.id] || row;
};

const getTicketInfos = (row: Ticket) => {
  if (Array.isArray(row.infos) && row.infos.length) return row.infos;
  return [
    { id: `${row.id}-stage`, field: "Stage", value: row.stage || "-" },
    {
      id: `${row.id}-type-id`,
      field: row.typeId || "Type ID",
      value: row.stageDetail || "-",
    },
    {
      id: `${row.id}-notes`,
      field: "Notes",
      value: row.notes || "Additional notes...",
    },
  ];
};

const setPriority = (p: TicketPriority) => {
  activePriority.value = p;
  pagination.page = 1;
  fetchTickets();
};

const handleView = async (row: Ticket) => {
  try {
    const detail = await getTicketDetail(row.id);
    selectedTicket.value = detail || row;
    detailVisible.value = true;
  } catch (error) {
    ElMessage.error("Failed to load ticket detail");
  }
};

const openCreate = () => {
  ticketModalMode.value = "create";
  ticketModalTicket.value = null;
  ticketModalVisible.value = true;
};

const openEdit = async (row: Ticket) => {
  const detail = await getTicketDetail(row.id);
  ticketModalMode.value = "edit";
  ticketModalTicket.value = detail || row;
  ticketModalVisible.value = true;
};

const executeCommand = async (cmd: string, row: Ticket) => {
  if (cmd === "view") {
    await handleView(row);
    return;
  }

  if (cmd === "edit") {
    await openEdit(row);
    return;
  }

  if (cmd === "close") {
    await updateTicketStatus(row.id, "Closed");
    ElMessage.success("Ticket closed");
    if (selectedTicket.value?.id === row.id) {
      const detail = await getTicketDetail(row.id);
      selectedTicket.value = detail || selectedTicket.value;
    }
    fetchTickets();
    return;
  }

  if (cmd === "open") {
    await updateTicketStatus(row.id, "Open");
    ElMessage.success("Ticket opened");
    if (selectedTicket.value?.id === row.id) {
      const detail = await getTicketDetail(row.id);
      selectedTicket.value = detail || selectedTicket.value;
    }
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
    if (selectedTicket.value?.id === row.id) {
      detailVisible.value = false;
      selectedTicket.value = null;
    }
    ElMessage.success("Deleted");
    fetchTickets();
    return;
  }

  if (cmd === "startConversation") {
    pendingConversationTicket.value = row;
    conversationVisible.value = true;
    return;
  }
};

const handleRowCommand = async (cmd: string, row: Ticket) => {
  await executeCommand(cmd, row);
};

const handleDetailCommand = async (cmd: string, row: Ticket) => {
  await executeCommand(cmd, row);
};

const handleTicketModalSuccess = async () => {
  ticketModalVisible.value = false;
  if (ticketModalMode.value === "create") {
    pagination.page = 1;
  }
  if (ticketModalMode.value === "edit" && ticketModalTicket.value?.id) {
    const detail = await getTicketDetail(ticketModalTicket.value.id);
    selectedTicket.value = detail || selectedTicket.value;
  }
  fetchTickets();
};

const handleConversationDone = async () => {
  if (!pendingConversationTicket.value) {
    conversationVisible.value = false;
    return;
  }
  const row = pendingConversationTicket.value;
  const msg = await startTicketConversation(row.id);
  if (selectedTicket.value?.id === row.id) {
    const old = selectedTicket.value.messages || [];
    selectedTicket.value = { ...selectedTicket.value, messages: [...old, msg] };
  }
  conversationVisible.value = false;
  ElMessage.success("Conversation started");
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
