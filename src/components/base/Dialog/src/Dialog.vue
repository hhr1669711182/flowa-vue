<template>
  <el-dialog
    v-bind="$attrs"
    :model-value="modelValue"
    :width="width"
    :class="['base-dialog', customClass]"
    :show-close="showClose"
    :before-close="handleClose"
    align-center
    destroy-on-close
    @update:model-value="updateModelValue"
  >
    <template #header>
      <slot name="header">
        <div class="flex items-center justify-between" v-if="title">
          <span class="text-lg font-bold text-gray-900">{{ title }}</span>
        </div>
      </slot>
    </template>

    <div class="dialog-content">
      <slot />
    </div>

    <template #footer v-if="$slots.footer">
      <div class="dialog-footer">
        <slot name="footer" />
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">

defineOptions({
  name: 'BaseDialog',
  inheritAttrs: false
})

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  width: {
    type: [String, Number],
    default: '500px'
  },
  showClose: {
    type: Boolean,
    default: true
  },
  customClass: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'close'])

const updateModelValue = (val: boolean) => {
  emit('update:modelValue', val)
}

const handleClose = () => {
  emit('close')
  emit('update:modelValue', false)
}
</script>

<style lang="less">
.base-dialog {
  border-radius: 16px !important;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;

  .el-dialog__header {
    margin-right: 0;
    padding: 20px 24px 0;
  }

  .el-dialog__body {
    padding: 24px;
  }

  .el-dialog__footer {
    padding: 0 24px 24px;
  }
  
  .el-dialog__headerbtn {
    top: 24px;
    right: 24px;
    
    .el-dialog__close {
      color: #000;
      font-weight: bold;
      font-size: 16px;
    }
  }
}
</style>