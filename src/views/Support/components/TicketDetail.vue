<template>
  <Drawer
    :model-value="visible"
    direction="rtl"
    size="100%"
    :show-close="false"
    class="!p-0 ticket-detail-drawer"
    custom-layout
    @update:model-value="val => emit('update:modelValue', val)"
    @close="close"
  >
    <template #header>
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
        <div class="flex items-center gap-4">
          <el-button circle plain @click="close">
            <el-icon><Back /></el-icon>
          </el-button>
          <div>
            <div class="text-xs text-gray-500 mb-1">All Tickets / {{ ticket?.ticketId }}</div>
            <div class="text-xl font-bold text-gray-900">Support Center</div>
          </div>
        </div>
        <div>
          <el-tag v-if="ticket" effect="dark" :type="getStatusType(ticket.status)" round class="!px-4">
            {{ ticket.status === 'Open' ? 'In Progress' : ticket.status }}
          </el-tag>
        </div>
      </div>
    </template>

    <div class="flex h-full bg-gray-50/50" v-if="ticket">
      <!-- Chat Area -->
      <div class="flex-1 flex flex-col p-6 max-w-5xl mx-auto w-full">
        <div class="flex-1 overflow-y-auto mb-4 space-y-6 pr-4 custom-scroll" ref="chatContainer">
          <div v-if="chatDateLabel" class="flex justify-center my-4">
            <span class="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{{ chatDateLabel }}</span>
          </div>

          <div v-if="loadingMessages" class="text-center text-sm text-gray-500 py-8">Loading messages…</div>

          <div
            v-for="msg in messages"
            :key="msg.id"
            v-show="!loadingMessages"
            class="flex gap-4"
            :class="{ 'flex-row-reverse': msg.sender === 'support' }"
          >
            <div v-if="msg.sender === 'user'" class="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
              <img v-if="msg.avatar" :src="msg.avatar" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center bg-green-600 text-white text-xs">U</div>
            </div>
            <div v-else class="w-8 h-8 rounded-full bg-blue-600 overflow-hidden flex-shrink-0 flex items-center justify-center text-white text-xs">
              S
            </div>

            <div class="max-w-[70%]">
              <div
                class="p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm"
                :class="msg.sender === 'user' ? 'bg-white text-gray-800 rounded-tl-none' : 'bg-orange-50 text-gray-800 rounded-tr-none'"
              >
                <div v-if="msg.senderName" class="font-bold mb-1 text-xs text-gray-500">{{ msg.senderName }}</div>
                <template v-if="msg.content">{{ msg.content }}</template>
                <img
                  v-if="msg.image"
                  :src="msg.image"
                  alt=""
                  class="mt-2 max-w-full rounded-lg max-h-64 object-contain border border-gray-100"
                />
                <a
                  v-if="msg.fileUrl"
                  :href="msg.fileUrl"
                  target="_blank"
                  rel="noopener"
                  class="mt-2 inline-flex items-center gap-1 text-xs text-[#1e3a8a] underline"
                >
                  <el-icon><Paperclip /></el-icon> Attachment
                </a>
              </div>
              <div class="text-xs text-gray-400 mt-1" :class="{ 'text-right': msg.sender === 'support' }">
                {{ msg.timestamp }}
              </div>
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 items-center">
          <el-input
            v-model="newMessage"
            placeholder="Write your message..."
            class="flex-1 !border-none !shadow-none"
            :autosize="{ minRows: 1, maxRows: 4 }"
            type="textarea"
            resize="none"
            @keyup.enter.prevent="handleSend"
          />
          <div class="flex gap-2 text-gray-400">
            <el-button circle text><el-icon><Files /></el-icon></el-button>
            <el-button circle text><el-icon><Paperclip /></el-icon></el-button>
            <el-button
              type="primary"
              class="!bg-[#1e3a8a] !w-10 !h-10 !p-0 !rounded-lg"
              :loading="sending"
              :disabled="sending"
              @click="handleSend"
            >
              <el-icon><Position /></el-icon>
            </el-button>
          </div>
        </div>
      </div>

      <!-- Ticket Details Sidebar (aligned with OMS Trouble Ticket DocType, English UI) -->
      <div class="w-96 bg-white border-l border-gray-100 p-6 overflow-y-auto h-full hidden lg:block">
        <div class="flex justify-between items-start mb-6">
          <div class="min-w-0 pr-2">
            <h2 class="text-xl font-bold text-gray-900 leading-tight">
              {{ ticket.subjectDisplay || ticket.subject || 'Ticket' }}
            </h2>
            <p
              v-if="ticketSummaryUnderTitle"
              class="text-sm text-gray-600 leading-relaxed mt-2 whitespace-pre-wrap break-words"
            >
              {{ ticketSummaryUnderTitle }}
            </p>
            <div v-if="ticket.dueTime" class="flex items-center gap-2 mt-2">
              <span class="text-xs text-gray-500">Due</span>
              <span class="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded flex items-center gap-1">
                <el-icon><Clock /></el-icon> {{ ticket.dueTime }}
              </span>
            </div>
          </div>
          <el-dropdown trigger="click">
            <el-button circle plain>
              <el-icon><MoreFilled /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>Edit Ticket</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>

        <div class="space-y-6">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-xs text-gray-500 mb-1">Status</div>
              <el-tag :type="getStatusType(ticket.status)" effect="plain" size="small" class="!bg-opacity-10 !border-none">
                {{ ticket.status }}
              </el-tag>
            </div>
            <div>
              <div class="text-xs text-gray-500 mb-1">Priority</div>
              <el-tag :type="getPriorityType(ticket.priority)" effect="plain" size="small" class="!bg-opacity-10 !border-none">
                {{ ticket.priority }}
              </el-tag>
            </div>
          </div>

          <div>
            <div class="text-xs text-gray-500 mb-1">Stage</div>
            <div class="font-medium text-gray-900">{{ ticket.stage }} / {{ ticket.stageDetail }}</div>
          </div>

          <div>
            <div class="text-xs text-gray-500 mb-1">Type of Inquiry</div>
            <div class="font-medium text-gray-900">{{ ticket.typeOfInquiry || ticket.type }}</div>
          </div>

          <div>
            <div class="text-xs text-gray-500 mb-1">Type ID</div>
            <button
              v-if="typeIdIsSalesOrderLink"
              type="button"
              class="font-medium text-gray-900 underline decoration-gray-300 underline-offset-4 text-left w-full cursor-pointer hover:text-[#1e3a8a] hover:decoration-[#1e3a8a] bg-transparent border-0 p-0 m-0"
              @click="openLinkedSalesOrderDetail"
            >
              {{ typeIdDisplay }}
            </button>
            <div v-else class="font-medium text-gray-900">
              {{ typeIdDisplay || '—' }}
            </div>
          </div>

          <div>
            <div class="text-xs text-gray-500 mb-1">Type Details</div>
            <div class="font-medium text-gray-900">{{ ticket.typeDetails || 'N/A' }}</div>
          </div>

          <div class="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div>
              <div class="text-xs text-gray-500 mb-1">Create Date</div>
              <div class="font-medium text-gray-900 text-sm">{{ ticket.createDate }}</div>
            </div>
            <div>
              <div class="text-xs text-gray-500 mb-1">Update Date</div>
              <div class="font-medium text-gray-900 text-sm">{{ ticket.updateDate }}</div>
            </div>
            <div>
              <div class="text-xs text-gray-500 mb-1">Due Date</div>
              <div class="font-medium text-gray-900 text-sm">{{ ticket.dueDate }}</div>
            </div>
          </div>
        </div>

        <div
          v-if="ticketSidebarImages.length || ticketSidebarFiles.length"
          class="mt-8 pt-6 border-t border-gray-100 space-y-5"
        >
          <div v-if="ticketSidebarImages.length">
            <div class="text-xs text-gray-500 mb-2">Images</div>
            <div class="grid grid-cols-2 gap-2">
              <template v-for="(src, i) in ticketSidebarImages" :key="'ti-' + i + '-' + src">
                <a
                  v-if="!ticketPathLooksLikeImage(src)"
                  :href="src"
                  target="_blank"
                  rel="noopener"
                  class="text-xs text-[#1e3a8a] underline break-all"
                >
                  {{ shortAssetName(src) }}
                </a>
                <a
                  v-else
                  :href="src"
                  target="_blank"
                  rel="noopener"
                  class="block rounded-lg border border-gray-100 overflow-hidden bg-gray-50"
                >
                  <img :src="src" alt="" class="w-full h-24 object-cover hover:opacity-90" />
                </a>
              </template>
            </div>
          </div>

          <div v-if="ticketSidebarFiles.length">
            <div class="text-xs text-gray-500 mb-2">Attachments</div>
            <ul class="space-y-2">
              <li v-for="(f, i) in ticketSidebarFiles" :key="'tf-' + i + '-' + f.url">
                <a
                  :href="f.url"
                  target="_blank"
                  rel="noopener"
                  class="inline-flex items-center gap-1.5 text-sm text-[#1e3a8a] underline break-all"
                >
                  <el-icon><Paperclip /></el-icon>
                  {{ f.label }}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </Drawer>

  <!-- 与「全部订单」相同的销售订单详情抽屉（OMS API，非 printview） -->
  <OrderDetailDrawer
    v-model="orderDetailVisible"
    :loading="orderDetailLoading"
    :row="orderDetailData?.row ?? null"
    :doc="orderDetailData?.doc ?? null"
    :line-items="orderDetailData?.lineItems ?? []"
    :company="authStore.currentCompany ?? undefined"
    @contact-support="onOrderDrawerContactSupport"
    @shipping-saved="reloadOrderDetailDoc"
    @add-items="onOrderDrawerAddItems"
  />

  <OrderAddItemsDialog
    v-model="addItemsVisible"
    :sales-order-name="addItemsSalesOrderName"
    :company="authStore.currentCompany ?? undefined"
    :initial-line-items="addItemsInitialLines"
    :currency="addItemsDialogCurrency"
    @saved="onAddItemsSaved"
  />
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import { Drawer } from '@/components/base/Drawer'
import { Back, MoreFilled, Clock, Files, Paperclip, Position } from '@element-plus/icons-vue'
import type { Ticket, ChatMessage } from '@/api/support'
import {
  appendTicketReply,
  getTicketReplies,
  ticketAssetUrl,
  splitTicketAssetPaths,
  ticketPathLooksLikeImage,
} from '@/api/support'
import { ElMessage } from 'element-plus'
import OrderDetailDrawer from '@/views/order/OrderList/components/OrderDetailDrawer.vue'
import OrderAddItemsDialog from '@/views/order/OrderList/components/OrderAddItemsDialog.vue'
import { getInProgressOrderDetail } from '@/api/order/inProgress'
import { extractOmsSalesOrderDetail } from '@/utils/frappeResponse'
import {
  patchRowFromSalesOrderDoc,
  extractExpandTableRows,
  extractOrderDetailLineItems,
  type ExpandTableRow,
  type OrderDetailLineItem,
} from '@/utils/flowaSalesOrderRowMap'
import { useAuthStore } from '@/store/modules/auth'

