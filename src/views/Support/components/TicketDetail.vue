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
          <div class="flex justify-center my-4">
            <span class="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Jan 15</span>
          </div>

          <div v-for="msg in messages" :key="msg.id" class="flex gap-4" :class="{ 'flex-row-reverse': msg.sender === 'support' }">
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
                <div v-if="msg.sender === 'support'" class="font-bold mb-1 text-xs text-gray-500">You</div>
                {{ msg.content }}
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
            <el-button type="primary" class="!bg-[#1e3a8a] !w-10 !h-10 !p-0 !rounded-lg" @click="handleSend">
              <el-icon><Position /></el-icon>
            </el-button>
          </div>
        </div>
      </div>

      <!-- Ticket Details Sidebar -->
      <div class="w-96 bg-white border-l border-gray-100 p-6 overflow-y-auto h-full hidden lg:block">
        <div class="flex justify-between items-start mb-6">
          <div>
            <h2 class="text-xl font-bold text-gray-900">{{ ticket.ticketId }}</h2>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-xs text-gray-500">Due Date</span>
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
                <el-dropdown-item class="text-red-500">Delete</el-dropdown-item>
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
            <div class="font-medium text-gray-900 underline decoration-gray-300 underline-offset-4">
              {{ ticket.typeId || ticket.stageDetail }}
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

        <div class="mt-8 pt-6 border-t border-gray-100">
          <h3 class="text-lg font-bold text-gray-900 mb-4">Notes</h3>
          <div class="text-sm text-gray-600 leading-relaxed">
            {{ ticket.notes || 'No additional notes.' }}
          </div>
        </div>
      </div>
    </div>
  </Drawer>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { Drawer } from '@/components/base/Drawer'
import { Back, MoreFilled, Clock, Files, Paperclip, Position } from '@element-plus/icons-vue'
import type { Ticket, ChatMessage } from '@/api/support'
import { sendMessage } from '@/api/support'

const props = defineProps<{
  modelValue: boolean
  ticket: Ticket | null
}>()

const emit = defineEmits(['update:modelValue'])

const visible = ref(props.modelValue)
const newMessage = ref('')
const messages = ref<ChatMessage[]>([])
const chatContainer = ref<HTMLElement | null>(null)

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val && props.ticket) {
    // Load messages
    messages.value = props.ticket.messages || []
    scrollToBottom()
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const close = () => {
  visible.value = false
}

const handleSend = async () => {
  if (!newMessage.value.trim() || !props.ticket) return
  
  // Optimistic UI update
  const tempMsg: ChatMessage = {
    id: Date.now(),
    sender: 'support',
    senderName: 'You',
    content: newMessage.value,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  messages.value.push(tempMsg)
  const content = newMessage.value
  newMessage.value = ''
  scrollToBottom()

  // API Call simulation
  await sendMessage(props.ticket.id, content)
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
