<template>
  <el-dialog
    :model-value="visible"
    title="Create Ticket"
    width="640px"
    destroy-on-close
    class="ticket-create-dialog"
    @update:model-value="updateVisible"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <el-form-item label="Subject" prop="subject">
        <el-input v-model="form.subject" placeholder="Brief summary of your request" clearable />
      </el-form-item>
      <el-form-item label="Description" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="4"
          placeholder="Details, steps to reproduce, expectations..."
        />
      </el-form-item>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <el-form-item label="Category" prop="category">
          <el-select
            v-model="form.category"
            class="w-full"
            placeholder="Select category"
            @change="onCategoryChange"
          >
            <el-option
              v-for="opt in TICKET_CATEGORY_OPTIONS"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Priority" prop="priority">
          <el-select v-model="form.priority" class="w-full">
            <el-option label="High" value="High" />
            <el-option label="Medium" value="Medium" />
            <el-option label="Low" value="Low" />
          </el-select>
        </el-form-item>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <el-form-item label="Linked document type">
          <el-select v-model="form.reference_doctype" class="w-full" clearable placeholder="Optional">
            <el-option label="Sales Order" value="Sales Order" />
            <el-option label="Material Request" value="Material Request" />
          </el-select>
        </el-form-item>
        <el-form-item label="Document" prop="reference_name">
          <el-autocomplete
            v-model="form.reference_name"
            class="w-full"
            clearable
            :disabled="!form.reference_doctype"
            :fetch-suggestions="fetchRefSuggestions"
            :trigger-on-focus="true"
            value-key="value"
            placeholder="Search by ID, customer, status…"
            popper-class="ticket-ref-autocomplete-popper"
            @select="onRefDocSelect"
          >
            <template #default="{ item }">
              <div class="py-1.5">
                <div class="font-medium text-gray-900">{{ (item as RefSuggestion).value }}</div>
                <div v-if="(item as RefSuggestion).description" class="text-xs text-gray-500 mt-0.5">
                  {{ (item as RefSuggestion).description }}
                </div>
              </div>
            </template>
          </el-autocomplete>
        </el-form-item>
      </div>
      <el-form-item class="ticket-responsible-person-item">
        <template #label>
          <div>
            <span class="text-sm text-gray-900">Responsible person</span>
            <p class="text-xs text-gray-500 mt-1 mb-0 font-normal leading-relaxed max-w-xl">
              Read-only. This shows which Flowa team member will handle your request (based on the category you selected). You
              cannot edit this — it is assigned automatically on our side.
            </p>
          </div>
        </template>
        <el-input
          :model-value="resolvedAssigneeDisplay"
          readonly
          disabled
          class="ticket-assignee-readonly !cursor-default"
        />
      </el-form-item>
      <el-form-item label="Image">
        <el-upload
          class="w-full"
          :auto-upload="false"
          :limit="1"
          :on-exceed="onExceedOne"
          :on-change="onImagePick"
          :on-remove="() => { imageFile = null }"
          accept="image/*"
          list-type="picture"
        >
          <el-button type="default">Select image</el-button>
          <span class="text-xs text-gray-500 ml-2">One image, optional</span>
        </el-upload>
      </el-form-item>
      <el-form-item label="Attachment">
        <el-upload
          class="w-full"
          :auto-upload="false"
          :limit="1"
          :on-exceed="onExceedOne"
          :on-change="onFilePick"
          :on-remove="onFileRemove"
        >
          <el-button type="default">Select file</el-button>
          <span class="text-xs text-gray-500 ml-2">One file, optional (matches ERPNext single Attach field)</span>
        </el-upload>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="flex justify-end gap-3">
        <el-button :disabled="submitting" @click="updateVisible(false)">Cancel</el-button>
        <el-button
          type="primary"
          class="!bg-[#1e3a8a] !border-none"
          :loading="submitting"
          @click="handleCreate"
          >Create</el-button
        >
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules, UploadFile, UploadProps } from 'element-plus'
import {
  createTicket,
  searchTroubleTicketReferences,
  suggestTroubleTicketAssignee,
  uploadTicketAttachment,
  TICKET_CATEGORY_OPTIONS,
  type TicketCategoryValue,
  type TroubleTicketRefSuggestion,
} from '@/api/support'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits(['update:visible', 'success'])

type RefSuggestion = TroubleTicketRefSuggestion

const formRef = ref<FormInstance>()
const submitting = ref(false)
const imageFile = ref<File | null>(null)
const attachmentFile = ref<File | null>(null)
/** 后端按大类+值班规则解析的 User id；无输入框，仅展示，提交时带给接口 */
const suggestedAssignee = ref('')
const resolvedAssigneeDisplay = computed(() => suggestedAssignee.value || '—')

