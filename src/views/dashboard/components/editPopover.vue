<template>
  <el-popover
    v-model:visible="visible"
    placement="bottom-end"
    trigger="click"
    width="220"
    popper-class="edit-popover"
  >
    <div class="edit-popover-panel">
      <div
        v-for="item in items"
        :key="item.key"
        class="edit-popover-item"
        :class="{ active: item.visible, danger: item.key === 'hideData' }"
        @click="handleToggle(item.key)"
      >
        <el-icon :size="16">
          <View />
        </el-icon>
        <span>{{ item.label }}</span>
      </div>
    </div>
    <template #reference>
      <slot />
    </template>
  </el-popover>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { View } from "@element-plus/icons-vue";

interface Item {
  key: string;
  label: string;
  visible: boolean;
}

interface Props {
  modelValue: boolean;
  items: Item[];
}

const props = defineProps<Props>();
const emit = defineEmits(["update:modelValue", "toggle", "hide-all"]);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const handleToggle = (key: string) => {
  if (key === "hideData") {
    emit("hide-all");
    return;
  }
  emit("toggle", key);
};
</script>

<style scoped>
.edit-popover-panel {
  display: grid;
  gap: 8px;
  padding: 4px 0;
}

.edit-popover-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #9ca3af;
  cursor: pointer;
}

.edit-popover-item.active {
  color: #16215b;
  font-weight: 600;
}

.edit-popover-item.danger {
  color: #ef4444;
}
</style>
