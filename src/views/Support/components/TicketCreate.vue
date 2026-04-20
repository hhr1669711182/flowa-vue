<template>
  <el-dialog
    :model-value="visible"
    width="860px"
    destroy-on-close
    class="ticket-create-dialog"
    @update:model-value="updateVisible"
  >
    <template #header>
      <div class="flex justify-between items-start pr-2">
        <div>
          <div class="text-34px font-700 text-#111827">
            {{ mode === "edit" ? "Edit Support Ticket" : "Create a Support Ticket" }}
          </div>
          <div class="text-14px text-#6B7280 leading-20px mt-1">
            Submit a ticket to contact the Flowa Support team and resolve an issue.
          </div>
          <div class="text-14px text-#6B7280 leading-20px">
            Please provide clear details so we can assist you faster.
          </div>
        </div>
      </div>
    </template>

    <el-form :model="form" label-position="top" class="mt-1 box-border">
      <el-form-item label="Ticket ID">
        <el-input v-model="form.ticketId" />
      </el-form-item>

      <div class="grid grid-cols-2 gap-4">
        <el-form-item label="Type of enquire">
          <el-select v-model="form.stage" class="w-full">
            <el-option v-for="item in TicketStageOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="Type ID">
          <el-input v-model="form.typeId" />
        </el-form-item>
      </div>

      <el-form-item label="Notes">
        <el-input v-model="form.notes" type="textarea" :rows="4" placeholder="Additional notes..." />
      </el-form-item>

      <div v-if="attachmentState === 'idle'" class="w-full border-1.5 border-dashed border-#979EF0 rounded-xl py-3 px-4 box-border">
        <button class="w-full bg-transparent border-none p-0 cursor-pointer" @click="openUpload">
          <div class="flex items-center justify-center gap-2">
            <el-icon class="text-#1E3A8A"><UploadFilled /></el-icon>
            <span class="text-14px font-600 text-#16215B">Attach Files</span>
          </div>
          <div class="text-12px text-#9CA3AF text-center mt-1">15 MB Limit</div>
        </button>
      </div>

      <div v-else-if="attachmentState === 'uploading'" class="w-full border border-#E5E7EB rounded-xl px-3 py-3 box-border">
        <div class="flex items-center gap-3">
          <span class="text-#6B7280 text-14px">{{ uploadProgress }}%</span>
          <el-progress :percentage="uploadProgress" :stroke-width="4" :show-text="false" class="flex-1" />
          <el-button class="!w-8 !h-8 !p-0" @click="cancelUpload">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
      </div>

      <div v-else-if="attachmentState === 'completed'" class="w-full border border-#E5E7EB rounded-xl px-3 py-3 box-border">
        <div class="flex items-center gap-3">
          <span class="text-#6B7280 text-14px">100%</span>
          <el-progress :percentage="100" :stroke-width="4" :show-text="false" class="flex-1" />
          <span class="text-14px font-600 text-#1E3A8A">Completed!</span>
        </div>
      </div>

      <div v-if="form.attachmentName && attachmentState === 'completed'" class="w-full border border-#E5E7EB rounded-xl px-3 py-2 mt-3 box-border">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 min-w-0">
            <el-icon class="text-#1E3A8A"><Document /></el-icon>
            <span class="text-14px text-#16215B truncate">{{ form.attachmentName }}</span>
          </div>
          <div class="flex items-center gap-1">
            <el-button class="!w-7 !h-7 !p-0 !border-none" @click="removeAttachment">
              <el-icon class="text-#DC2626"><Delete /></el-icon>
            </el-button>
            <el-button class="!w-7 !h-7 !p-0 !border-none" @click="openUpload">
              <el-icon class="text-#6B7280"><RefreshRight /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </el-form>

    <template #footer>
      <div class="flex justify-between gap-3">
        <el-button class="!px-8" :disabled="submitting" @click="updateVisible(false)">Cancel</el-button>
        <el-button
          type="primary"
          class="!bg-[#16215B] !border-none !px-8"
          :loading="submitting"
          @click="handleSubmit"
          >{{ mode === "edit" ? "Save Ticket" : "Create Ticket" }}</el-button
        >
      </div>
    </template>
  </el-dialog>

  <TicketUploadFlowDialog
    :visible="uploadVisible"
    @update:visible="handleUploadVisibleChange"
    @done="handleUploadDone"
  />
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { createTicket, updateTicket, TicketStageOptions, type Ticket, type TicketPriority, type TicketStage } from '@/api/support'
import { ElMessage } from 'element-plus'
import { Close, Delete, Document, RefreshRight, UploadFilled } from '@element-plus/icons-vue'
import TicketUploadFlowDialog from './TicketUploadFlowDialog.vue'
import { useRequest } from 'alova/client'

const props = defineProps<{
  modelValue?: boolean
  visible: boolean
  mode?: 'create' | 'edit'
  ticket?: Ticket | null
}>()

const emit = defineEmits(['update:visible', 'success'])

const form = reactive({
  ticketId: "Ticket X0123",
  stage: "Order" as TicketStage,
  stageDetail: "Order ID X12345",
  type: "General Issue",
  typeId: "Order ID X12345",
  typeDetails: "N/A",
  priority: "High" as TicketPriority,
  dueDate: "",
  dueTime: "20:12:05",
  notes: "",
  attachmentName: "",
})
const uploadVisible = ref(false)
const attachmentState = ref<"idle" | "uploading" | "completed">("idle")
const uploadProgress = ref(0)

