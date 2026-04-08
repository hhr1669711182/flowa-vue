<template>
  <el-drawer
    v-model="visible"
    title="Notifications"
    direction="rtl"
    size="600px"
    :with-header="true"
  >
    <div class="flex flex-col h-full">
      <!-- Filter/Tabs -->
      <div class="mb-4">
        <el-tabs v-model="activeTab" class="w-full">
          <el-tab-pane label="All" name="all" />
          <el-tab-pane label="Unread" name="unread" />
          <el-tab-pane label="System" name="system" />
        </el-tabs>
      </div>

      <!-- Message List -->
      <div class="flex-1 overflow-y-auto -mx-5 px-5">
        <div v-if="loading" class="py-10 text-center text-gray-400">
          <el-icon class="text-4xl mb-2 animate-spin"><Loading /></el-icon>
          <p>Loading...</p>
        </div>
        <div v-else-if="filteredMessages.length === 0" class="py-10 text-center text-gray-400">
          <el-icon class="text-4xl mb-2"><Bell /></el-icon>
          <p>No notifications</p>
        </div>
        <div
          v-else
          v-for="msg in filteredMessages"
          :key="msg.id"
          class="group relative p-4 mb-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-all cursor-pointer"
          :class="{ 'bg-gray-50/50 border-gray-200': !msg.read }"
          @click="openDetail(msg)"
        >
          <!-- Unread Indicator -->
          <div v-if="!msg.read" class="absolute top-4 right-4 w-2 h-2 rounded-full bg-gray-500"></div>

          <div class="flex gap-3">
            <!-- Icon/Avatar -->
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              :class="getIconBgClass(msg.type)"
            >
              <el-icon :class="getIconColorClass(msg.type)">
                <component :is="getIcon(msg.type)" />
              </el-icon>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-start mb-1">
                <h4 class="text-sm font-semibold text-gray-800 truncate pr-4">{{ msg.title }}</h4>
              </div>
              <p class="text-xs text-gray-500 line-clamp-2 mb-2">{{ msg.content }}</p>

              <div class="flex justify-between items-center text-xs text-gray-400">
                <span>{{ msg.time }}</span>
                <span class="capitalize bg-gray-100 px-2 py-0.5 rounded text-gray-500">{{ msg.type }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="pt-4 border-t border-gray-100 flex justify-between">
        <el-button link type="primary" :loading="markReadLoading" @click="markAllRead">Mark all as read</el-button>
        <el-button link :loading="markReadLoading" @click="clearAll">Clear all</el-button>
      </div>
    </div>
  </el-drawer>

  <!-- Detail Dialog -->
  <el-dialog
    v-model="detailVisible"
    :title="currentMessage?.title"
    width="500px"
    destroy-on-close
    align-center
  >
    <div v-if="currentMessage" class="flex flex-col gap-4">
      <div class="flex items-center gap-2 text-sm text-gray-500 mb-2">
        <el-tag size="small" :type="getTypeTag(currentMessage.type)">{{ currentMessage.type }}</el-tag>
        <span>{{ currentMessage.time }}</span>
      </div>

      <div class="text-gray-700 leading-relaxed whitespace-pre-wrap">
        {{ currentMessage.content }}
      </div>

      <div class="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
        <p class="font-medium mb-2">Additional Information:</p>
        <ul class="list-disc pl-4 space-y-1">
          <li>Reference ID: {{ currentMessage.ttName || currentMessage.id }}</li>
          <li>Source: OMS Trouble Ticket</li>
          <li>Status: {{ currentMessage.status || '-' }}</li>
          <li v-if="currentMessage.priority">Priority: {{ currentMessage.priority }}</li>
        </ul>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="detailVisible = false">Close</el-button>
        <el-button type="primary" @click="handleAction">Take Action</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Bell, Message, Warning, InfoFilled, Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  getUnreadTroubleTickets,
  markAllTroubleTicketsViewed,
  markTroubleTicketViewed,
} from '@/api/dashboard'
import { useAuthStore } from '@/store/modules/auth'
import { useRouter } from 'vue-router'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits(['update:show'])

const visible = computed({
  get: () => props.show,
  set: (val) => emit('update:show', val),
})

interface MessageItem {
  id: string
  ttName?: string
  title: string
  content: string
  time: string
  type: 'system' | 'notification' | 'alert'
  read: boolean
  status?: string
  priority?: string
}

