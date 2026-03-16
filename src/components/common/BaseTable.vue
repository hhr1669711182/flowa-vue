<template>
  <div
    class="bg-white overflow-hidden animate__animated animate__fadeIn h-full"
  >
    <el-table
      ref="tableRef"
      v-loading="loading"
      :data="data"
      :header-cell-style="{
        backgroundColor: '#F1F1F1',
        color: '#6B6B6B',
        fontWeight: '600',
      }"
      v-bind="$attrs"
      height="calc(100% - 60px)"
      class="base-table w-full h-auto"
      @expand-change="handleExpandChange"
    >
      <template v-for="col in columns" :key="col.prop">
        <template v-if="col.type === 'expand'">
          <el-table-column
            type="expand"
            width="1"
            class-name="expand-col-ghost"
          >
            <template #default="scope">
              <slot
                :name="col.slot || 'expand'"
                :row="scope.row"
                :index="scope.$index"
              ></slot>
            </template>
          </el-table-column>

          <el-table-column v-bind="col" type="">
            <template #header>
              <div class="flex flex-1">
                <Icon icon="svg-icon:circle-plus" color="#000" />
              </div>
            </template>
            <template #default="{ row }">
              <div
                class="cursor-pointer flex items-center justify-center"
                @click="toggleRowExpansion(row)"
              >
                <Icon
                  v-if="col.icon"
                  :icon="col.icon"
                  :color="col.color"
                  :class="{ 'rotate-90': isExpanded(row) }"
                  class="transition-transform duration-200"
                />
                <div v-else class="h-full flex flex-1">
                  <Icon
                    v-if="!isExpanded(row)"
                    icon="svg-icon:circle-plus"
                    color="#000"
                  />
                  <Icon v-else icon="svg-icon:circle-minus-fill" color="#000" />
                </div>
              </div>
            </template>
          </el-table-column>
        </template>

        <el-table-column v-else-if="col.slot" v-bind="col">
          <template #default="scope">
            <slot
              :name="col.slot"
              :row="scope.row"
              :index="scope.$index"
            ></slot>
          </template>
        </el-table-column>

        <el-table-column v-else v-bind="col" />
      </template>
    </el-table>

    <div
      v-if="pagination"
      class="flex justify-end p-4 border-t border-gray-50 h-12"
    >
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
import { ref, computed } from "vue";

defineOptions({
  inheritAttrs: false,
});

interface Column {
  prop?: string;
  label?: string;
  width?: string | number;
  slot?: string;
  type?: string;
  icon?: string;
  color?: string;
  [key: string]: any;
}

interface Props {
  data: any[];
  columns: Column[];
  loading?: boolean;
  pagination?: boolean;
  total?: number;
  page?: number;
  limit?: number;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  pagination: false,
  total: 0,
  page: 1,
  limit: 10,
});

const emit = defineEmits(["update:page", "update:limit", "pagination-change"]);

const tableRef = ref();
const expandedRows = ref<any[]>([]);

const handleExpandChange = (row: any, expanded: any[]) => {
  expandedRows.value = expanded;
};

const isExpanded = (row: any) => {
  return expandedRows.value.includes(row);
};

const toggleRowExpansion = (row: any) => {
  tableRef.value?.toggleRowExpansion(row);
};

const currentPage = computed({
  get: () => props.page,
  set: (val) => emit("update:page", val),
});

const pageSize = computed({
  get: () => props.limit,
  set: (val) => emit("update:limit", val),
});

const handleSizeChange = (val: number) => {
  emit("pagination-change", { page: currentPage.value, limit: val });
};

const handleCurrentChange = (val: number) => {
  emit("pagination-change", { page: val, limit: pageSize.value });
};
</script>

<style scoped>
:deep(.el-table__inner-wrapper::before) {
  display: none;
}

.base-table :deep(td.el-table__cell),
.base-table :deep(th.el-table__cell.is-leaf) {
  border-bottom: none !important;
}

.base-table :deep(.el-table__row:hover > td.el-table__cell) {
  background-color: var(--el-table-row-hover-bg-color);
}

/* Hide the ghost expand column's cell content and header */
.base-table :deep(.expand-col-ghost) {
  padding: 0;
  border: none;
  width: 0 !important;
  min-width: 0 !important;
}
.base-table :deep(.expand-col-ghost .cell) {
  display: none;
  padding: 0;
}
</style>
