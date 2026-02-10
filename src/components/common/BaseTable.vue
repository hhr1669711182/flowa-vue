<!--
 * @Author: huanghuanrong
 * @Date: 2026-02-10 14:15:43
 * @LastEditTime: 2026-02-10 19:55:11
 * @LastEditors: huanghuanrong
 * @Description: 文件描述
 * @FilePath: \flowa1\src\components\common\BaseTable.vue
-->
<template>
  <div class="bg-white rounded-xl shadow-card overflow-hidden border border-gray-100 animate__animated animate__fadeIn">
    <el-table
      v-loading="loading"
      :data="data"
      style="width: 100%; height: 65vh;"
      :header-cell-style="{ background: '#f8fafc', color: '#475569', fontWeight: '600' }"
      v-bind="$attrs"
    >
      <template v-for="col in columns" :key="col.prop">
        <!-- Custom Slot Column -->
        <el-table-column
          v-if="col.slot"
          v-bind="col"
        >
          <template #default="scope">
            <slot :name="col.slot" :row="scope.row" :index="scope.$index"></slot>
          </template>
        </el-table-column>
        
        <!-- Standard Column -->
        <el-table-column
          v-else
          v-bind="col"
        />
      </template>
    </el-table>

    <div v-if="pagination" class="flex justify-end p-4 border-t border-gray-50">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        background
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Column {
  prop?: string
  label: string
  width?: string | number
  slot?: string
  [key: string]: any
}

interface Props {
  data: any[]
  columns: Column[]
  loading?: boolean
  pagination?: boolean
  total?: number
  page?: number
  limit?: number
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  pagination: false,
  total: 0,
  page: 1,
  limit: 10
})

const emit = defineEmits(['update:page', 'update:limit', 'pagination-change'])

const currentPage = computed({
  get: () => props.page,
  set: (val) => emit('update:page', val)
})

const pageSize = computed({
  get: () => props.limit,
  set: (val) => emit('update:limit', val)
})

const handleSizeChange = (val: number) => {
  emit('pagination-change', { page: currentPage.value, limit: val })
}

const handleCurrentChange = (val: number) => {
  emit('pagination-change', { page: val, limit: pageSize.value })
}
</script>

<style scoped>
:deep(.el-table__inner-wrapper::before) {
  display: none; /* Remove bottom border */
}
</style>
