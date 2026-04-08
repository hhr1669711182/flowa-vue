<template>
  <div class="p-6 space-y-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div class="space-y-1">
        <h2 class="text-[28px] leading-9 font-bold text-black">
          Orders <span class="text-[#6B6B6B] font-semibold">/ Delivered</span>
        </h2>
        <p class="text-sm font-medium text-[#6B6B6B]">
          Access all successfully delivered orders and completed shipments.
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
          <el-option label="Final Review" value="Final Review" />
          <el-option label="Last Mile" value="Last Mile" />
          <el-option label="Delivered" value="Delivered" />
          <el-option label="Returned Handling" value="Returned Handling" />
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
        class="delivered-table"
        :header-cell-style="{ background: '#F1F1F1', color: '#000000', fontWeight: '600' }"
        @expand-change="handleExpandChange"
      >
        <el-table-column type="expand" width="44">
          <template #default="{ row }">
            <div v-loading="!!expandLoadingMap[row.id]" class="bg-[#FAFAFA] rounded-lg border border-[#ECECEC] m-4 p-4 space-y-3">
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div class="flex justify-between">
                  <span class="text-[#6B6B6B]">Carrier</span>
                  <span class="font-semibold text-black">{{ getExpandedDetail(row).carrier }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-[#6B6B6B]">Tracking No</span>
                  <span class="font-semibold text-black">{{ getExpandedDetail(row).trackingNo }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-[#6B6B6B]">Proof</span>
                  <span class="font-semibold text-black">{{ getExpandedDetail(row).proofStatus }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-[#6B6B6B]">Quantity</span>
                  <span class="font-semibold text-black">{{ getExpandedDetail(row).quantity }}</span>
                </div>
                <div class="flex justify-between col-span-2">
                  <span class="text-[#6B6B6B]">Note</span>
                  <span class="font-semibold text-black">{{ getExpandedDetail(row).note || 'No note' }}</span>
                </div>
              </div>
              <div class="flex justify-end gap-2">
                <el-button size="small" @click="openDetailDialog(row)">View Detail</el-button>
                <el-button size="small" type="primary" @click="openNoteDialog(row)">Edit Note</el-button>
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
            <div class="text-xs text-[#6B6B6B]">Create: {{ row.createDate }}</div>
            <div class="text-xs text-[#6B6B6B] mt-1">Delivered: {{ row.deliveredDate }}</div>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="190" align="right">
          <template #default="{ row }">
            <div class="flex items-center justify-end gap-2">
              <el-button size="small" @click="openDetailDialog(row)">View</el-button>
              <el-dropdown trigger="click" @command="(command: string) => handleRowCommand(command, row)">
                <el-button class="!h-8 !w-8 !p-0 !border-[#16215B1A]">
                  <el-icon><MoreFilled /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="delivered">
                      <el-icon class="mr-2"><CircleCheck /></el-icon>
                      Mark Delivered
                    </el-dropdown-item>
                    <el-dropdown-item command="issue">
                      <el-icon class="mr-2"><WarningFilled /></el-icon>
                      Mark Issue
                    </el-dropdown-item>
                    <el-dropdown-item command="note">
                      <el-icon class="mr-2"><EditPen /></el-icon>
                      Edit Note
                    </el-dropdown-item>
                    <el-dropdown-item command="ticket" class="!text-[#C62828]">
                      <el-icon class="mr-2"><Headset /></el-icon>
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
        <div class="text-sm text-[#6B6B6B]">Total {{ total }} delivered orders</div>
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

    <el-dialog v-model="detailVisible" title="Delivered Order Detail" width="660px" destroy-on-close>
      <div class="space-y-3 text-sm">
        <div class="grid grid-cols-2 gap-x-6 gap-y-3">
          <div class="flex justify-between border-b border-[#ECECEC] pb-2">
            <span class="text-[#6B6B6B]">Order ID</span>
            <span class="font-semibold text-black">{{ detailRecord?.orderId || '--' }}</span>
          </div>
          <div class="flex justify-between border-b border-[#ECECEC] pb-2">
            <span class="text-[#6B6B6B]">Tracking</span>
            <span class="font-semibold text-black">{{ detailRecord?.trackingNo || '--' }}</span>
          </div>
          <div class="flex justify-between border-b border-[#ECECEC] pb-2">
            <span class="text-[#6B6B6B]">Carrier</span>
            <span class="font-semibold text-black">{{ detailRecord?.carrier || '--' }}</span>
          </div>
          <div class="flex justify-between border-b border-[#ECECEC] pb-2">
            <span class="text-[#6B6B6B]">Proof</span>
            <span class="font-semibold text-black">{{ detailRecord?.proofStatus || '--' }}</span>
          </div>
          <div class="flex justify-between border-b border-[#ECECEC] pb-2 col-span-2">
            <span class="text-[#6B6B6B]">Note</span>
            <span class="font-semibold text-black">{{ detailRecord?.note || '--' }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="detailVisible = false">Close</el-button>
          <el-button type="primary" @click="detailRecord && openNoteDialog(detailRecord)">Edit Note</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="noteVisible" title="Edit Delivery Note" width="560px" destroy-on-close>
      <el-form :model="noteForm" label-position="top">
        <el-form-item label="Note">
          <el-input v-model="noteForm.note" type="textarea" :rows="5" placeholder="Add delivery notes..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="noteVisible = false">Cancel</el-button>
          <el-button type="primary" @click="submitNote">Save</el-button>
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
        <el-form-item label="Status">
          <el-select v-model="advancedFilterForm.status" class="w-full" clearable>
            <el-option label="Delivered" value="Delivered" />
            <el-option label="Partially Delivered" value="Partially Delivered" />
            <el-option label="Returned" value="Returned" />
            <el-option label="Delivery Failed" value="Delivery Failed" />
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
  CircleCheck,
  WarningFilled,
  Headset,
  EditPen
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/store/modules/auth'
import {
  createDeliveredSupportTicket,
  getDeliveredOrderDetail,
  getDeliveredOrderList,
  updateDeliveredOrderNote,
  updateDeliveredOrderStatus,
  type DeliveredOrderRecord,
  type DeliveredStage,
  type DeliveredStatus
} from '@/api/orderDelivered'

const authStore = useAuthStore()
const pagination = reactive({
  page: 1,
  pageSize: 10
})

const filters = reactive<{
  keyword: string
  quickRange: 'last7' | 'last30' | 'thisMonth' | 'all'
  dateRange: [string, string] | []
  stage: DeliveredStage | ''
  status: DeliveredStatus | ''
  segmented: 'all' | 'success' | 'issue'
  inventory: string
}>({
  keyword: '',
  quickRange: 'last7',
  dateRange: [],
  stage: '',
  status: '',
  segmented: 'all',
  inventory: ''
})

const detailVisible = ref(false)
const noteVisible = ref(false)
const ticketVisible = ref(false)
const advancedFilterVisible = ref(false)
const activeRowId = ref('')
const detailRecord = ref<DeliveredOrderRecord | null>(null)
const expandLoadingMap = reactive<Record<string, boolean>>({})
const expandDetailMap = reactive<Record<string, DeliveredOrderRecord>>({})

const noteForm = reactive({
  note: ''
})

const ticketForm = reactive({
  subject: '',
  priority: 'High' as 'High' | 'Medium' | 'Low',
  message: ''
})

const advancedFilterForm = reactive({
  status: '' as DeliveredStatus | '',
  inventory: ''
})

const { data, loading, send: fetchList } = useRequest(
  () =>
    getDeliveredOrderList({
      company: authStore.currentCompany ?? undefined,
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: filters.keyword,
      quickRange: filters.quickRange,
      dateRange: filters.dateRange,
      stage: filters.stage,
      status: filters.status,
      segmented: filters.segmented
    }),
  {
    immediate: true,
    initialData: { total: 0, list: [], segmented: { all: 0, success: 0, issue: 0 } }
  }
)

const { send: fetchOrderDetail } = useRequest(
  (id: string) => getDeliveredOrderDetail(id, authStore.currentCompany ?? undefined),
  { immediate: false }
)

const { send: postNote } = useRequest(
  (payload: { id: string; note: string }) =>
    updateDeliveredOrderNote({ ...payload, company: authStore.currentCompany ?? undefined }),
  { immediate: false }
)

const { send: postStatus } = useRequest(
  (payload: { id: string; status: DeliveredStatus }) =>
    updateDeliveredOrderStatus({ ...payload, company: authStore.currentCompany ?? undefined }),
  { immediate: false }
)

const { send: postTicket } = useRequest(
  (payload: { id: string; subject: string; message: string; priority: 'High' | 'Medium' | 'Low' }) =>
    createDeliveredSupportTicket({ ...payload, company: authStore.currentCompany ?? undefined }),
  { immediate: false }
)

const listData = computed(() => {
  const list = data.value?.list || []
  if (!filters.inventory) return list
  return list.filter((item) => item.inventoryStatus === filters.inventory)
})

const total = computed(() => {
  if (!filters.inventory) return data.value?.total || 0
  return listData.value.length
})

const segmentedOptions = computed(() => {
  const segmented = data.value?.segmented || { all: 0, success: 0, issue: 0 }
  return [
    { label: `All Orders (${segmented.all})`, value: 'all' },
    { label: `Delivered (${segmented.success})`, value: 'success' },
    { label: `Need Follow-up (${segmented.issue})`, value: 'issue' }
  ]
})

let searchTimer: ReturnType<typeof setTimeout> | null = null

const statusTagType = (status: DeliveredStatus) => {
  if (status === 'Delivered') return 'success'
  if (status === 'Partially Delivered') return 'warning'
  if (status === 'Returned') return 'info'
  return 'danger'
}

const inventoryTagType = (status: string) => {
  if (status === 'In Stock') return 'success'
  if (status === 'Reserved') return 'warning'
  return 'danger'
}

const getExpandedDetail = (row: DeliveredOrderRecord) => {
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

const handleExpandChange = async (row: DeliveredOrderRecord, expandedRows: DeliveredOrderRecord[]) => {
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

const openDetailDialog = async (row: DeliveredOrderRecord) => {
  const detail = await fetchOrderDetail(row.id)
  detailRecord.value = detail || row
  detailVisible.value = true
}

const openNoteDialog = (row: DeliveredOrderRecord) => {
  activeRowId.value = row.id
  noteForm.note = row.note || ''
  noteVisible.value = true
}

const handleRowCommand = async (command: string, row: DeliveredOrderRecord) => {
  if (command === 'delivered') {
    await postStatus({ id: row.id, status: 'Delivered' })
    ElMessage.success('Order marked as Delivered')
    fetchList()
    return
  }
  if (command === 'issue') {
    await postStatus({ id: row.id, status: 'Delivery Failed' })
    ElMessage.warning('Order marked as Delivery Failed')
    fetchList()
    return
  }
  if (command === 'note') {
    openNoteDialog(row)
    return
  }
  activeRowId.value = row.id
  ticketForm.subject = `${row.orderId} delivery follow-up`
  ticketForm.message = row.note || ''
  ticketVisible.value = true
}

const submitNote = async () => {
  if (!activeRowId.value) return
  if (!noteForm.note.trim()) {
    ElMessage.warning('Please enter a note')
    return
  }
  await postNote({
    id: activeRowId.value,
    note: noteForm.note
  })
  noteVisible.value = false
  ElMessage.success('Note updated')
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
  advancedFilterForm.status = filters.status
  advancedFilterForm.inventory = filters.inventory
  advancedFilterVisible.value = true
}

const applyAdvancedFilter = () => {
  filters.status = advancedFilterForm.status
  filters.inventory = advancedFilterForm.inventory
  advancedFilterVisible.value = false
  handleImmediateSearch()
}

const handleCreateOrder = () => {
  ElMessage.success('Create Order modal is coming next step')
}

onBeforeUnmount(() => {
  if (searchTimer) clearTimeout(searchTimer)
})
</script>

<style scoped>
.delivered-table :deep(.el-table__inner-wrapper::before) {
  display: none;
}

.delivered-table :deep(.el-table__row td) {
  border-bottom: 1px solid #ececec;
}
</style>
