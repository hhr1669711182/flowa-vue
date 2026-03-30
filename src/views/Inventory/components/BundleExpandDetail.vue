<template>
  <div class="py-4 px-6 bg-#F7F7F7">
    <div class="bg-#fff rounded-lg border border-gray-200">
      <div
        class="grid grid-cols-[2fr_1fr] items-center px-6 py-3 !border-b-1.5 border-0 border-solid border-#ECECEC"
      >
        <div class="flex flex-col items-start">
          <span class="text-xl font-bold text-#000">
            {{ bundle.name }}
          </span>
          <span class="text-sm text-#9A9A9A">
            Last Update: {{ bundle.lastUpdated }}
          </span>
        </div>
        <div class="text-left">
          <div class="text-sm text-#6B6B6B">
            Bundle Name
            <span class="text-#000 text-16px ml-1">{{ bundle.name }}</span> 
          </div>
          <div class="text-sm text-#6B6B6B mt-1">
            Barcode
            <span class="text-#000 text-16px ml-1">{{ bundle.sku }}</span>
          </div>
        </div>
      </div>

      <BaseTable
        :data="items"
        :columns="innerColumns"
        :loading="loading"
        :pagination="false"
      >
        <template #product="{ row: item }">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded bg-gray-100 flex-shrink-0">
              <img
                src="https://via.placeholder.com/40"
                class="w-full h-full object-cover rounded"
              />
            </div>
            <div>
              <div class="font-bold text-gray-900">{{ item.name }}</div>
              <div class="text-xs text-gray-500">SKU {{ item.sku }}</div>
            </div>
          </div>
        </template>

        <template #details="{ row: item }">
          <span class="text-gray-500 truncate block">{{ item.details }}</span>
        </template>

        <template #quantity="{ row: item }">
          <div class="flex flex-col items-center">
            <span class="font-medium">{{ item.qty }}</span>
            <el-tag
              size="small"
              effect="dark"
              class="!rounded-full mt-1 !border-none"
              :class="
                item.stockStatus === 'In Stock'
                  ? '!bg-[#E6F4EA] !text-[#1E8E3E]'
                  : '!bg-[#FCE8E6] !text-[#D93025]'
              "
            >
              {{ item.stockStatus }}
            </el-tag>
          </div>
        </template>

        <template #actions="{ row: item }">
          <el-button class="w-8 h-8" @click="onDeleteInfo(item)">
            <Icon icon="svg-icon:delete" color="#C62828" />
          </el-button>
        </template>
      </BaseTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { deleteBundleItem } from "@/api/inventory";

const props = defineProps<{
  bundle: any;
  items: any[];
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: "item-deleted", payload: { bundleId: string; itemId: string }): void;
}>();

const innerColumns = [
  { label: "Product/ SKU ID", slot: "product", width: 300 },
  { label: "Details", slot: "details" },
  { label: "Quantity", slot: "quantity", width: 150 },
  { label: "Actions", slot: "actions", width: 100, align: "right" },
];

const onDeleteInfo = async (item: any) => {
  if (!props.bundle?.id || !item?.id) return;
  try {
    await deleteBundleItem(props.bundle.id, item.id);
    emit("item-deleted", { bundleId: props.bundle.id, itemId: item.id });
  } catch (error) {
    console.error("Failed to delete bundle item:", error);
  }
};
</script>

<style scoped lang="less"></style>
