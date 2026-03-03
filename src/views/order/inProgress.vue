<template>
  <div class="p-6 space-y-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div class="space-y-1">
        <h2 class="text-[28px] leading-9 font-bold text-black">
          Orders <span class="text-[#6B6B6B] font-semibold">/ In Progress</span>
        </h2>
        <p class="text-sm font-medium text-[#6B6B6B]">
          Track orders currently being processed. No action required.
        </p>
      </div>
      <el-button type="primary" class="!h-10 !px-4" @click="handleCreateOrder">
        <el-icon class="mr-1"><Plus /></el-icon>
        Create Order
      </el-button>
    </div>

    <div class="bg-white rounded-xl border border-[#ECECEC] shadow-sm overflow-hidden">
      <div class="px-4 py-3 bg-[#F1F1F1] border-b border-[#ECECEC] flex flex-wrap gap-3 items-center">
        <el-input
          v-model="filters.keyword"
          class="!w-[360px] max-w-full"
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
        <el-select v-model="filters.stage" class="!w-[180px]" clearable placeholder="Stage" @change="handleImmediateSearch">
          <el-option label="Review & Fix" value="Review & Fix" />
          <el-option label="Warehouse Processing" value="Warehouse Processing" />
          <el-option label="Labeling" value="Labeling" />
          <el-option label="Export Processing" value="Export Processing" />
        </el-select>
        <el-select v-model="filters.status" class="!w-[170px]" clearable placeholder="Status" @change="handleImmediateSearch">
          <el-option label="Awaiting Approval" value="Awaiting Approval" />
          <el-option label="Need Attention" value="Need Attention" />
          <el-option label="Processing" value="Processing" />
          <el-option label="Blocked" value="Blocked" />
        </el-select>
      </div>

      <el-table
        v-loading="loading"
        :data="listData"
        row-key="id"
        class="in-progress-table"
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
                <div class="flex justify-between col-span-2">
                  <span class="text-[#6B6B6B]">Product</span>
                  <span class="font-semibold text-black">{{ getExpandedDetail(row).productName }}</span>
                </div>
                <div class="flex justify-between col-span-2">
                  <span class="text-[#6B6B6B]">Issue</span>
                  <span class="font-semibold text-black">{{ getExpandedDetail(row).issueSummary || 'No issue' }}</span>
                </div>
              </div>
              <div class="flex justify-end gap-2">
                <el-button size="small" @click="openDetailDialog(row)">View Detail</el-button>
                <el-button size="small" type="primary" @click="openReviewDialog(row)">Review & Fix</el-button>
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
        <el-table-column prop="stage" label="Stages" min-width="160" />
        <el-table-column label="Status" min-width="150">
          <template #default="{ row }">
            <el-tag effect="plain" class="!rounded-md" :type="statusTagType(row.status)">
              {{ row.status }}
            </el-tag>
            <div v-if="row.statusNote" class="text-xs text-[#6B6B6B] mt-1">{{ row.statusNote }}</div>
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
        <el-table-column label="Date" width="160">
          <template #default="{ row }">
            <div class="text-xs text-[#6B6B6B]">Create: {{ row.createDate }}</div>
            <div class="text-xs text-[#6B6B6B] mt-1">Due: {{ row.dueDate }}</div>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="170" align="right">
          <template #default="{ row }">
            <div class="flex items-center justify-end gap-2">
              <el-button size="small" @click="openReviewDialog(row)">Review & Fix</el-button>
              <el-dropdown trigger="click" @command="(command) => handleRowCommand(command, row)">
                <el-button class="!h-8 !w-8 !p-0 !border-[#16215B1A]">
                  <el-icon><MoreFilled /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="view">
                      <el-icon class="mr-2"><View /></el-icon>
                      View Detail
                    </el-dropdown-item>
                    <el-dropdown-item command="processing">
                      <el-icon class="mr-2"><CircleCheck /></el-icon>
                      Mark Processing
                    </el-dropdown-item>
                    <el-dropdown-item command="blocked">
                      <el-icon class="mr-2"><WarningFilled /></el-icon>
                      Mark Blocked
                    </el-dropdown-item>
                    <el-dropdown-item command="ticket" class="!text-[#C62828]">
                      <el-icon class="mr-2"><Tickets /></el-icon>
                      Create Ticket
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="p-4 border-t border-[#ECECEC] flex flex-wrap gap-4 items-center justify-between">
        <div class="text-sm text-[#6B6B6B]">Total {{ total }} orders in progress</div>
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

    <el-dialog v-model="reviewVisible" title="Review & Fix" width="560px" destroy-on-close>
      <el-form :model="reviewForm" label-position="top">
        <el-form-item label="Issue Type">
          <el-select v-model="reviewForm.issueType" class="w-full">
            <el-option label="Address Error" value="Address Error" />
            <el-option label="Info Missing" value="Info Missing" />
            <el-option label="Wrong Declaration" value="Wrong Declaration" />
            <el-option label="Inventory Mismatch" value="Inventory Mismatch" />
          </el-select>
        </el-form-item>
        <el-form-item label="Due Date">
          <el-date-picker v-model="reviewForm.dueDate" value-format="YYYY-MM-DD" type="date" class="w-full" />
        </el-form-item>
        <el-form-item label="Details">
          <el-input v-model="reviewForm.note" type="textarea" :rows="4" placeholder="Describe required fixes..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="reviewVisible = false">Cancel</el-button>
          <el-button type="primary" @click="submitReview">Submit</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="Order Detail" width="660px" destroy-on-close>
      <div class="space-y-3 text-sm">
        <div class="grid grid-cols-2 gap-x-6 gap-y-3">
          <div class="flex justify-between border-b border-[#ECECEC] pb-2">
            <span class="text-[#6B6B6B]">Order ID</span>
            <span class="font-semibold text-black">{{ detailRecord?.orderId || '--' }}</span>
          </div>
          <div class="flex justify-between border-b border-[#ECECEC] pb-2">
            <span class="text-[#6B6B6B]">Platform ID</span>
            <span class="font-semibold text-black">{{ detailRecord?.platformId || '--' }}</span>
          </div>
          <div class="flex justify-between border-b border-[#ECECEC] pb-2">
            <span class="text-[#6B6B6B]">Stage</span>
            <span class="font-semibold text-black">{{ detailRecord?.stage || '--' }}</span>
          </div>
          <div class="flex justify-between border-b border-[#ECECEC] pb-2">
            <span class="text-[#6B6B6B]">Status</span>
            <span class="font-semibold text-black">{{ detailRecord?.status || '--' }}</span>
          </div>
          <div class="flex justify-between border-b border-[#ECECEC] pb-2 col-span-2">
            <span class="text-[#6B6B6B]">Issue Summary</span>
            <span class="font-semibold text-black">{{ detailRecord?.issueSummary || '--' }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="detailVisible = false">Close</el-button>
          <el-button type="primary" @click="detailRecord && openReviewDialog(detailRecord)">Review & Fix</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="ticketVisible" title="Create Ticket" width="520px" destroy-on-close>
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
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { useRequest } from 'alova/client'
import { ElMessage } from 'element-plus'
import {
  Plus,
  Search,
  MoreFilled,
  View,
  CircleCheck,
  WarningFilled,
  Tickets
} from '@element-plus/icons-vue'
import {
  getInProgressOrderDetail,
  getInProgressOrderList,
  submitInProgressReview,
  updateInProgressOrderStatus,
  type InProgressOrderRecord,
  type InProgressStage,
  type InProgressStatus
} from '@/api/order'

const pagination = reactive({
  page: 1,
  pageSize: 10
})

const filters = reactive<{
  keyword: string
  quickRange: 'last7' | 'last30' | 'thisMonth' | 'all'
  dateRange: [string, string] | []
  stage: InProgressStage | ''
  status: InProgressStatus | ''
}>({
  keyword: '',
  quickRange: 'last7',
  dateRange: [],
  stage: '',
  status: ''
})

const reviewVisible = ref(false)
const detailVisible = ref(false)
const ticketVisible = ref(false)
const activeRowId = ref('')
const detailRecord = ref<InProgressOrderRecord | null>(null)
const expandLoadingMap = reactive<Record<string, boolean>>({})
const expandDetailMap = reactive<Record<string, InProgressOrderRecord>>({})

const reviewForm = reactive({
  issueType: 'Address Error',
  dueDate: '',
  note: ''
})

const ticketForm = reactive({
  subject: '',
  priority: 'High',
  message: ''
})

const { data, loading, send: fetchList } = useRequest(
  () =>
    getInProgressOrderList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: filters.keyword,
      quickRange: filters.quickRange,
      dateRange: filters.dateRange,
      stage: filters.stage,
      status: filters.status
    }),
  {
    immediate: true,
    initialData: { total: 0, list: [] }
  }
)

