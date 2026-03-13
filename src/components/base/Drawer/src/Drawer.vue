<template>
  <el-drawer
    v-bind="$attrs"
    :model-value="modelValue"
    :title="title"
    :size="size"
    :destroy-on-close="true"
    @update:model-value="updateModelValue"
    class="base-drawer"
  >
    <template #header>
      <slot name="header">
        <div class="flex items-center justify-between w-full">
          <span class="text-lg font-bold text-gray-900">{{ title }}</span>
          <slot name="extra"></slot>
        </div>
      </slot>
    </template>
    
    <div class="h-full flex flex-col" v-if="!customLayout">
      <div class="flex-1 overflow-y-auto p-4">
        <slot></slot>
      </div>
      
      <div v-if="$slots.footer" class="border-t border-gray-100 p-4 bg-white">
        <slot name="footer"></slot>
      </div>
    </div>
    <slot v-else></slot>
  </el-drawer>
</template>

<script setup lang="ts">

interface Props {
  modelValue: boolean
  title?: string
  size?: string | number
  customLayout?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  title: '',
  size: '30%',
  customLayout: false
})

const emit = defineEmits(['update:modelValue', 'close'])

const updateModelValue = (val: boolean) => {
  emit('update:modelValue', val)
  if (!val) {
    emit('close')
  }
}
</script>

<style scoped>
.base-drawer :deep(.el-drawer__header) {
  margin-bottom: 0;
  padding: 16px 20px;
  border-bottom: 1px solid #f3f4f6;
}

.base-drawer :deep(.el-drawer__body) {
  padding: 0;
  overflow: hidden;
}
</style>