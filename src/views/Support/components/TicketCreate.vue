<template>
  <el-dialog
    :model-value="visible"
    title="Create Ticket"
    width="520px"
    destroy-on-close
    @update:model-value="updateVisible"
  >
    <el-form :model="form" label-position="top">
      <el-form-item label="Stage">
        <el-select v-model="form.stage" class="w-full">
          <el-option label="Order" value="Order" />
          <el-option label="Inventory" value="Inventory" />
          <el-option label="Billing" value="Billing" />
          <el-option label="Invoices" value="Invoices" />
          <el-option label="Settings" value="Settings" />
        </el-select>
      </el-form-item>
      <el-form-item label="Stage Detail">
        <el-input v-model="form.stageDetail" />
      </el-form-item>
      <el-form-item label="Type">
        <el-input v-model="form.type" />
      </el-form-item>
      <el-form-item label="Priority">
        <el-select v-model="form.priority" class="w-full">
          <el-option label="High" value="High" />
          <el-option label="Medium" value="Medium" />
          <el-option label="Low" value="Low" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="flex justify-end gap-3">
        <el-button @click="updateVisible(false)">Cancel</el-button>
        <el-button
          type="primary"
          class="!bg-[#1e3a8a] !border-none"
          @click="handleCreate"
          >Create</el-button
        >
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { createTicket } from '@/api/support'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits(['update:visible', 'success'])

const form = reactive({
  stage: "Order",
  stageDetail: "Order ID X12345",
  type: "General Issue",
  priority: "High" as "High" | "Medium" | "Low",
})

const updateVisible = (val: boolean) => {
  emit('update:visible', val)
}

const handleCreate = async () => {
  await createTicket(form)
  updateVisible(false)
  ElMessage.success("Created")
  emit('success')
}
</script>