const { send: fetchOrderDetail } = useRequest((id: string) => getInProgressOrderDetail(id), {
  immediate: false
})

const { send: postReview } = useRequest(
  (payload: { id: string; issueType: string; note: string; dueDate: string }) =>
    submitInProgressReview(payload),
  { immediate: false }
)

const { send: postStatus } = useRequest(
  (payload: { id: string; status: InProgressStatus }) => updateInProgressOrderStatus(payload),
  { immediate: false }
)

const listData = computed(() => data.value?.list || [])
const total = computed(() => data.value?.total || 0)

let searchTimer: ReturnType<typeof setTimeout> | null = null

const statusTagType = (status: InProgressStatus) => {
  if (status === 'Awaiting Approval') return 'warning'
  if (status === 'Need Attention') return 'danger'
  if (status === 'Processing') return 'success'
  return 'info'
}

const inventoryTagType = (status: string) => {
  if (status === 'In Stock') return 'success'
  if (status === 'Low Stock') return 'warning'
  return 'danger'
}

const getExpandedDetail = (row: InProgressOrderRecord) => {
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

const handleExpandChange = async (row: InProgressOrderRecord, expandedRows: InProgressOrderRecord[]) => {
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

const openReviewDialog = (row: InProgressOrderRecord) => {
  activeRowId.value = row.id
  reviewForm.issueType = row.statusNote || 'Address Error'
  reviewForm.dueDate = row.dueDate
  reviewForm.note = row.issueSummary || ''
  reviewVisible.value = true
}

const openDetailDialog = async (row: InProgressOrderRecord) => {
  const detail = await fetchOrderDetail(row.id)
  detailRecord.value = detail || row
  detailVisible.value = true
}

const handleRowCommand = async (command: string, row: InProgressOrderRecord) => {
  if (command === 'view') {
    await openDetailDialog(row)
    return
  }
  if (command === 'processing') {
    await postStatus({ id: row.id, status: 'Processing' })
    ElMessage.success('Order updated to Processing')
    fetchList()
    return
  }
  if (command === 'blocked') {
    await postStatus({ id: row.id, status: 'Blocked' })
    ElMessage.warning('Order marked as Blocked')
    fetchList()
    return
  }
  activeRowId.value = row.id
  ticketForm.subject = `${row.orderId} - ${row.stage}`
  ticketForm.message = row.issueSummary || ''
  ticketVisible.value = true
}

const submitReview = async () => {
  if (!activeRowId.value) return
  if (!reviewForm.note.trim()) {
    ElMessage.warning('Please enter fix details')
    return
  }
  await postReview({
    id: activeRowId.value,
    issueType: reviewForm.issueType,
    note: reviewForm.note,
    dueDate: reviewForm.dueDate
  })
  reviewVisible.value = false
  ElMessage.success('Review request submitted')
  fetchList()
}

const submitTicket = () => {
  if (!ticketForm.message.trim()) {
    ElMessage.warning('Please enter ticket details')
    return
  }
  ticketVisible.value = false
  ElMessage.success('Ticket created')
}

const handleCreateOrder = () => {
  ElMessage.success('Create Order modal is coming next step')
}

onBeforeUnmount(() => {
  if (searchTimer) clearTimeout(searchTimer)
})
</script>

<style scoped>
.in-progress-table :deep(.el-table__inner-wrapper::before) {
  display: none;
}

.in-progress-table :deep(.el-table__row td) {
  border-bottom: 1px solid #ececec;
}
</style>
