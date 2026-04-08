<template>
  <el-dialog
    :model-value="modelValue"
    title="Add Items"
    width="min(960px, 96vw)"
    align-center
    destroy-on-close
    class="oms-add-items-dialog"
    append-to-body
    @update:model-value="emit('update:modelValue', $event)"
  >
    <p class="text-sm text-gray-600 mb-4 leading-relaxed">Add products to this order.</p>

    <div class="mb-4">
      <el-input
        v-model="searchQuery"
        size="large"
        clearable
        placeholder="Search by SKU or name…"
        class="oms-search-input"
        @keyup.enter="runSearch"
      >
        <template #prefix>
          <Icon icon="svg-icon:search" class="text-gray-400" />
        </template>
        <template #append>
          <el-button :loading="searchLoading" @click="runSearch">Search</el-button>
        </template>
      </el-input>
      <div
        v-if="searchHits.length"
        class="mt-2 max-h-44 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-sm"
      >
        <button
          v-for="hit in searchHits"
          :key="String(hit.name ?? hit.item_code)"
          type="button"
          class="w-full text-left px-3 py-2.5 text-sm border-b border-gray-100 last:border-0 hover:bg-gray-50 flex justify-between gap-2"
          @click="addPendingFromHit(hit)"
        >
          <span class="font-medium text-gray-900">{{ hit.item_code }}</span>
          <span class="text-gray-600 truncate">{{ hit.item_name }}</span>
        </button>
      </div>
    </div>

    <div v-loading="linesLoading" class="space-y-6 max-h-[52vh] overflow-y-auto pr-1">
      <div v-if="existingRows.length">
        <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Current items</div>
        <el-table :data="existingRows" size="small" border class="rounded-lg oms-items-table">
          <el-table-column label="SKU" prop="itemCode" min-width="120" />
          <el-table-column label="Name" prop="itemName" min-width="160" show-overflow-tooltip />
          <el-table-column label="Details" prop="description" min-width="140" show-overflow-tooltip />
          <el-table-column label="Qty" prop="qty" width="80" align="right" />
          <el-table-column label="Rate" width="110" align="right">
            <template #default="{ row }">
              <span class="tabular-nums">{{ formatMoney(row.rate, currency) }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div v-if="pendingRows.length">
        <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">New items</div>
        <el-table :data="pendingRows" size="small" border class="rounded-lg oms-items-table">
          <el-table-column label="SKU" prop="itemCode" min-width="110" />
          <el-table-column label="Name" prop="itemName" min-width="140" show-overflow-tooltip />
          <el-table-column label="Qty" width="120" align="center">
            <template #default="{ row }">
              <el-input-number v-model="row.qty" :min="0.0001" :precision="4" :controls="true" size="small" class="!w-full" />
            </template>
          </el-table-column>
          <el-table-column label="Price" width="130" align="center">
            <template #default="{ row }">
              <el-input-number
                v-model="row.rate"
                :min="0"
                :precision="4"
                size="small"
                class="!w-full"
              />
            </template>
          </el-table-column>
          <el-table-column label="" width="56" align="center" fixed="right">
            <template #default="{ $index }">
              <el-button type="danger" link @click="pendingRows.splice($index, 1)">
                <Icon icon="svg-icon:trash-bin" />
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <p v-if="!existingRows.length && !pendingRows.length && !linesLoading" class="text-sm text-gray-400 text-center py-6">
        Search above to add SKUs, or load order lines.
      </p>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <el-button size="large" @click="emit('update:modelValue', false)">Cancel</el-button>
        <el-button type="primary" size="large" :loading="saveLoading" :disabled="!pendingRows.length || !canSave" @click="submitAll">
          Save
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { getInventoryProducts } from "@/api/inventory";
import { getInProgressOrderDetail } from "@/api/order/inProgress";
import { extractOmsSalesOrderDetail } from "@/utils/frappeResponse";
import { extractOrderDetailLineItems, type OrderDetailLineItem } from "@/utils/flowaSalesOrderRowMap";
import {
  flowaOrderActionAddLineItem,
  extractFlowaOrderActionResult,
} from "@/api/order/omsActions";

type Hit = Record<string, unknown>;

type PendingRow = {
  key: string;
  itemCode: string;
  itemName: string;
  description: string;
  qty: number;
  rate: number;
};

const props = defineProps<{
  modelValue: boolean;
  salesOrderName: string;
  company?: string;
  initialLineItems?: OrderDetailLineItem[];
  currency?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [v: boolean];
  saved: [];
}>();

const currency = computed(() => (props.currency || "USD").trim() || "USD");
const canSave = computed(() => Boolean(props.salesOrderName?.trim() && props.company?.trim()));

const searchQuery = ref("");
const searchLoading = ref(false);
const searchHits = ref<Hit[]>([]);
const existingRows = ref<OrderDetailLineItem[]>([]);
const pendingRows = ref<PendingRow[]>([]);
const linesLoading = ref(false);
const saveLoading = ref(false);

function formatMoney(v: number | undefined | null, cur: string) {
  const c = (cur || "USD").trim() || "USD";
  if (v == null || Number.isNaN(Number(v))) return "—";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: c }).format(Number(v));
  } catch {
    return `${c} ${Number(v).toFixed(2)}`;
  }
}

