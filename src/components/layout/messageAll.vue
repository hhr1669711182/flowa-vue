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
        <div v-if="filteredMessages.length === 0" class="py-10 text-center text-gray-400">
          <el-icon class="text-4xl mb-2"><Bell /></el-icon>
          <p>No notifications</p>
        </div>
        
        <div
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
              
              <!-- Image Preview (if any) -->
              <div v-if="msg.image" class="mb-2 rounded-lg overflow-hidden h-24 w-full relative bg-gray-100">
                 <img :src="msg.image" class="w-full h-full object-cover" alt="attachment" />
              </div>

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
        <el-button link type="primary" @click="markAllRead">Mark all as read</el-button>
        <el-button link @click="clearAll">Clear all</el-button>
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
      
      <div v-if="currentMessage.image" class="rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
        <img :src="currentMessage.image" class="w-full h-auto object-contain max-h-60" alt="Detail Image" />
      </div>

      <div class="text-gray-700 leading-relaxed whitespace-pre-wrap">
        {{ currentMessage.content }}
      </div>

      <!-- Extended Mock Content for "More Details" -->
      <div class="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
        <p class="font-medium mb-2">Additional Information:</p>
        <ul class="list-disc pl-4 space-y-1">
          <li>Reference ID: #MSG-{{ currentMessage.id }}</li>
          <li>Source: System Automation</li>
          <li>Priority: High</li>
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
import { ref, computed } from 'vue'
import { Bell, Message, Warning, InfoFilled, Check } from '@element-plus/icons-vue'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits(['update:show'])

const visible = computed({
  get: () => props.show,
  set: (val) => emit('update:show', val)
})

interface MessageItem {
  id: number
  title: string
  content: string
  time: string
  type: 'system' | 'notification' | 'alert'
  read: boolean
  image?: string
}

const detailVisible = ref(false)
const activeTab = ref('all')
const currentMessage = ref<MessageItem | null>(null)

// Mock Data Generation
const generateMessages = (): MessageItem[] => {
  const types: ('system' | 'notification' | 'alert')[] = ['system', 'notification', 'alert']
  const images = [
    'https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80', // Payment
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80', // Analytics
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1632&q=80', // Meeting
    ''
  ]
  
  return Array.from({ length: 23 }, (_, i) => {
    const type = types[Math.floor(Math.random() * types.length)]
    const hasImage = Math.random() > 0.7
    return {
      id: i + 1,
      title: `Message Notification #${i + 1}`,
      content: `This is a simulated message content for item #${i + 1}. It contains some details about system updates, new orders, or alerts that require your attention.`,
      time: `${Math.floor(Math.random() * 24)}h ago`,
      type,
      read: Math.random() > 0.5,
      image: hasImage ? images[Math.floor(Math.random() * (images.length - 1))] : undefined
    }
  }) as any
}

const messages = ref<MessageItem[]>(generateMessages())

// Computed
const filteredMessages = computed(() => {
  if (activeTab.value === 'unread') {
    return messages.value.filter(m => !m.read)
  }
  if (activeTab.value === 'system') {
    return messages.value.filter(m => m.type === 'system')
  }
  return messages.value
})

// Methods
const openDetail = (msg: MessageItem) => {
  currentMessage.value = msg
  if (!msg.read) {
    msg.read = true
  }
  detailVisible.value = true
}

const markAllRead = () => {
  messages.value.forEach(m => m.read = true)
}

const clearAll = () => {
  messages.value = []
}

const handleAction = () => {
  detailVisible.value = false
  // Implement action logic
}

// Icon Helpers
const getIcon = (type: string) => {
  switch (type) {
    case 'system': return InfoFilled
    case 'alert': return Warning
    case 'notification': return Message
    default: return Bell
  }
}

const getIconBgClass = (type: string) => {
  switch (type) {
    case 'system': return 'bg-gray-50'
    case 'alert': return 'bg-red-50'
    case 'notification': return 'bg-green-50'
    default: return 'bg-gray-50'
  }
}

const getIconColorClass = (type: string) => {
  switch (type) {
    case 'system': return 'text-gray-500'
    case 'alert': return 'text-red-500'
    case 'notification': return 'text-green-500'
    default: return 'text-gray-500'
  }
}

const getTypeTag = (type: string) => {
  switch (type) {
    case 'system': return 'info'
    case 'alert': return 'danger'
    case 'notification': return 'success'
    default: return 'info'
  }
}
</script>
