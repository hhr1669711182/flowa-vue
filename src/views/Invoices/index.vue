<template>
  <div class="p-6 space-y-6">
    <div class="space-y-1">
      <h2 class="text-[28px] leading-9 font-bold text-black">Invoices</h2>
      <p class="text-sm font-medium text-[#6B6B6B]">
        Manage, download, and review all your billing from Flowa in one place.
      </p>
    </div>

    <div class="bg-white rounded-xl border border-[#ECECEC] shadow-sm overflow-hidden">
      <div class="px-4 py-3 bg-[#F1F1F1] border-b border-[#ECECEC] flex flex-wrap gap-3 items-center justify-between">
        <div class="flex flex-wrap gap-3 items-center">
          <el-input
            v-model="filters.keyword"
            class="!w-[368px] max-w-full"
            placeholder="Search by Invoice ID, Reference..."
            :prefix-icon="Search"
            clearable
            @input="handleDebouncedSearch"
            @clear="handleImmediateSearch"
          />
          <el-select
            v-model="filters.quickRange"
            class="!w-[180px]"
            @change="handleImmediateSearch"
          >
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
          <el-select
            v-model="filters.status"
            class="!w-[140px]"
            placeholder="Status"
            clearable
            @change="handleImmediateSearch"
          >
            <el-option label="Paid" value="Paid" />
            <el-option label="Pending" value="Pending" />
            <el-option label="Overdue" value="Overdue" />
          </el-select>
        </div>
        <div class="flex items-center gap-2">
          <el-button class="!h-10 !px-4 !border-[#16215B1A]" @click="handleDownloadAll">
            <el-icon class="mr-1"><Download /></el-icon>
            Download All
          </el-button>
          <el-dropdown trigger="click" @command="handleTopCommand">
            <el-button class="!h-8 !w-8 !p-0 !border-[#16215B1A]">
              <el-icon><MoreFilled /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="support" class="!text-[#C62828]">
                  <el-icon class="mr-2"><Headset /></el-icon>
                  Contact Support
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="listData"
        row-key="id"
        class="invoice-table"
        :header-cell-style="{ background: '#F1F1F1', color: '#000000', fontWeight: '600' }"
        @expand-change="handleExpandChange"
      >
        <el-table-column type="expand" width="44">
          <template #default="{ row }">
            <div v-loading="!!expandLoadingMap[row.id]" class="bg-[#FAFAFA] rounded-lg border border-[#ECECEC] m-4 p-4 space-y-3">
              <div class="flex items-center justify-between">
                <div class="text-sm text-[#6B6B6B]">
                  {{ getExpandedDetail(row).periodStart }} - {{ getExpandedDetail(row).periodEnd }}
                </div>
                <div class="text-sm font-semibold text-black">
                  {{ getExpandedDetail(row).status }}
                </div>
              </div>
              <el-table
                :data="getExpandedDetail(row).lineItems || []"
                size="small"
                :header-cell-style="{ background: '#F7F7F7', color: '#000000' }"
              >
                <el-table-column prop="description" label="Description" min-width="220" />
                <el-table-column prop="quantity" label="Qty" width="80" align="center" />
                <el-table-column label="Unit Price" width="120" align="right">
                  <template #default="{ row: detailRow }">
                    {{ formatMoney(detailRow.unitPrice) }}
                  </template>
                </el-table-column>
                <el-table-column label="Amount" width="120" align="right">
                  <template #default="{ row: detailRow }">
                    {{ formatMoney(detailRow.amount) }}
                  </template>
                </el-table-column>
              </el-table>
              <div class="flex items-center justify-end text-sm font-semibold text-black">
                Total: {{ formatMoney(getExpandedDetail(row).total) }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Invoice ID" min-width="240">
          <template #default="{ row }">
            <div class="font-semibold text-black">{{ row.invoiceId }}</div>
            <div class="text-xs text-[#6B6B6B] mt-1">{{ row.reference }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="invoiceDate" label="Invoice Date" width="120" align="center" />
        <el-table-column label="Issued for Period" min-width="240" align="center">
          <template #default="{ row }">
            {{ row.periodStart }} - {{ row.periodEnd }}
          </template>
        </el-table-column>
        <el-table-column prop="dueDate" label="Due Date" width="120" align="center" />
        <el-table-column label="Total" width="120" align="center">
          <template #default="{ row }">
            <div class="font-semibold">${{ row.total.toLocaleString() }}</div>
            <el-tag
              size="small"
              effect="plain"
              class="mt-1 !rounded-full"
              :type="statusTagType(row.status)"
            >
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="100" align="right">
          <template #default="{ row }">
            <el-dropdown trigger="click" @command="(command) => handleRowCommand(command, row)">
              <el-button class="!h-8 !w-8 !p-0 !border-[#16215B1A]">
                <el-icon><MoreFilled /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="view">
                    <el-icon class="mr-2"><View /></el-icon>
                    View Invoice
                  </el-dropdown-item>
                  <el-dropdown-item command="download">
                    <el-icon class="mr-2"><Download /></el-icon>
                    Download PDF
                  </el-dropdown-item>
                  <el-dropdown-item command="duplicate">
                    <el-icon class="mr-2"><CopyDocument /></el-icon>
                    Duplicate Invoice
                  </el-dropdown-item>
                  <el-dropdown-item command="support" class="!text-[#C62828]">
                    <el-icon class="mr-2"><Headset /></el-icon>
                    Contact Support
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <div class="p-4 border-t border-[#ECECEC] flex flex-wrap gap-4 items-center justify-between">
        <div class="text-sm text-[#6B6B6B]">
          {{ summaryText }}
        </div>
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

    <InvoiceDetailDialog
      v-model="detailVisible"
      :loading="detailLoading"
      :invoice="selectedInvoice"
      @download="handleDownloadOne"
    />

    <el-dialog
      v-model="supportVisible"
      title="Contact Support"
      width="520px"
      destroy-on-close
    >
      <el-form :model="supportForm" label-position="top">
        <el-form-item label="Category">
          <el-select v-model="supportForm.category" class="w-full">
            <el-option label="Invoice Issue" value="Invoice Issue" />
            <el-option label="Payment Inquiry" value="Payment Inquiry" />
            <el-option label="Download Problem" value="Download Problem" />
          </el-select>
        </el-form-item>
        <el-form-item label="Message">
          <el-input
            v-model="supportForm.message"
            type="textarea"
            :rows="5"
            placeholder="Describe your issue..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="supportVisible = false">Cancel</el-button>
          <el-button type="primary" @click="submitSupport">Submit</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { useRequest } from 'alova/client'
import { ElMessage } from 'element-plus'
import { Search, Download, MoreFilled, View, CopyDocument, Headset } from '@element-plus/icons-vue'
import {
  downloadAllInvoices,
  downloadInvoiceById,
  getInvoiceDetail,
  getInvoiceList,
  getInvoiceSummary,
  type InvoiceRecord,
  type InvoiceStatus
} from '@/api/invoices'
import InvoiceDetailDialog from './components/InvoiceDetailDialog.vue'

const pagination = reactive({
  page: 1,
  pageSize: 10
})

const filters = reactive<{
  keyword: string
  quickRange: 'last7' | 'last30' | 'thisMonth' | 'all'
  dateRange: [string, string] | []
  status: InvoiceStatus | ''
}>({
  keyword: '',
  quickRange: 'last7',
  dateRange: [],
  status: ''
})

const selectedInvoice = ref<InvoiceRecord | null>(null)
const detailVisible = ref(false)
const supportVisible = ref(false)
const expandLoadingMap = reactive<Record<string, boolean>>({})
const expandDetailMap = reactive<Record<string, InvoiceRecord>>({})

const supportForm = reactive({
  category: 'Invoice Issue',
  message: ''
})

const { data, loading, send: fetchList } = useRequest(
  () =>
    getInvoiceList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: filters.keyword,
      quickRange: filters.quickRange,
      status: filters.status,
      dateRange: filters.dateRange
    }),
  {
    immediate: true,
    initialData: { total: 0, list: [] }
  }
)