async function loadExistingLines() {
  linesLoading.value = true;
  try {
    if (props.initialLineItems && props.initialLineItems.length) {
      existingRows.value = [...props.initialLineItems];
      return;
    }
    if (!props.salesOrderName?.trim()) {
      existingRows.value = [];
      return;
    }
    const raw = await getInProgressOrderDetail(props.salesOrderName.trim(), props.company).send();
    const doc = extractOmsSalesOrderDetail(raw);
    existingRows.value = extractOrderDetailLineItems(doc);
  } catch {
    existingRows.value = [];
  } finally {
    linesLoading.value = false;
  }
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      pendingRows.value = [];
      searchHits.value = [];
      searchQuery.value = "";
      void loadExistingLines();
    }
  }
);

async function runSearch() {
  const kw = searchQuery.value.trim();
  if (!kw) {
    searchHits.value = [];
    return;
  }
  if (!props.company?.trim()) {
    ElMessage.warning("Company is required to search items");
    return;
  }
  searchLoading.value = true;
  try {
    const { list } = await getInventoryProducts({
      company: props.company,
      keyword: kw,
      page: 1,
      pageSize: 20,
    });
    searchHits.value = Array.isArray(list) ? (list as Hit[]) : [];
    if (!searchHits.value.length) ElMessage.info("No items found");
  } catch {
    searchHits.value = [];
    ElMessage.error("Search failed");
  } finally {
    searchLoading.value = false;
  }
}

function addPendingFromHit(hit: Hit) {
  const code = String(hit.item_code ?? hit.name ?? "").trim();
  if (!code) return;
  if (pendingRows.value.some((p) => p.itemCode === code)) {
    ElMessage.info("Already in new items");
    return;
  }
  const vr = Number(hit.valuation_rate ?? 0) || 0;
  pendingRows.value.push({
    key: `p-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    itemCode: code,
    itemName: String(hit.item_name ?? code),
    description: "",
    qty: 1,
    rate: vr,
  });
  searchHits.value = [];
  searchQuery.value = "";
}

async function submitAll() {
  if (!canSave.value || !pendingRows.value.length) return;
  saveLoading.value = true;
  try {
    for (const p of pendingRows.value) {
      const raw = await flowaOrderActionAddLineItem({
        sales_order_name: props.salesOrderName.trim(),
        company: props.company,
        item_code: p.itemCode,
        qty: p.qty,
        is_gift: false,
        ...(p.rate == null ? {} : { rate: p.rate }),
      }).send();
      const r = extractFlowaOrderActionResult(raw);
      if (!r.ok) {
        ElMessage.error(`${p.itemCode}: ${r.error || "Failed"}`);
        saveLoading.value = false;
        return;
      }
    }
    ElMessage.success("Lines added");
    emit("saved");
    emit("update:modelValue", false);
  } catch {
    ElMessage.error("Request failed");
  } finally {
    saveLoading.value = false;
  }
}
</script>

<style scoped>
.oms-search-input :deep(.el-input__wrapper) {
  border-radius: 10px 0 0 10px;
}
.oms-items-table :deep(.el-input-number) {
  width: 100%;
}
</style>
