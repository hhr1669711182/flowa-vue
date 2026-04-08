<template>
  <el-drawer
    :model-value="modelValue"
    :title="drawerTitle"
    :size="width"
    direction="rtl"
    destroy-on-close
    class="order-detail-drawer"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div v-if="loading" class="py-12 text-center text-gray-500">Loading…</div>
    <div v-else-if="row" class="px-1 pb-4 flex flex-col min-h-0">
      <div class="pb-3 border-b border-gray-200 shrink-0">
        <div class="flex flex-wrap items-center gap-2 mb-1">
          <el-tag effect="dark" :class="orderRowStatusTagClass(row)">
            {{ orderRowStatusText(row) }}
          </el-tag>
          <span
            v-if="docstatusLabel"
            class="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-medium"
          >
            {{ docstatusLabel }}
          </span>
        </div>
        <div class="text-xs text-gray-500 flex flex-wrap gap-x-4 gap-y-1">
          <span>Create <span class="text-gray-900 font-medium">{{ row.createDate }}</span></span>
          <span>Due <span class="text-gray-900 font-medium">{{ row.dueDate }}</span></span>
          <span v-if="destinationDisplay !== '—'"
            >Destination <span class="text-gray-900 font-medium">{{ destinationDisplay }}</span></span
          >
        </div>
      </div>

      <el-tabs v-model="activeTab" class="order-detail-tabs mt-3 flex-1 min-h-0">
        <el-tab-pane label="Order details" name="order">
          <div class="space-y-4 pt-1">
            <div class="rounded-lg border border-gray-200 bg-gray-50/80 p-3">
              <div class="text-xs text-gray-500 mb-2">Tracking overview</div>
              <p class="text-sm text-gray-800 mb-3">
                Sending to: <span class="font-medium">{{ destinationDisplay }}</span>
              </p>
              <div class="flex flex-wrap gap-2">
                <div
                  v-for="(step, i) in fulfilmentSteps"
                  :key="step.title"
                  class="flex-1 min-w-[100px] rounded-md border px-2 py-2 text-center transition-colors"
                  :class="fulfilmentStepClass(i)"
                >
                  <div class="text-[11px] font-semibold text-gray-900 leading-tight">{{ step.title }}</div>
                  <div class="text-[10px] text-gray-500 mt-0.5">{{ step.hint }}</div>
                </div>
              </div>
            </div>

            <div>
              <div class="text-sm font-semibold text-gray-900 mb-2">Order summary</div>
              <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div v-for="f in orderDetailFields" :key="f.label" class="flex justify-between gap-2">
                  <dt class="text-gray-500 shrink-0">{{ f.label }}</dt>
                  <dd class="text-gray-900 font-medium text-right break-all">{{ f.value }}</dd>
                </div>
              </dl>
            </div>

            <div v-if="remarks">
              <div class="text-sm font-semibold text-gray-900 mb-2">Order note</div>
              <p class="text-sm text-gray-800 whitespace-pre-wrap break-words rounded-lg border border-gray-100 p-3 bg-white">
                {{ remarks }}
              </p>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="Product info" name="products">
          <div class="space-y-4 pt-1">
            <div>
              <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div class="text-sm font-semibold text-gray-900">Items</div>
                <el-button
                  type="primary"
                  size="small"
                  class="!font-semibold shrink-0"
                  :disabled="!canAddLineItem"
                  @click="emit('add-items')"
                >
                  <span class="inline-flex items-center gap-1.5">
                    <Icon icon="svg-icon:plus" />
                    Add items
                  </span>
                </el-button>
              </div>
              <BaseTable :data="lineItems" :columns="lineColumns" :pagination="false" />
            </div>
            <div class="rounded-lg border border-gray-200 p-3">
              <div class="text-sm font-semibold text-gray-900 mb-2">Packaging</div>
              <dl class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div class="flex justify-between gap-2">
                  <dt class="text-gray-500">Total net weight</dt>
                  <dd class="text-gray-900 font-medium text-right">{{ packagingWeightDisplay }}</dd>
                </div>
                <div class="flex justify-between gap-2">
                  <dt class="text-gray-500">Charging weight (list)</dt>
                  <dd class="text-gray-900 font-medium text-right">{{ chargingWeightDisplay }}</dd>
                </div>
              </dl>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="Buyer info" name="buyer">
          <div class="space-y-4 pt-1">
            <div class="text-sm font-semibold text-gray-900">Customer info</div>
            <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div v-for="f in buyerInfoFields" :key="f.label" class="flex justify-between gap-2">
                <dt class="text-gray-500 shrink-0">{{ f.label }}</dt>
                <dd class="text-gray-900 font-medium text-right break-words">{{ f.value }}</dd>
              </div>
            </dl>
            <div class="rounded-lg border border-dashed border-gray-200 p-3">
              <div class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Buyer comments</div>
              <p class="text-sm text-gray-400">—</p>
            </div>
            <div class="rounded-lg border border-dashed border-gray-200 p-3">
              <div class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Buyer notes</div>
              <p class="text-sm text-gray-400">—</p>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="Logistics and shipping" name="logistics">
          <div class="space-y-4 pt-1">
            <div class="text-sm font-semibold text-gray-900 mb-2">Logistics</div>
            <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div v-for="f in logisticsFields" :key="f.label" class="flex justify-between gap-2">
                <dt class="text-gray-500 shrink-0">{{ f.label }}</dt>
                <dd class="text-gray-900 font-medium text-right break-all">{{ f.value }}</dd>
              </div>
            </dl>

            <div class="rounded-lg border border-gray-200 p-4">
              <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div class="text-sm font-semibold text-gray-900">Shipping address</div>
                <el-button type="primary" size="default" :disabled="!canSaveShipping" @click="shippingDlgVisible = true">
                  Edit address
                </el-button>
              </div>
              <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div v-for="f in shippingAddressFields" :key="f.label" class="flex justify-between gap-2">
                  <dt class="text-gray-500 shrink-0">{{ f.label }}</dt>
                  <dd class="text-gray-900 font-medium text-right break-all">{{ f.value }}</dd>
                </div>
              </dl>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>

      <div class="flex justify-end mt-4 pt-4 border-t border-gray-100 shrink-0">
        <el-button class="!font-semibold !px-4 !h-9 !color-[#F6540C]" @click="emit('contact-support')">
          <span class="flex items-center gap-2">
            <Icon icon="svg-icon:headphones" />
            Contact Support
          </span>
        </el-button>
      </div>
    </div>
    <div v-else class="py-12 text-center text-gray-500">Open an order to see details</div>

    <OrderShippingAddressDialog
      v-model="shippingDlgVisible"
      :sales-order-name="String(row?.id ?? '')"
      :company="props.company"
      :initial-fields="shippingFormSnapshot"
      @saved="emit('shipping-saved')"
    />
  </el-drawer>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { orderRowStatusTagClass, orderRowStatusText } from "@/utils/orderRowStatusDisplay";