const { data: summaryData } = useRequest(getInvoiceSummary, {
  immediate: true,
  initialData: {
    totalInvoices: 0,
    totalAmount: 0,
    paidCount: 0,
    pendingCount: 0,
    overdueCount: 0
  }
})

const {
  loading: detailLoading,
  send: fetchInvoiceDetail
} = useRequest((id: string) => getInvoiceDetail(id), {
  immediate: false
})

const { send: sendDownloadAll } = useRequest(downloadAllInvoices, {
  immediate: false
})

const { send: sendDownloadOne } = useRequest((id: string) => downloadInvoiceById(id), {
  immediate: false
})

const listData = computed(() => data.value?.list || [])
const total = computed(() => data.value?.total || 0)

const summaryText = computed(() => {
  const summary = summaryData.value
  return `Total ${summary.totalInvoices} invoices · $${summary.totalAmount.toLocaleString()} · Paid ${summary.paidCount} · Pending ${summary.pendingCount} · Overdue ${summary.overdueCount}`
})

let searchTimer: ReturnType<typeof setTimeout> | null = null

const handleDebouncedSearch = () => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  searchTimer = setTimeout(() => {
    pagination.page = 1
    fetchList()
  }, 300)
}

const handleImmediateSearch = () => {
  pagination.page = 1
  fetchList()
}