const authStore = useAuthStore()
const SALES_ORDER_DOCTYPE = 'Sales Order'

const props = defineProps<{
  modelValue: boolean
  ticket: Ticket | null
}>()

const emit = defineEmits(['update:modelValue'])

const visible = ref(props.modelValue)
const newMessage = ref('')
const messages = ref<ChatMessage[]>([])
const chatContainer = ref<HTMLElement | null>(null)
const loadingMessages = ref(false)
const sending = ref(false)

const typeIdDisplay = computed(() => {
  const t = props.ticket
  if (!t) return ''
  return (t.typeId || t.stageDetail || t.linkedDocName || '').trim()
})

const typeIdReferenceDoctype = computed(() => {
  const t = props.ticket
  if (!t) return ''
  return (t.linkedDocType || '').trim()
})

/** 仅销售订单可点进 OMS 详情；入库单(Material Request)等后续再接 */
const typeIdIsSalesOrderLink = computed(() => {
  if (typeIdReferenceDoctype.value !== SALES_ORDER_DOCTYPE) return false
  return Boolean(typeIdDisplay.value)
})

/** 标题下说明：工单描述（与正文字段一致，不再单独占用底部「Notes」区块） */
const ticketSummaryUnderTitle = computed(() => {
  const t = props.ticket
  if (!t) return ''
  return (t.descriptionDisplay || t.notes || '').trim()
})

