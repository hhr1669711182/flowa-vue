<template>
  <el-space wrap :size="12" class="mb-6">
    <div v-if="config.search" class="w-full sm:w-80">
      <el-input
        v-model="filterState.search"
        :placeholder="config.search.placeholder || 'Search...'"
        :prefix-icon="Search"
        clearable
        @input="emitChange"
      />
    </div>

    <div v-if="config.quickRanges?.length" class="w-full sm:w-auto">
      <el-select
        v-model="filterState.quickRange"
        class="chip-select !w-40"
        @change="emitChange"
      >
        <el-option
          v-for="r in config.quickRanges"
          :key="r.value"
          :label="r.label"
          :value="r.value"
        />
      </el-select>
    </div>

    <div v-if="config.dateRange" class="w-full sm:w-auto">
      <el-date-picker
        v-model="filterState.dateRange"
        type="daterange"
        range-separator="|"
        start-placeholder="Start date"
        end-placeholder="End date"
        format="DD MMM"
        value-format="YYYY-MM-DD"
        class="chip-date !w-64"
        @change="emitChange"
      />
    </div>

    <template v-for="select in config.selects" :key="select.key">
      <div class="w-full sm:w-auto">
        <el-select
          v-model="filterState[select.key]"
          :placeholder="select.placeholder"
          clearable
          class="chip-select !w-40"
          @change="emitChange"
        >
          <template #prefix v-if="select.icon">
            <el-icon><component :is="select.icon" /></el-icon>
          </template>
          <el-option
            v-for="opt in select.options"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </div>
    </template>

    <slot name="extra"></slot>
  </el-space>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { Search } from '@element-plus/icons-vue'

interface SelectOption {
  label: string
  value: string | number
}

interface SelectConfig {
  key: string
  placeholder: string
  options: SelectOption[]
  icon?: any
}

interface FilterConfig {
  search?: {
    placeholder?: string
  }
  quickRanges?: {
    label: string
    value: string
  }[]
  dateRange?: boolean
  selects?: SelectConfig[]
}

const props = defineProps<{
  config: FilterConfig
}>()

const emit = defineEmits(['change'])

const filterState = reactive<Record<string, any>>({
  search: '',
  quickRange: '',
  dateRange: null,
})

// Initialize select keys
if (props.config.selects) {
  props.config.selects.forEach(s => {
    filterState[s.key] = ''
  })
}

if (props.config.quickRanges?.length) {
  filterState.quickRange = props.config.quickRanges[0]?.value || ''
}

const emitChange = () => {
  emit('change', { ...filterState })
}
</script>

<style scoped>
:deep(.el-input__wrapper) {
  box-shadow: none !important;
  border: 1px solid #ececec;
  background-color: #fff;
  border-radius: 8px;
}
:deep(.el-input__wrapper.is-focus) {
  border-color: #1e3a8a;
}
:deep(.el-select .el-input__wrapper) {
  background-color: #fff;
}

.chip-select :deep(.el-input__wrapper) {
  border-radius: 10px;
  min-height: 40px;
}

.chip-date :deep(.el-range-editor.el-input__wrapper) {
  border-radius: 10px;
  min-height: 40px;
}

.chip-date :deep(.el-range-separator) {
  color: #9ca3af;
}
</style>
