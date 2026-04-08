<template>
  <el-dialog
    :model-value="modelValue"
    title="Edit shipping address"
    width="560px"
    align-center
    destroy-on-close
    class="oms-shipping-address-dialog"
    append-to-body
    @update:model-value="emit('update:modelValue', $event)"
  >
    <el-form label-position="top" class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0 oms-edit-form">
      <el-form-item label="First name">
        <el-input v-model="form.firstName" clearable size="large" class="oms-input" />
      </el-form-item>
      <el-form-item label="Last name">
        <el-input v-model="form.lastName" clearable size="large" class="oms-input" />
      </el-form-item>
      <el-form-item label="Phone" class="sm:col-span-2">
        <el-input v-model="form.phone" clearable size="large" class="oms-input" />
      </el-form-item>
      <el-form-item label="Address line 1" class="sm:col-span-2">
        <el-input v-model="form.address1" clearable size="large" class="oms-input" />
      </el-form-item>
      <el-form-item label="Address line 2" class="sm:col-span-2">
        <el-input v-model="form.address2" clearable size="large" class="oms-input" />
      </el-form-item>
      <el-form-item label="City">
        <el-input v-model="form.city" clearable size="large" class="oms-input" />
      </el-form-item>
      <el-form-item label="Province / State">
        <el-input v-model="form.province" clearable size="large" class="oms-input" />
      </el-form-item>
      <el-form-item label="Province code">
        <el-input v-model="form.provinceCode" clearable size="large" class="oms-input" />
      </el-form-item>
      <el-form-item label="ZIP / Postcode">
        <el-input v-model="form.zip" clearable size="large" class="oms-input" />
      </el-form-item>
      <el-form-item label="Country" class="sm:col-span-2">
        <el-input v-model="form.country" clearable size="large" placeholder="e.g. United States" class="oms-input" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="flex justify-end gap-2">
        <el-button size="large" @click="emit('update:modelValue', false)">Cancel</el-button>
        <el-button type="primary" size="large" :loading="saving" :disabled="!canSave" @click="onSave">Save</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import {
  flowaOrderActionUpdateShopifyShipping,
  extractFlowaOrderActionResult,
} from "@/api/order/omsActions";

/** 与后端 `_OMS_SHOPIFY_SHIPPING_MERGE_KEYS` / Shopify camelCase 一致 */
function buildShippingPayload(f: Record<string, string>): Record<string, string> {
  const keys = [
    "firstName",
    "lastName",
    "name",
    "phone",
    "company",
    "address1",
    "address2",
    "city",
    "province",
    "provinceCode",
    "zip",
    "country",
  ] as const;
  const out: Record<string, string> = {};
  for (const k of keys) {
    out[k] = String(f[k] ?? "").trim();
  }
  const combined = [out.firstName, out.lastName].filter(Boolean).join(" ").trim();
  if (!out.name && combined) out.name = combined;
  return out;
}

function emptyForm() {
  return {
    firstName: "",
    lastName: "",
    name: "",
    phone: "",
    company: "",
    address1: "",
    address2: "",
    city: "",
    province: "",
    provinceCode: "",
    zip: "",
    country: "",
  };
}

const props = defineProps<{
  modelValue: boolean;
  salesOrderName: string;
  company?: string;
  /** Snapshot when opening (e.g. from drawer shipping form) */
  initialFields: Record<string, string>;
}>();

const emit = defineEmits<{
  "update:modelValue": [v: boolean];
  saved: [];
}>();

const form = reactive(emptyForm());
const saving = ref(false);

const canSave = computed(() => Boolean(props.salesOrderName?.trim() && props.company?.trim()));

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return;
    Object.assign(form, emptyForm(), props.initialFields || {});
  }
);

async function onSave() {
  if (!canSave.value) {
    ElMessage.warning("Missing order or company");
    return;
  }
  saving.value = true;
  try {
    const payload = buildShippingPayload(form);
    const raw = await flowaOrderActionUpdateShopifyShipping({
      sales_order_name: props.salesOrderName.trim(),
      company: props.company,
      shipping_updates: JSON.stringify(payload),
    }).send();
    const r = extractFlowaOrderActionResult(raw);
    if (!r.ok) {
      ElMessage.error(r.error || "Save failed");
      return;
    }
    ElMessage.success(r.message || "Saved");
    emit("saved");
    emit("update:modelValue", false);
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : String(e || "Save failed");
    ElMessage.error(m || "Save failed");
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.oms-edit-form :deep(.el-form-item__label) {
  color: #6b7280;
  font-size: 13px;
  font-weight: 500;
  padding-bottom: 4px;
}
.oms-input :deep(.el-input__wrapper) {
  border-radius: 10px;
  padding: 4px 12px;
  min-height: 42px;
}
</style>