const ticketSidebarImages = computed(() => {
  const t = props.ticket
  if (!t?.image) return [] as string[]
  return splitTicketAssetPaths(t.image).map((p) => ticketAssetUrl(p))
})

const ticketSidebarFiles = computed(() => {
  const t = props.ticket
  if (!t?.fileAttachment) return [] as { url: string; label: string }[]
  return splitTicketAssetPaths(t.fileAttachment).map((p) => {
    const url = ticketAssetUrl(p)
    return { url, label: shortAssetName(url) }
  })
})

function shortAssetName(url: string): string {
  const s = (url || '').trim()
  if (!s) return 'File'
  const base = (s.split('?')[0] || s).replace(/^.*\//, '')
  return base || 'File'
}

const orderDetailVisible = ref(false)
const orderDetailLoading = ref(false)
const orderDetailData = ref<{
  row: Record<string, unknown>
  expandRows: ExpandTableRow[]
  doc: Record<string, unknown> | null
  lineItems: OrderDetailLineItem[]
} | null>(null)

const addItemsVisible = ref(false)
const addItemsSalesOrderName = ref('')
const addItemsInitialLines = ref<OrderDetailLineItem[]>([])

const addItemsDialogCurrency = computed(() => {
  const cur = orderDetailData.value?.doc?.currency
  if (cur == null || cur === '') return undefined
  return String(cur)
})

function stubOrderListRow(salesOrderName: string): Record<string, unknown> {
  return {
    id: salesOrderName,
    orderId: salesOrderName,
    platformId: '',
    stage: '',
    statusKey: '',
    status: '',
    inventoryStatus: 'In Stock',
    createDate: '-',
    dueDate: '-',
    quantity: 0,
    chargingWeight: 0,
    customerRegion: '',
  }
}

async function reloadOrderDetailDoc() {
  const id = orderDetailData.value?.row?.id
  if (!id || typeof id !== 'string') return
  orderDetailLoading.value = true
  try {
    const company = authStore.currentCompany ?? undefined
    const listRow = orderDetailData.value?.row ?? stubOrderListRow(id)
    const raw = await getInProgressOrderDetail(id, company).send()
    const doc = extractOmsSalesOrderDetail(raw)
    const patchedRow = doc ? patchRowFromSalesOrderDoc(listRow, doc) : listRow
    const expandRows = extractExpandTableRows(doc, listRow as Record<string, unknown>)
    const lineItems = extractOrderDetailLineItems(doc)
    orderDetailData.value = {
      row: patchedRow as Record<string, unknown>,
      expandRows,
      doc: doc as Record<string, unknown> | null,
      lineItems,
    }
  } catch {
    ElMessage.error('Failed to refresh order')
  } finally {
    orderDetailLoading.value = false
  }
}

async function openLinkedSalesOrderDetail() {
  const id = typeIdDisplay.value
  if (!id || !typeIdIsSalesOrderLink.value) return
  orderDetailLoading.value = true
  orderDetailVisible.value = true
  orderDetailData.value = null
  try {
    const company = authStore.currentCompany ?? undefined
    const listRow = stubOrderListRow(id)
    const raw = await getInProgressOrderDetail(id, company).send()
    const doc = extractOmsSalesOrderDetail(raw)
    const patchedRow = doc ? patchRowFromSalesOrderDoc(listRow, doc) : listRow
    const expandRows = extractExpandTableRows(doc, listRow as Record<string, unknown>)
    const lineItems = extractOrderDetailLineItems(doc)
    orderDetailData.value = {
      row: patchedRow as Record<string, unknown>,
      expandRows,
      doc: doc as Record<string, unknown> | null,
      lineItems,
    }
  } catch {
    ElMessage.error('Failed to load order detail')
    orderDetailVisible.value = false
  } finally {
    orderDetailLoading.value = false
  }
}

function onOrderDrawerContactSupport() {
  ElMessage.info('You can continue this ticket in the message box on the left.')
}

function onOrderDrawerAddItems() {
  const r = orderDetailData.value?.row
  const lines = orderDetailData.value?.lineItems ?? []
  if (!r?.id) {
    ElMessage.warning('No order loaded')
    return
  }
  addItemsSalesOrderName.value = String(r.id)
  addItemsInitialLines.value = lines.length ? [...lines] : []
  addItemsVisible.value = true
}

async function onAddItemsSaved() {
  const id = addItemsSalesOrderName.value
  if (!id || !orderDetailVisible.value) return
  await reloadOrderDetailDoc()
}

const chatDateLabel = computed(() => {
  const raw = messages.value[0]?.sentAtRaw
  if (!raw) return ''
  const d = new Date(raw.replace(' ', 'T'))
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
})

const loadMessages = async () => {
  if (!props.ticket?.id) return
  loadingMessages.value = true
  try {
    messages.value = await getTicketReplies(props.ticket.id)
  } catch (e: unknown) {
    ElMessage.error(e instanceof Error ? e.message : 'Failed to load messages')
    messages.value = []
  } finally {
    loadingMessages.value = false
    scrollToBottom()
  }
}

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val && props.ticket?.id) {
    loadMessages()
  }
})

