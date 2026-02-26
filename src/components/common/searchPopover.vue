<template>
  <el-popover
    v-model:visible="visible"
    placement="bottom-start"
    trigger="click"
    width="560"
    popper-class="search-popover"
  >
    <div class="search-panel">
      <el-skeleton v-if="loading" :rows="3" animated />
      <div v-else class="search-list">
        <div v-for="item in items" :key="item.id" class="search-item">
          <Icon icon="svg-icon:yf" class="search-image" :size="44" />
          <!-- <img :src="item.image" class="search-image" /> -->
          <div class="search-info">
            <div class="search-title">{{ item.name }}</div>
            <div class="search-sku">SKU {{ item.sku }}</div>
          </div>
          <div class="search-desc">{{ item.desc }}</div>
          <div class="search-qty">
            <div class="search-qty-value">{{ item.qty }}</div>
            <div class="search-qty-label">Total Available</div>
          </div>
        </div>
        <div v-if="items.length === 0" class="search-empty">No results</div>
      </div>
    </div>
    <template #reference>
      <slot />
    </template>
  </el-popover>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface SearchItem {
  id: number;
  name: string;
  sku: string;
  desc: string;
  qty: number;
  image: string;
}

interface Props {
  modelValue: boolean;
  items: SearchItem[];
  loading?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(["update:modelValue"]);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});
</script>

<style scoped>
.search-panel {
  padding: 6px 4px;
}

.search-list {
  display: grid;
  gap: 10px;
}

.search-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 6px;
  border-radius: 10px;
}

.search-image {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  object-fit: cover;
  border: 1px solid #e5e7eb;
}

.search-info {
  display: grid;
  gap: 2px;
  min-width: 140px;
}

.search-title {
  font-weight: 600;
  color: #111827;
}

.search-sku {
  font-size: 12px;
  color: #9ca3af;
}

.search-desc {
  flex: 1;
  font-size: 12px;
  color: #9ca3af;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}

.search-qty {
  text-align: right;
  min-width: 90px;
}

.search-qty-value {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

.search-qty-label {
  font-size: 12px;
  color: #9ca3af;
}

.search-empty {
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
  padding: 10px 0;
}
</style>