const router = useRouter()
const detailVisible = ref(false)
const activeTab = ref('all')
const currentMessage = ref<MessageItem | null>(null)
const messages = ref<MessageItem[]>([])
const loading = ref(false)
const markReadLoading = ref(false)

function formatTimeAgo(creation: string) {
  try {
    const d = new Date(creation)
    const diff = (Date.now() - d.getTime()) / 3600000
    if (diff < 1) return 'Just now'
    if (diff < 24) return `${Math.floor(diff)}h ago`
    return `${Math.floor(diff / 24)} days ago`
  } catch {
    return ''
  }
}

function priorityToType(priority?: string): 'system' | 'notification' | 'alert' {
  const p = (priority || '').toLowerCase()
  if (p === 'high') return 'alert'
  if (p === 'medium') return 'notification'
  return 'system'
}

async function loadMessages() {
  const authStore = useAuthStore()
  const company = authStore.currentCompany ?? (await authStore.ensureCompany()) ?? ''
  if (!company?.trim()) {
    messages.value = []
    return
  }
  loading.value = true
  try {
    const list = await getUnreadTroubleTickets(company, 50, true)
    messages.value = list.map((tt: any) => ({
      id: `tt-${tt.name}`,
      ttName: tt.name,
      title: (tt.subject || tt.subject_en || '').trim() || `Ticket ${tt.name}`,
      content: (tt.subject || tt.subject_en || tt.status || '').trim() || 'No description',
      time: tt.created_at ? formatTimeAgo(tt.created_at) : '',
      type: priorityToType(tt.priority),
      read: false,
      status: tt.status,
      priority: tt.priority,
    }))
  } catch {
    messages.value = []
    ElMessage.error('Failed to load notifications')
  } finally {
    loading.value = false
  }
}

watch(visible, (val) => {
  if (val) {
    loadMessages()
  }
})

// Computed
const filteredMessages = computed(() => {
  const list = messages.value
  if (activeTab.value === 'unread') {
    return list.filter((m) => !m.read)
  }
  if (activeTab.value === 'system') {
    return list.filter((m) => m.type === 'system')
  }
  return list
})

// Methods
async function openDetail(msg: MessageItem) {
  currentMessage.value = msg
  const company = useAuthStore().currentCompany ?? ''
  if (!msg.read && msg.ttName && company) {
    try {
      const res = await markTroubleTicketViewed(msg.ttName, company)
      if (res?.ok) {
        msg.read = true
        await loadMessages()
      }
    } catch {
      // ignore
    }
  }
  detailVisible.value = true
}

async function markAllRead() {
  const company = useAuthStore().currentCompany ?? ''
  if (!company) {
    ElMessage.warning('Please select a company')
    return
  }
  markReadLoading.value = true
  try {
    const method = markAllTroubleTicketsViewed(company)
    await method.send()
    ElMessage.success('Marked all as read')
    await loadMessages()
  } catch {
    ElMessage.error('Failed to mark as read')
  } finally {
    markReadLoading.value = false
  }
}

async function clearAll() {
  await markAllRead()
}

function handleAction() {
  detailVisible.value = false
  if (currentMessage.value?.ttName) {
    router.push({ path: '/order/required', query: { tt: currentMessage.value.ttName } })
  }
}

// Icon Helpers
const getIcon = (type: string) => {
  switch (type) {
    case 'system':
      return InfoFilled
    case 'alert':
      return Warning
    case 'notification':
      return Message
    default:
      return Bell
  }
}

const getIconBgClass = (type: string) => {
  switch (type) {
    case 'system':
      return 'bg-gray-50'
    case 'alert':
      return 'bg-red-50'
    case 'notification':
      return 'bg-green-50'
    default:
      return 'bg-gray-50'
  }
}

const getIconColorClass = (type: string) => {
  switch (type) {
    case 'system':
      return 'text-gray-500'
    case 'alert':
      return 'text-red-500'
    case 'notification':
      return 'text-green-500'
    default:
      return 'text-gray-500'
  }
}

const getTypeTag = (type: string) => {
  switch (type) {
    case 'system':
      return 'info'
    case 'alert':
      return 'danger'
    case 'notification':
      return 'success'
    default:
      return 'info'
  }
}
</script>
