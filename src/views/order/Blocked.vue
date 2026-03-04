<template>
  <div class="p-6 space-y-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div class="space-y-1">
        <h2 class="text-[28px] leading-9 font-bold text-black">
          Orders <span class="text-[#6B6B6B] font-semibold">/ Blocked</span>
        </h2>
        <p class="text-sm font-medium text-[#6B6B6B]">
          Orders manually placed on hold. Reactivate them at any time to resume processing.
        </p>
      </div>
      <el-button type="primary" class="!h-10 !px-4" @click="handleCreateOrder">
        <el-icon class="mr-1"><Plus /></el-icon>
        Create Order
      </el-button>
    </div>

    <el-alert
      type="error"
      show-icon
      :closable="false"
      title="Blocked orders require immediate review to avoid SLA delay."
      class="!rounded-xl !border !border-[#F5C2C7] !bg-[#FDF2F4]"
    />

    <div class="bg-white rounded-xl border border-[#ECECEC] shadow-sm overflow-hidden">
      <div class="px-4 py-3 bg-[#F1F1F1] border-b border-[#ECECEC] flex flex-wrap gap-3 items-center">
        <el-input
          v-model="filters.keyword"
          class="blocked-search !w-[368px] max-w-full"
          placeholder="Search by Order ID, Platform ID, SKU..."
          :prefix-icon="Search"
          clearable
          @input="handleDebouncedSearch"
          @clear="handleImmediateSearch"
        />
        <el-select v-model="filters.quickRange" class="!w-[150px]" @change="handleImmediateSearch">
          <el-option label="Last 7 days" value="last7" />
          <el-option label="Last 30 days" value="last30" />
          <el-option label="This month" value="thisMonth" />
          <el-option label="All time" value="all" />
        </el-select>
        <el-date-picker
          v-model="filters.dateRange"
          type="daterange"
          range-separator="-"
          start-placeholder="Start Date"
          end-placeholder="End Date"
          value-format="YYYY-MM-DD"
          class="!w-[260px]"
          @change="handleImmediateSearch"
        />
        <el-select v-model="filters.status" class="!w-[170px]" clearable placeholder="Status" @change="handleImmediateSearch">
          <el-option label="Blocked" value="Blocked" />
          <el-option label="Awaiting Review" value="Awaiting Review" />
          <el-option label="Escalated" value="Escalated" />
          <el-option label="Resolved" value="Resolved" />
        </el-select>
        <el-select v-model="filters.reason" class="!w-[190px]" clearable placeholder="Reason" @change="handleImmediateSearch">
          <el-option label="Address Error" value="Address Error" />
          <el-option label="Payment Risk" value="Payment Risk" />
          <el-option label="Inventory Hold" value="Inventory Hold" />
          <el-option label="Compliance Alert" value="Compliance Alert" />
          <el-option label="Manual Review" value="Manual Review" />
        </el-select>
        <el-button class="!h-10 !px-4" @click="openAdvancedFilterDialog">
          <el-icon class="mr-1"><Operation /></el-icon>
          Filters
        </el-button>
      </div>

      <div class="px-4 py-3 border-b border-[#ECECEC]">
        <el-segmented
          v-model="filters.segmented"
          :options="segmentedOptions"
          size="large"
          @change="handleImmediateSearch"
        />
      </div>

      <el-table
        v-loading="loading"
        :data="listData"
        row-key="id"
        class="blocked-table"
        :header-cell-style="{ background: '#F1F1F1', color: '#000000', fontWeight: '600' }"
        @expand-change="handleExpandChange"
      >
        <el-table-column type="expand" width="44">
          <template #default="{ row }">
            <div v-loading="!!expandLoadingMap[row.id]" class="bg-[#FAFAFA] rounded-lg border border-[#ECECEC] m-4 p-4 space-y-3">
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div class="flex justify-between">
                  <span class="text-[#6B6B6B]">SKU</span>
                  <span class="font-semibold text-black">{{ getExpandedDetail(row).sku }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-[#6B6B6B]">Quantity</span>
                  <span class="font-semibold text-black">{{ getExpandedDetail(row).quantity }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-[#6B6B6B]">Hold Days</span>
                  <span class="font-semibold text-black">{{ getExpandedDetail(row).holdDays }} days</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-[#6B6B6B]">Priority</span>
                  <span class="font-semibold text-black">{{ getExpandedDetail(row).holdLevel }}</span>
                </div>
                <div class="flex justify-between col-span-2">
                  <span class="text-[#6B6B6B]">Note</span>
                  <span class="font-semibold text-black">{{ getExpandedDetail(row).holdNote }}</span>
                </div>
              </div>
              <div class="flex justify-end gap-2">
                <el-button size="small" @click="openDetailDialog(row)">View Detail</el-button>
                <el-button size="small" type="primary" @click="openReactivateDialog(row)">Reactivate</el-button>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Order ID / Platform ID" min-width="270">
          <template #default="{ row }">
            <div class="font-semibold text-black">{{ row.orderId }}</div>
            <div class="text-xs text-[#6B6B6B] mt-1">{{ row.platformId }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="stage" label="Stages" min-width="150" />
        <el-table-column label="Status" min-width="170">
          <template #default="{ row }">
            <el-tag effect="plain" class="!rounded-md" :type="statusTagType(row.status)">
              {{ row.status }}
            </el-tag>
            <div class="text-xs text-[#6B6B6B] mt-1">{{ row.holdReason }}</div>
          </template>
        </el-table-column>
        <el-table-column label="Customer" min-width="170">
          <template #default="{ row }">
            <div class="text-sm text-black">{{ row.customerName }}</div>
            <div class="text-xs text-[#6B6B6B] mt-1">{{ row.customerRegion }}</div>
          </template>
        </el-table-column>
        <el-table-column label="Inventory" width="130" align="center">
          <template #default="{ row }">
            <el-tag effect="plain" class="!rounded-md" :type="inventoryTagType(row.inventoryStatus)">
              {{ row.inventoryStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Date" width="170">
          <template #default="{ row }">
            <div class="text-xs text-[#6B6B6B]">Blocked: {{ row.blockedDate }}</div>
            <div class="text-xs text-[#6B6B6B] mt-1">Due: {{ row.dueDate }}</div>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="200" align="right">
          <template #default="{ row }">
            <div class="flex items-center justify-end gap-2">
              <el-button size="small" type="primary" @click="openReactivateDialog(row)">Reactivate</el-button>
              <el-dropdown trigger="click" @command="(command: string) => handleRowCommand(command, row)">
                <el-button class="!h-8 !w-8 !p-0 !border-[#16215B1A]">
                  <el-icon><MoreFilled /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="detail">
                      <el-icon class="mr-2"><View /></el-icon>
                      View Detail
                    </el-dropdown-item>
                    <el-dropdown-item command="escalate">
                      <el-icon class="mr-2"><WarningFilled /></el-icon>
                      Escalate
                    </el-dropdown-item>
                    <el-dropdown-item command="ticket">
                      <el-icon class="mr-2"><Headset /></el-icon>
                      Create Ticket
                    </el-dropdown-item>
                    <el-dropdown-item command="reactivate" class="!text-[#0A7A0A]">
                      <el-icon class="mr-2"><RefreshRight /></el-icon>
                      Reactivate Order
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="p-4 border-t border-[#ECECEC] flex flex-wrap gap-4 items-center justify-between">
        <div class="text-sm text-[#6B6B6B]">Total {{ total }} blocked orders</div>
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="total"
          layout="prev, pager, next"
          background
          @current-change="fetchList"
          @size-change="fetchList"
        />
      </div>
    </div>

    <el-dialog v-model="detailVisible" title="Blocked Order Detail" width="680px" destroy-on-close>
      <div class="space-y-3 text-sm">
        <div class="grid grid-cols-2 gap-x-6 gap-y-3">
          <div class="flex justify-between border-b border-[#ECECEC] pb-2">
            <span class="text-[#6B6B6B]">Order ID</span>
            <span class="font-semibold text-black">{{ detailRecord?.orderId || '--' }}</span>
          </div>
          <div class="flex justify-between border-b border-[#ECECEC] pb-2">
            <span class="text-[#6B6B6B]">Status</span>
            <span class="font-semibold text-black">{{ detailRecord?.status || '--' }}</span>
          </div>
          <div class="flex justify-between border-b border-[#ECECEC] pb-2">
            <span class="text-[#6B6B6B]">Reason</span>
            <span class="font-semibold text-black">{{ detailRecord?.holdReason || '--' }}</span>
          </div>
          <div class="flex justify-between border-b border-[#ECECEC] pb-2">
            <span class="text-[#6B6B6B]">Priority</span>
            <span class="font-semibold text-black">{{ detailRecord?.holdLevel || '--' }}</span>
          </div>
          <div class="flex justify-between border-b border-[#ECECEC] pb-2 col-span-2">
            <span class="text-[#6B6B6B]">Hold Note</span>
            <span class="font-semibold text-black">{{ detailRecord?.holdNote || '--' }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="detailVisible = false">Close</el-button>
          <el-button type="primary" @click="detailRecord && openReactivateDialog(detailRecord)">Reactivate</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="reactivateVisible" title="Reactivate Order" width="560px" destroy-on-close>
      <el-form :model="reactivateForm" label-position="top">
        <el-form-item label="Resolution Note">
          <el-input
            v-model="reactivateForm.note"
            type="textarea"
            :rows="5"
            placeholder="Describe how this blocked order is resolved..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="reactivateVisible = false">Cancel</el-button>
          <el-button type="primary" @click="submitReactivate">Confirm</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="ticketVisible" title="Create Support Ticket" width="520px" destroy-on-close>
      <el-form :model="ticketForm" label-position="top">
        <el-form-item label="Subject">
          <el-input v-model="ticketForm.subject" />
        </el-form-item>
        <el-form-item label="Priority">
          <el-select v-model="ticketForm.priority" class="w-full">
            <el-option label="High" value="High" />
            <el-option label="Medium" value="Medium" />
            <el-option label="Low" value="Low" />
          </el-select>
        </el-form-item>
        <el-form-item label="Message">
          <el-input v-model="ticketForm.message" type="textarea" :rows="4" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="ticketVisible = false">Cancel</el-button>
          <el-button type="primary" @click="submitTicket">Create</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="advancedFilterVisible" title="Advanced Filters" width="520px" destroy-on-close>
      <el-form :model="advancedFilterForm" label-position="top">
        <el-form-item label="Stage">
          <el-select v-model="advancedFilterForm.stage" class="w-full" clearable>
            <el-option label="Manual Hold" value="Manual Hold" />
            <el-option label="Compliance Check" value="Compliance Check" />
            <el-option label="Address Verification" value="Address Verification" />
            <el-option label="Payment Hold" value="Payment Hold" />
          </el-select>
        </el-form-item>
        <el-form-item label="Inventory">
          <el-select v-model="advancedFilterForm.inventory" class="w-full" clearable>
            <el-option label="In Stock" value="In Stock" />
            <el-option label="Reserved" value="Reserved" />
            <el-option label="Out of Stock" value="Out of Stock" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="advancedFilterVisible = false">Cancel</el-button>
          <el-button type="primary" @click="applyAdvancedFilter">Apply</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { useRequest } from 'alova/client'
import { ElMessage } from 'element-plus'
import {
  Plus,
  Search,
  Operation,
  MoreFilled,
  View,
  WarningFilled,
  Headset,
  RefreshRight
} from '@element-plus/icons-vue'
import {
  createBlockedSupportTicket,
  getBlockedOrderDetail,
  getBlockedOrderList,
  reactivateBlockedOrder,
  updateBlockedOrderStatus,
  type BlockedInventoryStatus,
  type BlockedOrderRecord,
  type BlockedOrderStage,
  type BlockedOrderStatus
} from '@/api/orderBlocked'

const pagination = reactive({
  page: 1,
  pageSize: 10
})

const filters = reactive<{
  keyword: string
  quickRange: 'last7' | 'last30' | 'thisMonth' | 'all'
  dateRange: [string, string] | []
  status: BlockedOrderStatus | ''
  reason:
    | 'Address Error'
    | 'Payment Risk'
    | 'Inventory Hold'
    | 'Compliance Alert'
    | 'Manual Review'
    | ''
  segmented: 'all' | 'active' | 'resolved'
  stage: BlockedOrderStage | ''
  inventory: BlockedInventoryStatus | ''
}>({
  keyword: '',
  quickRange: 'last7',
  dateRange: [],
  status: '',
  reason: '',
  segmented: 'all',
  stage: '',
  inventory: ''
})

const detailVisible = ref(false)
const reactivateVisible = ref(false)
const ticketVisible = ref(false)
const advancedFilterVisible = ref(false)
const activeRowId = ref('')
const detailRecord = ref<BlockedOrderRecord | null>(null)
const expandLoadingMap = reactive<Record<string, boolean>>({})
const expandDetailMap = reactive<Record<string, BlockedOrderRecord>>({})

const reactivateForm = reactive({
  note: ''
})

const ticketForm = reactive({
  subject: '',
  priority: 'High' as 'High' | 'Medium' | 'Low',
  message: ''
})

const advancedFilterForm = reactive({
  stage: '' as BlockedOrderStage | '',
  inventory: '' as BlockedInventoryStatus | ''
})

const { data, loading, send: fetchList } = useRequest(
  () =>
    getBlockedOrderList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: filters.keyword,
      quickRange: filters.quickRange,
      dateRange: filters.dateRange,
      status: filters.status,
      reason: filters.reason,
      stage: filters.stage,
      inventory: filters.inventory,
      segmented: filters.segmented
    }),
  {
    immediate: true,
    initialData: { total: 0, list: [], segmented: { all: 0, active: 0, resolved: 0 } }
  }
)

const { send: fetchOrderDetail } = useRequest((id: string) => getBlockedOrderDetail(id), {
  immediate: false
})

const { send: postReactivate } = useRequest(
  (payload: { id: string; note: string }) => reactivateBlockedOrder(payload),
  { immediate: false }
)

const { send: postStatus } = useRequest(
  (payload: { id: string; status: BlockedOrderStatus }) => updateBlockedOrderStatus(payload),
  { immediate: false }
)

const { send: postTicket } = useRequest(
  (payload: { id: string; subject: string; message: string; priority: 'High' | 'Medium' | 'Low' }) =>
    createBlockedSupportTicket(payload),
  { immediate: false }
)

const listData = computed(() => {
  return data.value?.list || []
})

const total = computed(() => {
  return data.value?.total || 0
})

const segmentedOptions = computed(() => {
  const segmented = data.value?.segmented || { all: 0, active: 0, resolved: 0 }
  return [
    { label: `All Orders (${segmented.all})`, value: 'all' },
    { label: `Active Blocks (${segmented.active})`, value: 'active' },
    { label: `Resolved (${segmented.resolved})`, value: 'resolved' }
  ]
})

let searchTimer: ReturnType<typeof setTimeout> | null = null

const statusTagType = (status: BlockedOrderStatus) => {
  if (status === 'Resolved') return 'success'
  if (status === 'Awaiting Review') return 'warning'
  if (status === 'Escalated') return 'danger'
  return 'info'
}

const inventoryTagType = (status: string) => {
  if (status === 'In Stock') return 'success'
  if (status === 'Reserved') return 'warning'
  return 'danger'
}

const getExpandedDetail = (row: BlockedOrderRecord) => {
  return expandDetailMap[row.id] || row
}

const handleDebouncedSearch = () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    pagination.page = 1
    fetchList()
  }, 300)
}

const handleImmediateSearch = () => {
  pagination.page = 1
  fetchList()
}

const handleExpandChange = async (row: BlockedOrderRecord, expandedRows: BlockedOrderRecord[]) => {
  const expanded = expandedRows.some((item) => item.id === row.id)
  if (!expanded || expandDetailMap[row.id] || expandLoadingMap[row.id]) return
  expandLoadingMap[row.id] = true
  try {
    const detail = await fetchOrderDetail(row.id)
    if (detail) {
      expandDetailMap[row.id] = detail
    }
  } finally {
    expandLoadingMap[row.id] = false
  }
}

const openDetailDialog = async (row: BlockedOrderRecord) => {
  const detail = await fetchOrderDetail(row.id)
  detailRecord.value = detail || row
  detailVisible.value = true
}

const openReactivateDialog = (row: BlockedOrderRecord) => {
  activeRowId.value = row.id
  reactivateForm.note = row.holdNote || ''
  reactivateVisible.value = true
}

const handleRowCommand = async (command: string, row: BlockedOrderRecord) => {
  if (command === 'detail') {
    await openDetailDialog(row)
    return
  }
  if (command === 'escalate') {
    await postStatus({ id: row.id, status: 'Escalated' })
    ElMessage.warning('Order escalated')
    fetchList()
    return
  }
  if (command === 'reactivate') {
    openReactivateDialog(row)
    return
  }
  activeRowId.value = row.id
  ticketForm.subject = `${row.orderId} blocked follow-up`
  ticketForm.message = row.holdNote || ''
  ticketVisible.value = true
}

const submitReactivate = async () => {
  if (!activeRowId.value) return
  if (!reactivateForm.note.trim()) {
    ElMessage.warning('Please enter a resolution note')
    return
  }
  await postReactivate({
    id: activeRowId.value,
    note: reactivateForm.note
  })
  reactivateVisible.value = false
  ElMessage.success('Order reactivated')
  fetchList()
}

const submitTicket = async () => {
  if (!activeRowId.value) return
  if (!ticketForm.message.trim()) {
    ElMessage.warning('Please enter ticket message')
    return
  }
  await postTicket({
    id: activeRowId.value,
    subject: ticketForm.subject,
    message: ticketForm.message,
    priority: ticketForm.priority
  })
  ticketVisible.value = false
  ElMessage.success('Ticket created')
}

const openAdvancedFilterDialog = () => {
  advancedFilterForm.stage = filters.stage
  advancedFilterForm.inventory = filters.inventory
  advancedFilterVisible.value = true
}

const applyAdvancedFilter = () => {
  filters.stage = advancedFilterForm.stage
  filters.inventory = advancedFilterForm.inventory
  advancedFilterVisible.value = false
  pagination.page = 1
  fetchList()
}

const handleCreateOrder = () => {
  ElMessage.success('Create Order modal is coming next step')
}

onBeforeUnmount(() => {
  if (searchTimer) clearTimeout(searchTimer)
})
</script>

<style scoped>
.blocked-table :deep(.el-table__inner-wrapper::before) {
  display: none;
}

.blocked-table :deep(.el-table__row td) {
  border-bottom: 1px solid #ececec;
}

.blocked-search :deep(.el-input__wrapper) {
  border-width: 1.5px;
}
</style>