const form = reactive({
  subject: '',
  description: '',
  category: '物流' as TicketCategoryValue,
  priority: 'Medium' as 'High' | 'Medium' | 'Low',
  reference_doctype: '' as '' | 'Sales Order' | 'Material Request',
  reference_name: '',
})

const rules: FormRules = {
  subject: [{ required: true, message: 'Subject is required', trigger: 'blur' }],
  category: [{ required: true, message: 'Category is required', trigger: 'change' }],
  reference_name: [
    {
      validator: (_r, v, cb) => {
        if (form.reference_doctype && !(v || '').toString().trim()) {
          cb(new Error('A document must be selected when a linked type is chosen'))
        } else cb()
      },
      trigger: ['blur', 'change'],
    },
  ],
}

const updateVisible = (val: boolean) => {
  emit('update:visible', val)
}

const onExceedOne: UploadProps['onExceed'] = () => {
  ElMessage.warning('Only one file allowed. Remove the current file first.')
}

const onImagePick: UploadProps['onChange'] = (uploadFile: UploadFile) => {
  imageFile.value = uploadFile.raw ?? null
}

const onFilePick: UploadProps['onChange'] = (uploadFile: UploadFile) => {
  attachmentFile.value = uploadFile.raw ?? null
}

const onImageRemove = () => {
  imageFile.value = null
}

const onFileRemove = () => {
  attachmentFile.value = null
}

let refSearchTimer: ReturnType<typeof setTimeout> | null = null

const fetchRefSuggestions = (queryString: string, cb: (rows: RefSuggestion[]) => void) => {
  if (!form.reference_doctype) {
    cb([])
    return
  }
  if (refSearchTimer) clearTimeout(refSearchTimer)
  refSearchTimer = setTimeout(() => {
    refSearchTimer = null
    searchTroubleTicketReferences({
      reference_doctype: form.reference_doctype as 'Sales Order' | 'Material Request',
      txt: queryString || '',
      limit: 20,
    })
      .then(cb)
      .catch(() => cb([]))
  }, 280)
}

const onRefDocSelect = () => {
  formRef.value?.validateField('reference_name').catch(() => {})
}

const syncSuggestedAssignee = async () => {
  try {
    suggestedAssignee.value = await suggestTroubleTicketAssignee({
      problem_category: form.category,
    })
  } catch {
    suggestedAssignee.value = 'Administrator'
  }
}

const onCategoryChange = () => {
  syncSuggestedAssignee()
}

watch(
  () => form.reference_doctype,
  (v) => {
    if (!v) form.reference_name = ''
  }
)

function resetForOpen() {
  form.subject = ''
  form.description = ''
  form.category = '物流'
  form.priority = 'Medium'
  form.reference_doctype = ''
  form.reference_name = ''
  imageFile.value = null
  attachmentFile.value = null
  suggestedAssignee.value = ''
  formRef.value?.clearValidate()
}

watch(
  () => props.visible,
  (v) => {
    if (v) {
      resetForOpen()
      void syncSuggestedAssignee()
    }
  }
)

const handleCreate = async () => {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }
  await syncSuggestedAssignee()

  submitting.value = true
  try {
    let imagePath = ''
    let filePath = ''
    if (imageFile.value) {
      imagePath = await uploadTicketAttachment(imageFile.value)
    }
    if (attachmentFile.value) {
      filePath = await uploadTicketAttachment(attachmentFile.value)
    }
    const catOpt = TICKET_CATEGORY_OPTIONS.find((o) => o.value === form.category)
    await createTicket({
      subject: form.subject.trim(),
      description: form.description.trim(),
      problem_category: form.category,
      problem_category_en: catOpt?.label ?? '',
      priority: form.priority,
      assigned_to: (suggestedAssignee.value || '').trim() || undefined,
      reference_doctype: form.reference_doctype || undefined,
      reference_name: form.reference_doctype ? form.reference_name.trim() : '',
      image: imagePath || undefined,
      file_attachment: filePath || undefined,
    })
    updateVisible(false)
    ElMessage.success('Created')
    emit('success')
  } catch (e: unknown) {
    ElMessage.error(e instanceof Error ? e.message : 'Create failed')
  } finally {
    submitting.value = false
  }
}
</script>

<style>
/* Popper is teleported to body */
.ticket-ref-autocomplete-popper.el-popper {
  min-width: 420px !important;
  max-width: min(560px, 92vw);
}

.ticket-responsible-person-item :deep(.el-form-item__label) {
  align-items: flex-start;
}

.ticket-assignee-readonly.is-disabled :deep(.el-input__inner) {
  color: var(--el-text-color-primary);
  -webkit-text-fill-color: var(--el-text-color-primary);
}
</style>
