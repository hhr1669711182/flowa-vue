<template>
  <div class="bundles h-full flex flex-col">
    <div class="flex justify-between items-center mb-4 flex-shrink-0">
      <div>
        <div class="flex items-center gap-1 line-height-22px">
          <div class="text-#000 text-28px line-height-36px">Inventory</div>
          <div class="text-#9A9A9A text-20px pt-1">/Bundles</div>
        </div>
        <div class="text-14px text-#6B6B6B">
          Create and manage product bundles. Combine items, edit configurations,
          and control bundled inventory.
        </div>
      </div>
      <div class="flex items-center gap-3">
        <el-button type="primary" size="large" @click="handleCreateBundle">
          <span class="flex items-center gap-1.5">
            <Icon icon="svg-icon:plus" color="#fff" />
            <span>Create Bundle</span>
          </span>
        </el-button>
      </div>
    </div>

    <BundleFilter ref="filterRef" @search="handleFilterSearch" />

    <div class="flex-1 min-h-0 rounded-xl overflow-hidden mt-3">
      <BaseTable
        :data="tableData"
        :columns="columns"
        :loading="loading"
        :pagination="true"
        :total="total"
        v-model:page="page"
        v-model:limit="limit"
        @pagination-change="fetchData"
        @expand-change="handleExpandChange"
      >
        <template #bundle="{ row }">
          <div class="flex items-center gap-3">
            <div
              class="w-8 h-8 rounded bg-gray-100 flex-shrink-0 overflow-hidden"
            >
              <img :src="row.image" class="w-full h-full object-cover" />
            </div>
            <div class="flex flex-col">
              <span class="text-sm font-bold text-gray-900">{{
                row.name
              }}</span>
              <span class="text-xs text-gray-500">{{ row.sku }}</span>
            </div>
          </div>
        </template>

        <template #items="{ row }">
          <div class="flex flex-col text-xs text-gray-500">
            <span
              v-for="(item, idx) in (row.items || []).slice(0, 2)"
              :key="idx"
            >
              {{ item.name }} x{{ item.qty }}
            </span>
            <span v-if="(row.items || []).length > 2">...</span>
          </div>
        </template>

        <template #inventory="{ row }">
          <el-tag
            effect="dark"
            class="!rounded-full !px-3 !border-none"
            :class="
              row.stock > 0
                ? '!bg-[#E6F4EA] !text-[#1E8E3E]'
                : '!bg-[#FCE8E6] !text-[#D93025]'
            "
          >
            {{ row.stock > 0 ? "In Stock" : "Out of Stock" }}
          </el-tag>
        </template>

        <template #packWeight>
          <span class="text-gray-600">0,5 g</span>
        </template>

        <template #cog="{ row }">
          <span class="text-gray-600">$ {{ row.price }}</span>
        </template>

        <template #actions="{ row }">
          <div class="flex items-center">
            <el-button class="w-8 h-8" @click="handleEdit(row)">
              <Icon icon="svg-icon:pencil" color="#16215B" />
            </el-button>
            <el-popover
              placement="bottom-start"
              trigger="click"
              popper-class="!p-0 !px-2 !min-w-auto !rounded-lg !w-auto"
              :show-arrow="false"
            >
              <template #reference>
                <el-button class="w-8 h-8">
                  <Icon icon="svg-icon:ellipsis-vertical" color="#16215B" />
                </el-button>
              </template>
              <rightButtons :row="row" @action="handleRowAction" />
            </el-popover>
          </div>
        </template>

        <template #expand="{ row }">
          <BundleExpandDetail
            :bundle="row"
            :items="bundleDetailMap[row.id]?.items || []"
            :loading="!!bundleDetailLoadingMap[row.id]"
            @item-deleted="handleItemDeleted"
          />
        </template>
      </BaseTable>
    </div>

    <BundleDetail
      v-model="detailVisible"
      :bundle-id="currentBundleId"
      @save="fetchData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import BaseTable from "../../components/common/BaseTable.vue";
import BundleFilter from "./components/BundleFilter.vue";
import BundleDetail from "./components/BundleDetail.vue";
import BundleExpandDetail from "./components/BundleExpandDetail.vue";
import { getBundleDetail, getInventoryBundles } from "@/api/inventory";
import { ElMessage } from "element-plus";

const filterRef = ref();
const currentFilters = ref({});
const detailVisible = ref(false);
const currentBundleId = ref<string | undefined>(undefined);

const columns = [
  { type: "expand", slot: "expand", width: 40, label: "" }, // Add expand column
  { label: "Bundle / Barcode", slot: "bundle", width: 280 },
  { label: "Items", slot: "items" },
  { label: "Inventory", slot: "inventory", width: 140 },
  { label: "Packaging Weight", slot: "packWeight", width: 160 },
  { label: "COG", slot: "cog", width: 140 },
  {
    label: "Actions",
    slot: "actions",
    width: 100,
    fixed: "right",
    align: "center",
  },
];

const tableData = ref<any[]>([]);
const loading = ref(false);
const total = ref(0);
const page = ref(1);
const limit = ref(10);
const bundleDetailMap = ref<Record<string, any>>({});
const bundleDetailLoadingMap = ref<Record<string, boolean>>({});

const fetchData = async () => {
  loading.value = true;
  try {
    const response = await getInventoryBundles({
      page: page.value,
      pageSize: limit.value,
      ...currentFilters.value,
    });
    tableData.value = response.list;
    total.value = response.total;
  } catch (error) {
    console.error("Failed to fetch bundles:", error);
  } finally {
    loading.value = false;
  }
};

const handleFilterSearch = (params: any) => {
  currentFilters.value = params;
  page.value = 1;
  fetchData();
};

const handleCreateBundle = () => {
  currentBundleId.value = undefined;
  detailVisible.value = true;
};

const handleEdit = (row: any) => {
  currentBundleId.value = row.id;
  detailVisible.value = true;
};

const handleRowAction = (action: string, row: any) => {
  switch (action) {
    case "view":
    case "edit":
      handleEdit(row);
      break;
    case "export":
      ElMessage.info(`Export/Print for bundle ${row.id}`);
      break;
    case "support":
      ElMessage.info(`Contact support for bundle ${row.id}`);
      break;
    case "delete":
      ElMessage.warning(`Delete action for bundle ${row.id}`);
      break;
    default:
      break;
  }
};

const handleExpandChange = async (row: any, expanded: any[]) => {
  if (!row?.id) return;
  const isExpanded = Array.isArray(expanded) && expanded.includes(row);
  if (!isExpanded) return;
  if (bundleDetailMap.value[row.id]) return;
  bundleDetailLoadingMap.value = {
    ...bundleDetailLoadingMap.value,
    [row.id]: true,
  };
  try {
    const res = await getBundleDetail(row.id);
    bundleDetailMap.value = { ...bundleDetailMap.value, [row.id]: res };
  } catch (error) {
    console.error("Failed to fetch bundle detail:", error);
  } finally {
    bundleDetailLoadingMap.value = {
      ...bundleDetailLoadingMap.value,
      [row.id]: false,
    };
  }
};

const handleItemDeleted = (payload: { bundleId: string; itemId: string }) => {
  const current = bundleDetailMap.value[payload.bundleId];
  if (!current?.items || !Array.isArray(current.items)) return;
  bundleDetailMap.value = {
    ...bundleDetailMap.value,
    [payload.bundleId]: {
      ...current,
      items: current.items.filter((item: any) => item.id !== payload.itemId),
    },
  };
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped lang="less"></style>