import type { OrderDetailLineItem } from "@/utils/flowaSalesOrderRowMap";
import OrderShippingAddressDialog from "./OrderShippingAddressDialog.vue";

const FULFILMENT_STEPS = [
  { title: "Review & Fix", hint: "Approval" },
  { title: "Warehouse", hint: "Awaiting" },
  { title: "Export", hint: "Awaiting" },
  { title: "Local delivery", hint: "Awaiting" },
  { title: "Delivered", hint: "Done" },
] as const;

function norm(s: string) {
  return s.trim().toLowerCase();
}

function str(v: unknown): string {
  if (v == null) return "";
  return String(v).trim();
}

function parseShopifyAddress(addr: unknown): Record<string, string> {
  if (!addr || typeof addr !== "object" || Array.isArray(addr)) return {};
  const o = addr as Record<string, unknown>;
  return {
    firstName: str(o.firstName),
    lastName: str(o.lastName),
    recipientName: str(o.name),
    line1: str(o.address1 ?? o.addressLine1 ?? o.line1),
    line2: str(o.address2 ?? o.addressLine2),
    city: str(o.city),
    province: str(o.province ?? o.state),
    provinceCode: str(o.provinceCode),
    zip: str(o.zip ?? o.postalCode ?? o.postcode),
    country: str(o.country),
    countryCode: str(o.countryCode),
    countryCodeV2: str(o.countryCodeV2),
    phone: str(o.phone),
    company: str(o.company),
  };
}

