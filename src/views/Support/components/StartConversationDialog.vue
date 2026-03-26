<template>
  <el-dialog
    :model-value="visible"
    width="420px"
    destroy-on-close
    class="start-conversation-dialog"
    @update:model-value="emit('update:visible', $event)"
  >
    <div class="py-5 px-1 text-center">
      <div class="w-10 h-10 rounded-full border border-#DDE4FF mx-auto flex items-center justify-center mb-4">
        <el-icon class="text-#1D4ED8 text-18px" :class="isLoading ? 'animate-spin' : ''">
          <Loading />
        </el-icon>
      </div>
      <div class="text-32px font-700 text-#111827 leading-38px">Opening a</div>
      <div class="text-32px font-700 text-#111827 leading-38px">Support Conversation</div>
      <div class="text-14px text-#6B7280 mt-1">Your ticket is ready. A chat with the</div>
      <div class="text-14px text-#6B7280">Flowa Support team is being created.</div>
      <div class="text-12px text-#9CA3AF mt-6">Our team has received your request</div>
      <div class="text-12px text-#9CA3AF">and will review the information provided.</div>
    </div>

    <template #footer>
      <div class="flex justify-between">
        <el-button class="!px-8" @click="emit('update:visible', false)">Cancel</el-button>
        <el-button
          type="primary"
          class="!bg-[#16215B] !border-none !px-8"
          :disabled="isLoading"
          @click="emit('done')"
        >
          Done
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { Loading } from "@element-plus/icons-vue";

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: "update:visible", val: boolean): void;
  (e: "done"): void;
}>();

const isLoading = ref(true);

watch(
  () => props.visible,
  (val) => {
    if (!val) return;
    isLoading.value = true;
    setTimeout(() => {
      isLoading.value = false;
    }, 1200);
  }
);
</script>

<style scoped>
:deep(.start-conversation-dialog .el-dialog__body) {
  padding: 8px 24px 4px;
}

:deep(.start-conversation-dialog .el-dialog__footer) {
  padding: 10px 24px 18px;
}
</style>