watch(
  () => props.ticket?.id,
  (id) => {
    if (visible.value && id) loadMessages()
  }
)

watch(visible, (val) => {
  emit('update:modelValue', val)
  if (!val) {
    orderDetailVisible.value = false
    orderDetailData.value = null
    addItemsVisible.value = false
  }
})

const close = () => {
  visible.value = false
}

const handleSend = async () => {
  if (!newMessage.value.trim() || !props.ticket || sending.value) return

  const content = newMessage.value.trim()
  newMessage.value = ''
  sending.value = true
  try {
    await appendTicketReply(props.ticket.id, content)
    await loadMessages()
  } catch (e: unknown) {
    ElMessage.error(e instanceof Error ? e.message : 'Send failed')
    newMessage.value = content
  } finally {
    sending.value = false
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

const getStatusType = (status: string) => {
  switch (status) {
    case 'Open': return 'success'
    case 'Investigating': return 'warning'
    case 'Info. Required': return 'danger'
    case 'Resolved': return 'success'
    case 'Closed': return 'info'
    default: return 'info'
  }
}

const getPriorityType = (priority: string) => {
  switch (priority) {
    case 'High': return 'danger'
    case 'Medium': return 'warning'
    case 'Low': return 'info'
    default: return 'info'
  }
}
</script>

<style scoped>
:deep(.el-drawer__header) {
  margin-bottom: 0;
  padding: 0;
}
:deep(.el-drawer__body) {
  padding: 0;
  height: 100%;
}
.custom-scroll::-webkit-scrollbar {
  width: 6px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 20px;
}
</style>