function fulfilmentStepIndex(statusKey: string, statusDisplay: string): number {
  const k = `${statusKey} ${statusDisplay}`.toLowerCase();
  if (/\b(closed|completed)\b/.test(k) || /\bdelivered\b/.test(k)) return 4;
  if (/fulfil|fulfill|track|in transit|shipping|export|customs/.test(k)) return 3;
  if (/to bill|billing|invoice/.test(k)) return 2;
  if (/to deliver|pick|pack|warehouse|ready/.test(k)) return 1;
  return 0;
}

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    loading: boolean;
    row: Record<string, any> | null;
    doc: Record<string, unknown> | null;
    lineItems: OrderDetailLineItem[];
    width?: string;
    /** Required to save shipping → custom_shop_raw_data */
    company?: string;
  }>(),
  { width: "760px", row: null, doc: null, lineItems: () => [], company: undefined }
);

const emit = defineEmits<{
  "update:modelValue": [v: boolean];
  "contact-support": [];
  "shipping-saved": [];
  /** Open add-line-items dialog for current order (parent uses row.id + company). */
  "add-items": [];
}>();

const canAddLineItem = computed(() => Boolean(props.row?.id && props.company?.trim()));

function emptyShippingForm() {
  return {
    firstName: "",
    lastName: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    province: "",
    provinceCode: "",
    zip: "",
    country: "",
  };
}

const shippingForm = reactive(emptyShippingForm());
const shippingDlgVisible = ref(false);

const shippingFormSnapshot = computed(() => ({
  firstName: shippingForm.firstName,
  lastName: shippingForm.lastName,
  phone: shippingForm.phone,
  address1: shippingForm.address1,
  address2: shippingForm.address2,
  city: shippingForm.city,
  province: shippingForm.province,
  provinceCode: shippingForm.provinceCode,
  zip: shippingForm.zip,
  country: shippingForm.country,
}));

const shippingDisplayName = computed(() => {
  const parts = [shippingForm.firstName, shippingForm.lastName].filter(Boolean).join(" ").trim();
  return parts || "—";
});

/** Same row layout as Logistics: label (gray) + value (right, medium). */
const shippingAddressFields = computed(() => {
  const s = shippingForm;
  const streetParts = [str(s.address1), str(s.address2)].filter(Boolean);
  const street = streetParts.length ? streetParts.join(" · ") : "—";
  const provBits = [str(s.province), str(s.provinceCode)].filter(Boolean).join(" · ");
  const zip = str(s.zip);
  let provZip = "—";
  if (provBits && zip) provZip = `${provBits}, ${zip}`;
  else if (zip) provZip = zip;
  else if (provBits) provZip = provBits;
  return [
    { label: "Recipient", value: shippingDisplayName.value },
    { label: "Phone", value: str(s.phone) || "—" },
    { label: "Street", value: street },
    { label: "City", value: str(s.city) || "—" },
    { label: "Province / ZIP", value: provZip },
    { label: "Country", value: str(s.country) || "—" },
  ];
});

function loadShippingFormFromDoc() {
  const addr = props.doc?.shipping_address;
  const o = typeof addr === "object" && addr && !Array.isArray(addr) ? (addr as Record<string, unknown>) : {};
  Object.assign(shippingForm, emptyShippingForm(), {
    firstName: str(o.firstName),
    lastName: str(o.lastName),
    phone: str(o.phone),
    address1: str(o.address1 ?? o.addressLine1),
    address2: str(o.address2 ?? o.addressLine2),
    city: str(o.city),
    province: str(o.province ?? o.state),
    provinceCode: str(o.provinceCode),
    zip: str(o.zip ?? o.postalCode ?? o.postcode),
    country: str(o.country),
  });
}

watch(
  () => [props.modelValue, props.doc?.shipping_address] as const,
  () => {
    if (props.modelValue && props.doc) loadShippingFormFromDoc();
  },
  { deep: true, immediate: true }
);

const canSaveShipping = computed(() => Boolean(props.row?.id && props.company?.trim()));

const activeTab = ref("order");

watch(
  () => props.modelValue,
  (open) => {
    if (open) activeTab.value = "order";
  }
);