const statusTagType = (status: InvoiceStatus) => {
  if (status === 'Paid') {
    return 'success'
  }
  if (status === 'Pending') {
    return 'warning'
  }
  return 'danger'
}

const formatMoney = (value: number) => {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const getExpandedDetail = (row: InvoiceRecord) => {
  return expandDetailMap[row.id] || row
}

const handleDownloadAll = async () => {
  const result = await sendDownloadAll()
  ElMessage.success(`Download ready: ${result.fileName}`)
}

const handleDownloadOne = async (invoice: InvoiceRecord) => {
  const result = await sendDownloadOne(invoice.id)
  ElMessage.success(`Download ready: ${result.fileName}`)
}

const handleRowCommand = async (command: string, row: InvoiceRecord) => {
  if (command === 'view') {
    const detail = await fetchInvoiceDetail(row.id)
    selectedInvoice.value = detail || row
    detailVisible.value = true
    return
  }

  if (command === 'download') {
    await handleDownloadOne(row)
    return
  }

  if (command === 'duplicate') {
    ElMessage.success(`Duplicated ${row.invoiceId}`)
    return
  }

  ElMessage.warning('Support request created')
}

const handleTopCommand = (command: string) => {
  if (command === 'support') {
    supportVisible.value = true
  }
}

const handleExpandChange = async (row: InvoiceRecord, expandedRows: InvoiceRecord[]) => {
  const expanded = expandedRows.some((item) => item.id === row.id)
  if (!expanded || expandDetailMap[row.id] || expandLoadingMap[row.id]) {
    return
  }
  expandLoadingMap[row.id] = true
  try {
    const detail = await fetchInvoiceDetail(row.id)
    if (detail) {
      expandDetailMap[row.id] = detail
    }
  } finally {
    expandLoadingMap[row.id] = false
  }
}

const submitSupport = () => {
  if (!supportForm.message.trim()) {
    ElMessage.warning('Please enter your issue details')
    return
  }
  supportVisible.value = false
  supportForm.message = ''
  ElMessage.success('Support request created')
}

onBeforeUnmount(() => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
})
</script>

<style scoped>
.invoice-table :deep(.el-table__inner-wrapper::before) {
  display: none;
}

.invoice-table :deep(.el-table__row td) {
  border-bottom: 1px solid #ececec;
}
</style>
