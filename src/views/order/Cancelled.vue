<template>
  <div class="p-6 space-y-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div class="space-y-1">
        <h2 class="text-[28px] leading-9 font-bold text-black">
          Orders <span class="text-[#6B6B6B] font-semibold">/ Cancelled</span>
        </h2>
        <p class="text-sm font-medium text-[#6B6B6B]">
          Orders cancelled at any stage of fulfillment. Reactivation must be done manually.
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
          class="cancelled-search !w-[368px] max-w-full"
          placeholder="Search by Order ID, Platform ID, SKU..."
          :prefix-icon="Search"
          clearable
          @input="handleDebouncedSearch"
          @clear="handleImmediateSearch"
        />
        <el-select v-model="filters.quickRange" class="!h-10" @change="handleImmediateSearch">
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
          class="!h-10 !w-[250px]"
          @change="handleImmediateSearch"
        />
        <el-select v-model="filters.stage" class="!h-10" clearable placeholder="Stage" @change="handleImmediateSearch">
          <el-option label="Review and Fix" value="Review and Fix" />
          <el-option label="Warehouse Processing" value="Warehouse Processing" />
          <el-option label="Export Processing" value="Export Processing" />
          <el-option label="Return Processing" value="Return Processing" />
        </el-select>
        <el-select v-model="filters.status" class="!h-10" clearable placeholder="Status" @change="handleImmediateSearch">
          <el-option label="Cancelled" value="Cancelled" />
          <el-option label="Pending Reactivation" value="Pending Reactivation" />
          <el-option label="Reactivated" value="Reactivated" />
          <el-option label="Archived" value="Archived" />
        </el-select>
        <el-button class="!h-10 !w-10 !px-0" @click="openAdvancedFilterDialog">
          <el-icon><Operation /></el-icon>
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
        class="cancelled-table"
        :header-cell-style="{ background: '#F1F1F1', color: '#000000', fontWeight: '600' }"
        @expand-change="handleExpandChange"
      >
        <el-table-column type="expand" width="44">
          <template #default="{ row }">
            <div
              v-loading="!!expandLoadingMap[row.id]"
              class="bg-[#FAFAFA] rounded-lg border border-[#ECECEC] m-4 p-4 space-y-3"
            >
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
                  <span class="text-[#6B6B6B]">Product</span>
                  <span class="font-semibold text-black">{{ getExpandedDetail(row).productName }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-[#6B6B6B]">Reason</span>
                  <span class="font-semibold text-black">{{ getExpandedDetail(row).reason }}</span>
                </div>
                <div class="flex justify-between col-span-2">
                  <span class="text-[#6B6B6B]">Cancellation Note</span>
                  <span class="font-semibold text-black">{{ getExpandedDetail(row).cancelNote }}</span>
                </div>
              </div>
              <div class="flex justify-end gap-2">
                <el-button size="small" @click="openDetailDialog(row)">View Detail</el-button>
                <el-button
                  size="small"
                  type="primary"
                  :disabled="!row.reopenable"
                  @click="openReactivateDialog(row)"
                >
                  Reactivate
                </el-button>
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
        <el-table-column prop="stage" label="Stages" min-width="190" />
        <el-table-column label="Status" min-width="190">
          <template #default="{ row }">
            <el-tag effect="plain" class="!rounded-md" :type="statusTagType(row.status)">
              {{ row.status }}
            </el-tag>
            <div class="text-xs text-[#6B6B6B] mt-1">{{ row.reason }}</div>
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
        <el-table-column label="Date" width="180">
          <template #default="{ row }">
            <div class="text-xs text-[#6B6B6B]">Create: {{ row.createDate }}</div>
            <div class="text-xs text-[#6B6B6B] mt-1">Cancelled: {{ row.cancelledDate }}</div>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="200" align="right">
          <template #default="{ row }">
            <div class="flex items-center justify-end gap-2">
              <el-button size="small" type="primary" :disabled="!row.reopenable" @click="openReactivateDialog(row)">
                Reactivate
              </el-button>
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
                    <el-dropdown-item command="reactivate" :disabled="!row.reopenable">
                      <el-icon class="mr-2"><RefreshRight /></el-icon>
                      Reactivate Order
                    </el-dropdown-item>
                    <el-dropdown-item command="ticket">
                      <el-icon class="mr-2"><Headset /></el-icon>
                      Create Ticket
                    </el-dropdown-item>
                    <el-dropdown-item command="archive" class="!text-[#C62828]">
                      <el-icon class="mr-2"><CircleCloseFilled /></el-icon>
                      Archive
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="p-4 border-t border-[#ECECEC] flex flex-wrap gap-4 items-center justify-between">
        <div class="text-sm text-[#6B6B6B]">Total {{ total }} cancelled orders</div>
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

    <el-dialog v-model="detailVisible" title="Cancelled Order Detail" width="680px" destroy-on-close>
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
            <span class="text-[#6B6B6B]">Stage</span>
            <span class="font-semibold text-black">{{ detailRecord?.stage || '--' }}</span>
          </div>
          <div class="flex justify-between border-b border-[#ECECEC] pb-2">
            <span class="text-[#6B6B6B]">Reason</span>
            <span class="font-semibold text-black">{{ detailRecord?.reason || '--' }}</span>
          </div>
          <div class="flex justify-between border-b border-[#ECECEC] pb-2 col-span-2">
            <span class="text-[#6B6B6B]">Cancellation Note</span>
            <span class="font-semibold text-black">{{ detailRecord?.cancelNote || '--' }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="detailVisible = false">Close</el-button>
          <el-button
            type="primary"
            :disabled="!detailRecord?.reopenable"
            @click="detailRecord && openReactivateDialog(detailRecord)"
          >
            Reactivate
          </el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="reactivateVisible" title="Reactivate Order" width="560px" destroy-on-close>
      <el-form :model="reactivateForm" label-position="top">
        <el-form-item label="Target Stage">
          <el-select v-model="reactivateForm.targetStage" class="w-full">
            <el-option label="Review and Fix" value="Review and Fix" />
            <el-option label="Warehouse Processing" value="Warehouse Processing" />
            <el-option label="Export Processing" value="Export Processing" />
            <el-option label="Return Processing" value="Return Processing" />
          </el-select>
        </el-form-item>
        <el-form-item label="Reactivation Note">
          <el-input
            v-model="reactivateForm.note"
            type="textarea"
            :rows="5"
            placeholder="Describe why this order is ready for reactivation..."
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
  CircleCloseFilled,
  Headset,
  MoreFilled,
  Operation,
  Plus,
  RefreshRight,
  Search,
  View
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/store/modules/auth'
import {
  createCancelledSupportTicket,
  getCancelledOrderDetail,
  getCancelledOrderList,
  reactivateCancelledOrder,
  updateCancelledOrderStatus,
  type CancelledInventoryStatus,
  type CancelledOrderRecord,
  type CancelledOrderStage,
  type CancelledOrderStatus
} from '@/api/orderCancelled'

const authStore = useAuthStore()
const pagination = reactive({
  page: 1,
  pageSize: 10
})

const filters = reactive<{
  keyword: string
  quickRange: 'last7' | 'last30' | 'thisMonth' | 'all'
  dateRange: [string, string] | []
  stage: CancelledOrderStage | ''
  status: CancelledOrderStatus | ''
  segmented: 'reviewFix' | 'warehouse' | 'export' | 'return'
  inventory: CancelledInventoryStatus | ''
}>({
  keyword: '',
  quickRange: 'last7',
  dateRange: [],
  stage: '',
  status: '',
  segmented: 'reviewFix',
  inventory: ''
})

const detailVisible = ref(false)
const reactivateVisible = ref(false)
const ticketVisible = ref(false)
const advancedFilterVisible = ref(false)
const activeRowId = ref('')
const detailRecord = ref<CancelledOrderRecord | null>(null)
const expandLoadingMap = reactive<Record<string, boolean>>({})
const expandDetailMap = reactive<Record<string, CancelledOrderRecord>>({})

const reactivateForm = reactive({
  targetStage: 'Review and Fix' as CancelledOrderStage,
  note: ''
})

const ticketForm = reactive({
  subject: '',
  priority: 'High' as 'High' | 'Medium' | 'Low',
  message: ''
})

const advancedFilterForm = reactive({
  inventory: '' as CancelledInventoryStatus | ''
})

const { data, loading, send: fetchList } = useRequest(
  () =>
    getCancelledOrderList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: filters.keyword,
      quickRange: filters.quickRange,
      dateRange: filters.dateRange,
      stage: filters.stage,
      status: filters.status,
      inventory: filters.inventory,
      segmented: filters.segmented
    }),
  {
    immediate: true,
    initialData: {
      total: 0,
      list: [],
      segmented: { reviewFix: 0, warehouse: 0, export: 0, return: 0 }
    }
  }
)

const { send: fetchOrderDetail } = useRequest(
  (id: string) => getCancelledOrderDetail(id, authStore.currentCompany ?? undefined),
  { immediate: false }
)

const { send: postReactivate } = useRequest(
  (payload: { id: string; note: string; targetStage: CancelledOrderStage }) =>
    reactivateCancelledOrder({ ...payload, company: authStore.currentCompany ?? undefined }),
  { immediate: false }
)

const { send: postStatus } = useRequest(
  (payload: { id: string; status: CancelledOrderStatus }) =>
    updateCancelledOrderStatus({ ...payload, company: authStore.currentCompany ?? undefined }),
  { immediate: false }
)

const { send: postTicket } = useRequest(
  (payload: { id: string; subject: string; message: string; priority: 'High' | 'Medium' | 'Low' }) =>
    createCancelledSupportTicket({ ...payload, company: authStore.currentCompany ?? undefined }),
  { immediate: false }
)

const listData = computed(() => data.value?.list || [])
const total = computed(() => data.value?.total || 0)

const segmentedOptions = computed(() => {
  const segmented = data.value?.segmented || { reviewFix: 0, warehouse: 0, export: 0, return: 0 }
  return [
    { label: `Review and Fix (${segmented.reviewFix})`, value: 'reviewFix' },
    { label: `Warehouse Processing (${String(segmented.warehouse).padStart(2, '0')})`, value: 'warehouse' },
    { label: `Export Processing (${String(segmented.export).padStart(2, '0')})`, value: 'export' },
    { label: `Return Processing (${String(segmented.return).padStart(2, '0')})`, value: 'return' }
  ]
})

let searchTimer: ReturnType<typeof setTimeout> | null = null

const statusTagType = (status: CancelledOrderStatus) => {
  if (status === 'Reactivated') return 'success'
  if (status === 'Pending Reactivation') return 'warning'
  if (status === 'Archived') return 'info'
  return 'danger'
}

const inventoryTagType = (status: string) => {
  if (status === 'In Stock') return 'success'
  if (status === 'Reserved') return 'warning'
  return 'danger'
}

const getExpandedDetail = (row: CancelledOrderRecord) => {
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

const handleExpandChange = async (row: CancelledOrderRecord, expandedRows: CancelledOrderRecord[]) => {
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

const openDetailDialog = async (row: CancelledOrderRecord) => {
  const detail = await fetchOrderDetail(row.id)
  detailRecord.value = detail || row
  detailVisible.value = true
}

const openReactivateDialog = (row: CancelledOrderRecord) => {
  if (!row.reopenable) return
  activeRowId.value = row.id
  reactivateForm.targetStage = row.stage
  reactivateForm.note = row.cancelNote || ''
  reactivateVisible.value = true
}

const handleRowCommand = async (command: string, row: CancelledOrderRecord) => {
  if (command === 'detail') {
    await openDetailDialog(row)
    return
  }
  if (command === 'reactivate') {
    openReactivateDialog(row)
    return
  }
  if (command === 'archive') {
    await postStatus({ id: row.id, status: 'Archived' })
    ElMessage.warning('Order archived')
    fetchList()
    return
  }
  activeRowId.value = row.id
  ticketForm.subject = `${row.orderId} cancellation follow-up`
  ticketForm.message = row.cancelNote || ''
  ticketVisible.value = true
}

const submitReactivate = async () => {
  if (!activeRowId.value) return
  if (!reactivateForm.note.trim()) {
    ElMessage.warning('Please enter a reactivation note')
    return
  }
  await postReactivate({
    id: activeRowId.value,
    targetStage: reactivateForm.targetStage,
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
  advancedFilterForm.inventory = filters.inventory
  advancedFilterVisible.value = true
}

const applyAdvancedFilter = () => {
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
.cancelled-table :deep(.el-table__inner-wrapper::before) {
  display: none;
}

.cancelled-table :deep(.el-table__row td) {
  border-bottom: 1px solid #ececec;
}

.cancelled-search :deep(.el-input__wrapper) {
  border-width: 1.5px;
}
</style>