const drawerTitle = computed(() => {
  const id = props.row?.orderId;
  return id ? `Order ${id}` : "Order details";
});

const lineColumns = [
  { label: "#", prop: "idx", width: 48 },
  { label: "Item code", prop: "itemCode", width: 120 },
  { label: "Item name", prop: "itemName", minWidth: 140 },
  { label: "Details", prop: "description", minWidth: 120 },
  { label: "Qty", prop: "qty", width: 72, align: "right" as const },
  { label: "UOM", prop: "uom", width: 72 },
];

const currencyCode = computed(() => String(props.doc?.currency ?? "USD").trim() || "USD");

function formatMoney(v: number | undefined | null, currency: string) {
  const cur = (currency || "USD").trim() || "USD";
  if (v == null || Number.isNaN(Number(v))) return "—";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: cur }).format(Number(v));
  } catch {
    return `${cur} ${Number(v).toFixed(2)}`;
  }
}

const docstatusLabel = computed(() => {
  const d = props.doc;
  if (!d) return "";
  const ds = Number(d.docstatus);
  if (ds === 0) return "Draft";
  if (ds === 1) return "Submitted";
  if (ds === 2) return "Cancelled";
  return "";
});

type ShopifyCust = {
  display_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  locale?: string;
  created_at?: string;
  lifetime_duration?: string;
  number_of_orders?: number | null;
};

const shopifyCustomer = computed((): ShopifyCust | null => {
  const sc = props.doc?.shopify_customer;
  if (sc && typeof sc === "object" && !Array.isArray(sc)) return sc as ShopifyCust;
  return null;
});

const customerDisplay = computed(() => {
  const sc = shopifyCustomer.value;
  if (sc) {
    const dn = String(sc.display_name ?? "").trim();
    if (dn) return dn;
    const parts = [sc.first_name, sc.last_name].filter(Boolean).join(" ").trim();
    if (parts) return parts;
    const em = String(sc.email ?? "").trim();
    if (em) return em;
    return "—";
  }
  const r = props.row;
  const d = props.doc;
  if (!r && !d) return "—";
  const name = String(d?.customer_name ?? r?.customerName ?? "").trim();
  return name || "—";
});

const parsedShipping = computed(() => parseShopifyAddress(props.doc?.shipping_address));

const destinationDisplay = computed(() => {
  const r = props.row;
  const d = props.doc;
  const a = parsedShipping.value;
  const fromAddr = a.country || a.countryCodeV2 || a.countryCode;
  return (
    str(fromAddr) ||
    String(d?.destination_country ?? d?.custom_country ?? r?.customerRegion ?? r?.customerCountry ?? "").trim() ||
    "—"
  );
});

const fulfilmentSteps = FULFILMENT_STEPS;
const currentFulfilmentStep = computed(() =>
  fulfilmentStepIndex(
    String(props.row?.statusKey ?? props.doc?.status ?? ""),
    String(props.doc?.status_display ?? props.row?.status ?? "")
  )
);

function fulfilmentStepClass(i: number) {
  const cur = currentFulfilmentStep.value;
  if (i < cur) return "border-emerald-200 bg-emerald-50";
  if (i === cur) return "border-[#1e3a5f] bg-[#1e3a5f]/10 ring-1 ring-[#1e3a5f]/30";
  return "border-gray-200 bg-white";
}

const deliveryOrderNo = computed(() =>
  String(props.doc?.custom_delivery_order_no ?? props.doc?.yt_order_no ?? props.row?.platformId ?? "").trim() || "—"
);

const trackingNo = computed(() =>
  String(props.doc?.tracking_no ?? props.doc?.custom_delivery_no ?? props.row?.trackingNo ?? "").trim() || "—"
);

const totalQtyDisplay = computed(() => {
  const q = props.doc?.total_qty;
  if (q != null && q !== "") return String(q);
  return props.lineItems.length ? String(props.lineItems.reduce((s, it) => s + it.qty, 0)) : "—";
});

const grandTotalDisplay = computed(() => {
  const d = props.doc;
  if (!d) return "—";
  return formatMoney(Number(d.grand_total), String(d.currency ?? "USD"));
});