const updateVisible = (val: boolean) => {
  emit('update:visible', val)
}

const mode = computed(() => props.mode || 'create')

const stageDefaults: Record<TicketStage, { detail: string; typeId: string; type: string }> = {
  Order: { detail: "Order ID X12345", typeId: "Order ID X12345", type: "General Issue" },
  Inventory: { detail: "SKU ID X12345", typeId: "SKU ID X12345", type: "Miss Information" },
  Billing: { detail: "Service X0123", typeId: "Service X0123", type: "General Issue" },
  Invoices: { detail: "Invoice X0123", typeId: "Invoice X0123", type: "Unpaid Invoice" },
  Settings: { detail: "Profile X0123", typeId: "Profile X0123", type: "Profile" },
}

watch(
  () => [props.visible, props.ticket, props.mode],
  ([visible, ticket, dialogMode]: any) => {
    if (!visible) return
    if (dialogMode === 'edit' && ticket) {
      form.ticketId = ticket.ticketId || "Ticket X0123"
      form.stage = (ticket.stage as TicketStage) || 'Order'
      form.stageDetail = ticket.stageDetail || ''
      form.type = ticket.type || ''
      form.typeId = ticket.typeId || ticket.stageDetail || ''
      form.typeDetails = ticket.typeDetails || ''
      form.priority = ticket.priority || 'High'
      form.dueDate = ticket.dueDate || ''
      form.dueTime = ticket.dueTime || '20:12:05'
      form.notes = ticket.notes || ''
      form.attachmentName = ''
      attachmentState.value = 'idle'
      uploadProgress.value = 0
      return
    }
    form.ticketId = "Ticket X0123"
    form.stage = "Order"
    form.stageDetail = "Order ID X12345"
    form.type = "General Issue"
    form.typeId = "Order ID X12345"
    form.typeDetails = "N/A"
    form.priority = "High"
    form.dueDate = ""
    form.dueTime = "20:12:05"
    form.notes = ""
    form.attachmentName = ""
    attachmentState.value = 'idle'
    uploadProgress.value = 0
  },
  { immediate: true }
)

const { loading: submitting, send: sendSubmitTicket, onSuccess: onSubmitSuccess, onError: onSubmitError } = useRequest(
  (payload: any, isEdit: boolean, id?: string) => {
    if (isEdit && id) {
      return updateTicket(id, payload);
    }
    return createTicket(payload);
  },
  { immediate: false }
);

onSubmitSuccess((event) => {
  updateVisible(false);
  ElMessage.success(mode.value === 'edit' ? "Updated" : "Created");
  emit('success');
});

onSubmitError((event) => {
  ElMessage.error(event.error?.message || "Operation failed");
});

const handleSubmit = () => {
  form.stageDetail = form.typeId;
  const mappedPayload = {
    subject: form.ticketId || "Support Ticket",
    description: form.notes,
    problem_category: "其他", // default
    priority: form.priority,
    reference_doctype: undefined as any,
    reference_name: form.typeId,
    stage: form.stage,
    stageDetail: form.stageDetail,
    type: form.type,
  };

  // Basic category mapping
  if (form.stage === 'Order') mappedPayload.problem_category = '其他';
  else if (form.stage === 'Inventory') mappedPayload.problem_category = '仓库';
  else if (form.stage === 'Billing' || form.stage === 'Invoices') mappedPayload.problem_category = '账单';
  else mappedPayload.problem_category = '其他';

  sendSubmitTicket(mappedPayload, mode.value === 'edit', props.ticket?.id);
};

const handleUploadDone = (payload: { uploadId: string; fileName: string }) => {
  uploadProgress.value = 100
  attachmentState.value = "completed"
  form.attachmentName = payload.fileName
}

const handleUploadVisibleChange = (val: boolean) => {
  uploadVisible.value = val
  if (!val && !form.attachmentName) {
    attachmentState.value = "idle"
    uploadProgress.value = 0
  }
}

const openUpload = () => {
  attachmentState.value = "uploading"
  uploadProgress.value = 87
  uploadVisible.value = true
}

const cancelUpload = () => {
  attachmentState.value = "idle"
  uploadProgress.value = 0
  form.attachmentName = ""
}

const removeAttachment = () => {
  attachmentState.value = "idle"
  form.attachmentName = ""
  uploadProgress.value = 0
}

watch(
  () => form.stage,
  (stage) => {
    if (mode.value === 'edit') return
    const defaults = stageDefaults[stage]
    form.stageDetail = defaults.detail
    form.typeId = defaults.typeId
    form.type = defaults.type
  }
)
</script>

<style scoped>
:deep(.ticket-create-dialog .el-dialog__header) {
  border-bottom: 1px solid #ececec;
  padding: 20px 24px 14px;
}

:deep(.ticket-create-dialog .el-dialog__body) {
  padding: 14px 24px 10px;
}

:deep(.ticket-create-dialog .el-dialog__footer) {
  padding: 14px 24px 20px;
}
</style>
