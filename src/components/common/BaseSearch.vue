<template>
  <div
    class="line position-relative py-2 animate__animated animate__fadeInDown"
  >
    <div class="flex flex-wrap items-center gap-2 mb-3">
      <template v-for="item in topFilters" :key="item.prop">
        <el-select
          v-if="item.type === 'select'"
          v-model="modelValue[item.prop]"
          :placeholder="item.label"
          clearable
          class="filter-chip-select"
          :style="{ width: item.width || '140px' }"
          @change="toggleOption"
        >
          <template #prefix v-if="item.label">
            <span class="text-gray-800 font-medium mr-1">{{ item.label }}</span>
          </template>
          <el-option
            v-for="opt in item.options"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>

        <div
          v-else-if="item.type === 'range'"
          class="flex items-center bg-white border border-gray-200 rounded px-2 h-8"
        >
          <input
            v-model="modelValue[item.prop + 'Min']"
            class="w-16 text-center outline-none text-sm"
            placeholder="000"
            @change="toggleOption"
          />
          <span class="mx-1 text-gray-400">-</span>
          <input
            v-model="modelValue[item.prop + 'Max']"
            class="w-16 text-center outline-none text-sm"
            placeholder="000"
          />
        </div>
      </template>

      <el-button
        circle
        size="small"
        class="!ml-auto !border-gray-200 !text-gray-500 hover:!text-gray-700 hover:!bg-gray-100"
        @click="$emit('close')"
      >
        <el-icon><Close /></el-icon>
      </el-button>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <template v-for="item in bottomOptions" :key="item.prop">
        <div
          class="cursor-pointer px-4 py-1.5 rounded-full text-sm transition-colors border"
          :class="[
            modelValue[item.prop]
              ? 'bg-white border-blue-600 text-blue-700 font-medium shadow-sm'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50',
          ]"
          @click="toggleOption(item.prop)"
        >
          {{ item.label }}
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Close } from "@element-plus/icons-vue";

interface SearchItem {
  type: "select" | "range" | "option";
  label: string;
  prop: string;
  placeholder?: string;
  width?: string;
  options?: { label: string; value: any }[];
  placement?: "top" | "bottom";
}

interface Props {
  modelValue: Record<string, any>;
  items: SearchItem[];
}

const props = defineProps<Props>();
const emit = defineEmits(["update:modelValue", "search", "reset", "close"]);

const topFilters = computed(() =>
  props.items.filter((i) => i.placement === "top" || !i.placement),
);
const bottomOptions = computed(() =>
  props.items.filter((i) => i.placement === "bottom"),
);

const toggleOption = (prop: any) => {
  const newVal = !props.modelValue[prop];
  emit("update:modelValue", {
    ...props.modelValue,
    [prop]: newVal,
  });
  emit("search");
};
</script>

<style scoped lang="less">
.filter-chip-select :deep(.el-input__wrapper) {
  background-color: #fff;
  border-radius: 6px;
  box-shadow:
    0 1px 2px 0 rgba(0, 0, 0, 0.05),
    0 0 0 1px #e5e7eb inset !important;
  padding-left: 8px;
  height: 32px;
}

.filter-chip-select :deep(.el-input__inner) {
  font-weight: 500;
  color: #374151;
}

.filter-chip-select :deep(.el-input__suffix) {
  color: #6b7280;
}

.line::before {
  position: absolute;
  top: 0;
  left: 0;
  content: "";
  display: block;
  width: 100%;
  height: 1px;
  background-color: #e5e7eb;
}
</style>