const remarks = computed(() => String(props.doc?.remarks ?? "").trim());

const orderDetailFields = computed(() => {
  const d = props.doc;
  const r = props.row;
  const wh = str(d?.set_warehouse);
  const customerPo = str(d?.po_no);
  const platformSku = str(d?.custom_yt_product_code);
  const payTime = str(d?.transaction_date ?? d?.order_time);
  return [
    { label: "Order ID", value: str(d?.name ?? r?.orderId) || "—" },
    { label: "Platform ID", value: customerPo || platformSku || str(r?.platformId) || "—" },
    { label: "Warehouse", value: wh || "—" },
    { label: "Delivery order no.", value: deliveryOrderNo.value },
    { label: "Tracking no.", value: trackingNo.value },
    { label: "Platform / ref. no.", value: str(d?.yt_order_no) || deliveryOrderNo.value },
    { label: "Pay time", value: payTime || "—" },
    { label: "Currency", value: currencyCode.value },
    { label: "Total qty", value: totalQtyDisplay.value },
    { label: "Grand total", value: grandTotalDisplay.value },
    { label: "Status", value: str(d?.status_display ?? d?.status ?? r?.status) || "—" },
  ];
});

const packagingWeightDisplay = computed(() => {
  const w = props.doc?.total_net_weight;
  if (w == null || w === "") return "—";
  const n = Number(w);
  if (!Number.isFinite(n) || n === 0) return "—";
  return `${w} kg`;
});

const chargingWeightDisplay = computed(() => {
  const w = Number(props.row?.chargingWeight);
  if (w > 0) return `${w} kg`;
  return "—";
});

const buyerInfoFields = computed(() => {
  const sc = shopifyCustomer.value;
  const a = parsedShipping.value;
  const email = str(sc?.email);
  const phone = str(sc?.phone) || a.phone;
  const country = a.country || a.countryCodeV2 || destinationDisplay.value;
  return [
    { label: "Customer name", value: customerDisplay.value },
    { label: "Email", value: email || "—" },
    { label: "Phone", value: phone || "—" },
    { label: "Country", value: country !== "—" ? country : "—" },
    { label: "State / Province", value: a.province || a.provinceCode || "—" },
    { label: "City", value: a.city || "—" },
    { label: "Postcode", value: a.zip || "—" },
    { label: "Street", value: a.line1 || "—" },
    { label: "Address line 2", value: a.line2 || "—" },
    { label: "Recipient (shipping)", value: a.recipientName || [a.firstName, a.lastName].filter(Boolean).join(" ").trim() || "—" },
    { label: "Language (locale)", value: str(sc?.locale) || "—" },
    { label: "Customer created (Shopify)", value: str(sc?.created_at) || "—" },
    { label: "Orders (Shopify)", value: sc?.number_of_orders != null ? String(sc.number_of_orders) : "—" },
  ];
});

const logisticsFields = computed(() => {
  const d = props.doc;
  const channel = shopifyCustomer.value ? "Shopify" : "—";
  const tn = trackingNo.value;
  const nw = packagingWeightDisplay.value;
  const cw = chargingWeightDisplay.value;
  return [
    { label: "Shipping channel", value: channel },
    { label: "Track no.", value: tn },
    { label: "Delivery no. / virtual no.", value: str(d?.custom_delivery_no) || tn },
    { label: "Outer carton / label", value: "—" },
    { label: "Estimated shipping cost", value: "—" },
    { label: "Real shipping cost", value: "—" },
    { label: "Total net weight", value: nw },
    { label: "Charging weight", value: cw },
    { label: "Destination (country)", value: destinationDisplay.value },
  ];
});

</script>

<style scoped>
.order-detail-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
}
.order-detail-tabs :deep(.el-tabs__item) {
  font-weight: 600;
  font-size: 13px;
}
.order-detail-tabs :deep(.el-tabs__item.is-active) {
  color: #1e3a5f;
}
.order-detail-tabs :deep(.el-tabs__active-bar) {
  background-color: #1e3a5f;
  height: 3px;
}
.order-detail-tabs :deep(.el-tab-pane) {
  max-height: calc(100vh - 220px);
  overflow-y: auto;
  padding-top: 12px;
}
</style>
