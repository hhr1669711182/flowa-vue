<template>
  <div class="bg-white p-5 rounded-xl shadow-card mb-6 border border-gray-100 animate__animated animate__fadeInDown">
    <el-form :inline="true" :model="modelValue" class="flex flex-wrap items-center gap-y-4">
      <template v-for="item in items" :key="item.prop">
         <el-form-item :label="item.label" class="!mb-0 !mr-6">
            <!-- Input -->
            <el-input
              v-if="item.type === 'input'"
              v-model="modelValue[item.prop]"
              :placeholder="item.placeholder"
              clearable
              class="w-48"
            />

            <!-- Select -->
            <el-select
              v-else-if="item.type === 'select'"
              v-model="modelValue[item.prop]"
              :placeholder="item.placeholder"
              clearable
              class="w-48"
            >
              <el-option
                v-for="opt in item.options"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>

            <!-- Date Picker -->
            <el-date-picker
              v-else-if="item.type === 'date'"
              v-model="modelValue[item.prop]"
              type="date"
              :placeholder="item.placeholder"
              value-format="YYYY-MM-DD"
              class="w-48"
            />
         </el-form-item>
      </template>

      <div class="ml-auto flex items-center">
        <el-button type="primary" @click="$emit('search')" class="!px-6">Search</el-button>
        <el-button @click="$emit('reset')" plain>Reset</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
interface SearchItem {
  type: 'input' | 'select' | 'date'
  label: string
  prop: string
  placeholder?: string
  options?: { label: string; value: any }[]
}

interface Props {
  modelValue: Record<string, any>
  items: SearchItem[]
}

defineProps<Props>()
defineEmits(['update:modelValue', 'search', 'reset'])
</script>

<style scoped>
:deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
}
</style>
