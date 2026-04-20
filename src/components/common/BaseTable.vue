<template>
  <div
    class="bg-white overflow-hidden animate__animated animate__fadeIn h-full"
  >
    <el-table
      row-key="id"
      ref="tableRef"
      v-loading="loading"
      :data="data"
      :header-cell-style="resolvedHeaderCellStyle"
      v-bind="$attrs"
      :height="resolvedHeight"
      :expand-row-keys="expandRowKeys"
      class="base-table w-full"
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
              <div class="flex flex-1" @click="handleHeaderClick(col)">
                <Icon
                  v-if="!isAllExpanded"
                  icon="svg-icon:circle-plus"
                  color="#000"
                />
                <Icon v-else icon="svg-icon:circle-minus-fill" color="#000" />
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

        <el-table-column v-else v-bind="col">
          <template v-if="col.headerSlot || col.headerRender" #header="scope">
            <RenderVNode
              v-if="col.headerSlot"
              :render-fn="getHeaderSlotRender(col.headerSlot)"
              :scope="{ column: scope.column, index: scope.$index }"
            />
            <RenderVNode
              v-else-if="col.headerRender"
              :render-fn="col.headerRender"
              :scope="scope"
            />
          </template>

          <template v-if="col.slot || col.render" #default="scope">
            <slot
              v-if="col.slot"
              :name="col.slot"
              :row="scope.row"
              :index="scope.$index"
            ></slot>
            <RenderVNode
              v-else-if="col.render"
              :render-fn="col.render"
              :scope="scope"
            />
          </template>
        </el-table-column>
      </template>
    </el-table>

    <div
      v-if="pagination"
      class="flex justify-end p-4 border-t border-gray-50 h-12"
    >
      <el-pagination
        size="small"
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
import {
  ref,
  computed,
  defineComponent,
  h,
  useSlots,
  type PropType,
} from "vue";

defineOptions({
  inheritAttrs: false,
});

interface Column {
  prop?: string;
  label?: string;
  width?: string | number;
  slot?: string;
  headerSlot?: string;
  type?: string;
  icon?: string;
  color?: string;
  render?: (scope: any) => any;
  headerRender?: (scope: any) => any;
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
  height?: string | number | null;
  headerCellStyle?: any | null;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  pagination: false,
  total: 0,
  page: 1,
  limit: 10,
  height: "calc(100% - 65px)",
  headerCellStyle: undefined,
});

const emit = defineEmits([
  "update:page",
  "update:limit",
  "pagination-change",
  "expand-change",
]);
const slots = useSlots();

const expandRowKeys = ref<string[]>([]);

const getHeaderSlotRender = (slotName: string) => {
  return (scope: any) => slots[slotName]?.(scope);
};

const RenderVNode = defineComponent({
  name: "RenderVNode",
  props: {
    renderFn: {
      type: Function as PropType<(scope: any) => any>,
      required: false,
    },
    scope: {
      type: Object as PropType<any>,
      required: true,
    },
  },
  setup(props) {
    return () =>
      props.renderFn ? h("span", props.renderFn(props.scope)) : h("span");
  },
});

const tableRef = ref();
const expandedRows = ref<any[]>([]);

const isAllExpanded = ref(false);
const handleHeaderClick = (col: any) => {
  // console.log("🚀 ~ handleHeaderClick ~ col:", col)
  isAllExpanded.value = !isAllExpanded.value;
  if (isAllExpanded.value) {
    expandedRows.value = props.data.map((item) => item);
    expandRowKeys.value = props.data.map((item) => item.id);
  } else {
    expandedRows.value = [];
    expandRowKeys.value = [];
  }
};

const handleExpandChange = (row: any, expanded: any[]) => {
  expanded?.length === 0
    ? (isAllExpanded.value = false)
    : (isAllExpanded.value = true);
  expandedRows.value = expanded;
  emit("expand-change", row, expanded);
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

const resolvedHeight = computed(() => {
  if (props.height === null) return undefined;
  if (props.height !== undefined) return props.height;
  return props.pagination ? "calc(100% - 60px)" : "100%";
});

const resolvedHeaderCellStyle = computed(() => {
  if (props.headerCellStyle === null) return undefined;
  if (props.headerCellStyle !== undefined) return props.headerCellStyle;
  return {
    backgroundColor: "#F1F1F1",
    color: "#000",
    fontWeight: "600",
    fontSize: "14px",
  };
});
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

.base-table :deep(.el-scrollbar__bar) {
  opacity: 0 !important;
  transition: opacity 0.2s ease;
}

.base-table:hover :deep(.el-scrollbar__bar) {
  opacity: 1 !important;
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

.base-table :deep(.el-button) {
  border-radius: 6px !important;
}

.base-table :deep(.el-table__empty-block) {
  height: 100% !important;
}
</style>
