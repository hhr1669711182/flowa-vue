<template>
  <el-dialog
    :model-value="modelValue"
    title="Split order"
    width="min(960px, 96vw)"
    align-center
    destroy-on-close
    class="order-split-dialog"
    append-to-body
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div v-if="loading" class="py-14 text-center text-gray-500">Loading lines…</div>
    <div v-else class="space-y-4">
      <el-alert
        v-if="hasOutOfStockLine"
        type="error"
        show-icon
        :closable="false"
        class="!items-start"
      >
        <template #title>
          <span class="font-semibold">Out of Stock product</span>
        </template>
        <p class="text-sm mt-1 text-gray-700">
          Insufficient stock — one or more products in this order are currently out of stock.
        </p>
      </el-alert>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div class="text-xs font-medium text-gray-500 mb-1">Sales order</div>
          <el-input :model-value="salesOrderName || '—'" readonly size="large" class="!rounded-lg" />
        </div>
        <div>
          <div class="text-xs font-medium text-gray-500 mb-1">Platform ID</div>
          <el-input :model-value="platformIdDisplay" readonly size="large" class="!rounded-lg" />
        </div>
      </div>

      <div class="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div class="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50/80">
          <span class="text-sm font-semibold text-gray-900">Items ({{ lines.length }})</span>
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-600">Split out-of-stock products</span>
            <el-switch v-model="splitOosEnabled" @change="onSplitOosChange" />
          </div>
        </div>

        <el-table :data="lines" size="small" row-key="name" max-height="360" class="order-split-table">
          <el-table-column width="48" align="center">
            <template #default="{ row }">
              <el-checkbox
                :model-value="qtyFor(row) > 0"
                :disabled="row.qty <= 0"
                @change="(v: any) => toggleRowSplit(row, Boolean(v))"
              />
            </template>
          </el-table-column>
          <el-table-column label="Product" min-width="200">
            <template #default="{ row }">
              <div class="flex items-start gap-3 py-1">
                <div
                  class="w-10 h-10 shrink-0 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-[10px] text-gray-400"
                  aria-hidden
                >
                  SKU
                </div>
                <div class="min-w-0">
                  <div class="text-sm font-medium text-gray-900">
                    <span class="truncate">{{ row.itemName || row.itemCode }}</span>
                  </div>
                  <div class="text-xs text-gray-500 mt-0.5 font-mono">{{ row.itemCode }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="Details" prop="description" min-width="140" show-overflow-tooltip />
          <el-table-column label="Qty" width="88" align="right">
            <template #default="{ row }">
              <span class="tabular-nums">{{ row.qty }}</span>
            </template>
          </el-table-column>
          <el-table-column label="Inventory" width="120" align="center">
            <template #default="{ row }">
              <el-tag :type="lineInStock(row) ? 'success' : 'danger'" size="small" effect="plain">
                {{ lineInStock(row) ? "In Stock" : "Out of Stock" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="Split qty" width="130" align="center">
            <template #default="{ row }">
              <el-input-number
                :model-value="qtyFor(row)"
                :min="0"
                :max="maxSplitQty(row)"
                :precision="0"
                :step="1"
                step-strictly
                :disabled="row.qty <= 0"
                size="small"
                controls-position="right"
                class="!w-full max-w-[118px]"
                @update:model-value="(v: number | undefined) => setSplitQty(row, v)"
              />
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <el-button size="large" @click="emit('update:modelValue', false)">Cancel</el-button>
        <el-button type="primary" size="large" :loading="submitting" :disabled="!canSubmit" @click="submitSplits">
          Split order
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import type { OrderDetailLineItem } from "@/utils/flowaSalesOrderRowMap";
import { flowaOrderActionSplitLineToNewOrder, extractFlowaOrderActionResult } from "@/api/order/omsActions";

const props = defineProps<{
  modelValue: boolean;
  loading: boolean;
  lines: OrderDetailLineItem[];
  salesOrderName: string;
  company?: string;
  listRow?: Record<string, unknown> | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [v: boolean];
  success: [];
}>();

const splitQtyByLine = reactive<Record<string, number>>({});
const splitOosEnabled = ref(false);
const submitting = ref(false);

function str(v: unknown) {
  return v == null ? "" : String(v).trim();
}

const platformIdDisplay = computed(() => {
  const r = props.listRow;
  if (!r) return "—";
  return str(r.platformId ?? r.platform_id) || "—";
});

function orderLevelOos(): boolean {
  const inv = str(props.listRow?.inventoryStatus ?? props.listRow?.inventory_status).toLowerCase();
  return inv.includes("out") || inv.includes("缺货") || inv === "out of stock";
}

/** Per-line stock: currently mirrors order-level hint when set; otherwise in stock. */
function lineInStock(row: OrderDetailLineItem) {
  if (orderLevelOos()) return false;
  return true;
}

const hasOutOfStockLine = computed(() => props.lines.some((l) => !lineInStock(l)));

function maxSplitQty(row: OrderDetailLineItem) {
  return Math.max(0, Math.floor(Number(row.qty) || 0));
}

function qtyFor(row: OrderDetailLineItem) {
  const q = splitQtyByLine[row.name];
  return q != null && !Number.isNaN(Number(q)) ? Math.floor(Number(q)) : 0;
}

function setSplitQty(row: OrderDetailLineItem, v: number | undefined) {
  if (!row.name) return;
  const n = Math.floor(Number(v));
  if (!n || n <= 0) {
    splitQtyByLine[row.name] = 0;
    return;
  }
  splitQtyByLine[row.name] = Math.min(n, maxSplitQty(row));
}

function toggleRowSplit(row: OrderDetailLineItem, on: boolean) {
  if (!row.name || row.qty <= 0) return;
  splitQtyByLine[row.name] = on ? maxSplitQty(row) : 0;
}

function resetSplitQuantities() {
  Object.keys(splitQtyByLine).forEach((k) => delete splitQtyByLine[k]);
  for (const line of props.lines) {
    splitQtyByLine[line.name] = 0;
  }
}

watch(
  () =>
    [props.modelValue, props.lines.map((l) => `${l.name}:${l.qty}`).join("|")] as const,
  () => {
    if (!props.modelValue || !props.lines.length) return;
    splitOosEnabled.value = false;
    resetSplitQuantities();
  }
);

function onSplitOosChange() {
  if (!splitOosEnabled.value) return;
  for (const line of props.lines) {
    if (!lineInStock(line) && line.qty > 0) splitQtyByLine[line.name] = maxSplitQty(line);
  }
}

const canSubmit = computed(() => {
  if (!props.salesOrderName?.trim() || !props.company?.trim()) return false;
  return props.lines.some((l) => {
    const q = qtyFor(l);
    return q > 0 && q <= maxSplitQty(l);
  });
});

async function submitSplits() {
  const id = props.salesOrderName.trim();
  const company = props.company;
  if (!id || !company?.trim()) {
    ElMessage.warning("Missing order or company");
    return;
  }
  const ops = props.lines
    .filter((l) => qtyFor(l) > 0)
    .map((l) => ({ name: l.name, qty: qtyFor(l) }))
    .filter((o) => {
      const line = props.lines.find((x) => x.name === o.name);
      return line != null && o.qty <= maxSplitQty(line);
    });
  if (!ops.length) {
    ElMessage.warning("Enter a split quantity for at least one line");
    return;
  }
  submitting.value = true;
  let lastNew = "";
  try {
    for (const op of ops) {
      const raw = await flowaOrderActionSplitLineToNewOrder({
        sales_order_name: id,
        company,
        item_row_name: op.name,
        qty: op.qty,
      }).send();
      const r = extractFlowaOrderActionResult(raw);
      if (!r.ok) {
        ElMessage.error(r.error || "Split failed");
        return;
      }
      lastNew = String((r.data?.new_order ?? lastNew) || "");
    }
    ElMessage.success(
      lastNew ? `Split completed. New draft: ${lastNew}` : "Split completed"
    );
    emit("success");
    emit("update:modelValue", false);
  } catch {
    ElMessage.error("Request failed");
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.order-split-dialog :deep(.el-dialog__body) {
  padding-top: 8px;
}
.order-split-table :deep(.el-input-number) {
  width: 100%;
}
</style>
