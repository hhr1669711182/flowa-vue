<template>
  <el-dialog
    :model-value="visible"
    width="860px"
    class="ticket-upload-flow-dialog"
    destroy-on-close
    @update:model-value="emit('update:visible', $event)"
  >
    <template #header>
      <div class="h-2"></div>
    </template>

    <div class="min-h-440px rounded-xl bg-#F3F7FF border border-#E2E8FF flex flex-col items-center justify-center px-6">
      <template v-if="step === 'select'">
        <div class="w-22 h-22 rounded-2xl bg-white border border-#DDE4FF shadow-sm flex items-center justify-center mb-6">
          <el-icon class="text-#1E3A8A text-24px"><UploadFilled /></el-icon>
        </div>
        <div class="text-46px font-700 text-#111827 mb-1">Upload Your File</div>
        <div class="text-14px text-#6B7280 mb-1">to Flowa Support Team</div>
        <div class="text-12px text-#9CA3AF mb-8">15 MB Limit</div>
        <el-input v-model="fileName" placeholder="Document name" class="w-80 mb-6" />
        <el-button type="primary" class="!bg-[#16215B] !border-none !px-8" @click="startUpload">
          Upload
        </el-button>
      </template>

      <template v-else-if="step === 'uploading'">
        <div class="w-22 h-22 rounded-2xl bg-white border border-#DDE4FF shadow-sm flex items-center justify-center mb-6">
          <el-icon class="text-#1E3A8A text-24px"><Loading /></el-icon>
        </div>
        <div class="text-30px font-700 text-#111827 mb-2">Uploading...</div>
        <div class="text-14px text-#6B7280 mb-5">{{ fileName }}</div>
        <el-progress :percentage="65" :stroke-width="8" class="w-140" />
      </template>

      <template v-else-if="step === 'completed'">
        <div class="w-22 h-22 rounded-2xl bg-white border border-#DDE4FF shadow-sm flex items-center justify-center mb-6">
          <el-icon class="text-#16A34A text-24px"><CircleCheckFilled /></el-icon>
        </div>
        <div class="text-30px font-700 text-#111827 mb-2">Completed</div>
        <div class="text-14px text-#6B7280 mb-5">{{ fileName }}</div>
        <el-button type="primary" class="!bg-[#16215B] !border-none !px-8" @click="overwriteAndDone">
          Overwrite Support Conversation
        </el-button>
      </template>

      <template v-else>
        <div class="w-22 h-22 rounded-2xl bg-white border border-#DDE4FF shadow-sm flex items-center justify-center mb-6">
          <el-icon class="text-#16A34A text-24px"><CircleCheckFilled /></el-icon>
        </div>
        <div class="text-30px font-700 text-#111827 mb-2">Done</div>
        <div class="text-14px text-#6B7280">Document attached successfully</div>
      </template>
    </div>

    <template #footer>
      <div class="flex justify-between gap-3">
        <el-button class="!px-8" @click="emit('update:visible', false)">Cancel</el-button>
        <el-button
          v-if="step === 'done'"
          type="primary"
          class="!bg-[#16215B] !border-none !px-8"
          @click="confirmDone"
        >
          Confirm
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { CircleCheckFilled, Loading, UploadFilled } from "@element-plus/icons-vue";
import { completeTicketUpload, overwriteTicketUpload, uploadTicketFile } from "@/api/support";

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: "update:visible", val: boolean): void;
  (e: "done", payload: { uploadId: string; fileName: string }): void;
}>();

const fileName = ref("support-document.pdf");
const step = ref<"select" | "uploading" | "completed" | "done">("select");
const uploadId = ref("");

watch(
  () => props.visible,
  (val) => {
    if (!val) return;
    fileName.value = "support-document.pdf";
    step.value = "select";
    uploadId.value = "";
  }
);

const startUpload = async () => {
  const started = await uploadTicketFile({ fileName: fileName.value });
  uploadId.value = started.uploadId;
  step.value = "uploading";
  const completed = await completeTicketUpload(uploadId.value);
  step.value = completed.status === "completed" ? "completed" : "uploading";
};

const overwriteAndDone = async () => {
  if (!uploadId.value) return;
  const done = await overwriteTicketUpload(uploadId.value);
  if (done.status === "done") {
    step.value = "done";
  }
};

const confirmDone = () => {
  emit("done", { uploadId: uploadId.value, fileName: fileName.value });
  emit("update:visible", false);
};
</script>

<style scoped>
:deep(.ticket-upload-flow-dialog .el-dialog__header) {
  padding: 8px 18px 0;
}

:deep(.ticket-upload-flow-dialog .el-dialog__body) {
  padding: 10px 24px;
}

:deep(.ticket-upload-flow-dialog .el-dialog__footer) {
  padding: 14px 24px 20px;
}
</style>
