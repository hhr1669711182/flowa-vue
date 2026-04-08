<template>
  <Drawer
    :model-value="visible"
    :title="title"
    size="800px"
    @update:model-value="val => emit('update:visible', val)"
    @close="emit('close')"
  >
    <template #header>
      <div class="flex items-center justify-between w-full pr-4">
        <!-- Breadcrumb & Title -->
        <div>
          <div class="flex items-center text-xs text-gray-500 mb-1">
            <span class="text-blue-600 cursor-pointer" @click="emit('close')">Billing / Outbound</span>
            <span class="mx-1">/</span>
            <span>{{ form.title || 'Order Detail' }}</span>
          </div>
          <div class="flex items-center gap-3">
            <h2 class="text-xl font-bold text-gray-900">{{ form.title || 'Order Detail' }}</h2>
            <el-tag type="success" effect="light" round size="small" v-if="form.deliveryStatus === 'Delivered'">Delivered</el-tag>
            <el-tag type="warning" effect="light" round size="small" v-else-if="form.deliveryStatus">{{ form.deliveryStatus }}</el-tag>
          </div>
          <div class="text-xs text-gray-400 mt-1 flex items-center gap-2">
            <span>Fulfilled Date: {{ form.code }}</span>
            <div class="flex items-center gap-2 ml-2">
              <el-button link :icon="ShoppingCart" />
              <el-button link :icon="More" />
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #default>
      <div v-loading="loading" class="space-y-6 min-h-[120px]">
        <div v-if="!loading && !form.title && visible" class="text-gray-500 py-8 text-center">No data or load failed.</div>
        <!-- Order Details Card -->
        <div class="bg-white rounded-lg border border-gray-100 p-6 shadow-sm">
          <h3 class="text-base font-bold text-gray-900 mb-4">Order Details</h3>
          
          <div class="grid grid-cols-2 gap-x-12 gap-y-4 mb-6 pb-6 border-b border-gray-100">
            <div class="space-y-4">
              <div class="flex justify-between">
                <span class="text-gray-500 text-sm">Create Date</span>
                <span class="text-gray-900 font-medium text-sm">{{ form.code }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500 text-sm">Tracking No.</span>
                <span class="text-gray-900 font-medium text-sm">{{ form.trackingNo }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500 text-sm">Carrier</span>
                <span class="text-gray-900 font-medium text-sm">{{ form.carrier }}</span>
              </div>
            </div>
            
            <div class="space-y-4">
              <div class="flex justify-between">
                <span class="text-gray-500 text-sm">Fulfilled Date</span>
                <span class="text-gray-900 font-medium text-sm">{{ form.code }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500 text-sm">Sending to</span>
                <span class="text-gray-900 font-medium text-sm text-right max-w-[200px]">{{ form.sendingTo || '-' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500 text-sm">Method</span>
                <span class="text-gray-900 font-medium text-sm">{{ form.method }}</span>
              </div>
            </div>
          </div>

          <!-- Item Stats -->
          <div class="space-y-3 mb-6">
            <div class="flex justify-between">
              <span class="text-gray-500 text-sm">Item Quantity</span>
              <span class="text-gray-900 font-medium text-sm">{{ form.itemQuantity }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500 text-sm">Charging Weight (kg)</span>
              <span class="text-gray-900 font-medium text-sm">{{ form.chargingWeight }}</span>
            </div>
          </div>

          <!-- Cost Breakdown Table -->
          <div class="border border-gray-200 rounded-lg overflow-hidden mb-6">
            <div class="grid grid-cols-4 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 text-center">
              <div class="p-2 border-r border-gray-200">Picking</div>
              <div class="p-2 border-r border-gray-200">Packaging</div>
              <div class="p-2 border-r border-gray-200">Shipping</div>
              <div class="p-2">Tax</div>
            </div>
            
            <div class="grid grid-cols-8 text-xs text-gray-500 bg-gray-50 border-b border-gray-200 text-center">
              <div class="p-2 border-r border-gray-200">First Pick</div>
              <div class="p-2 border-r border-gray-200">Additional</div>
              <div class="p-2 border-r border-gray-200">Used</div>
              <div class="p-2 border-r border-gray-200">Cost</div>
              <div class="p-2 border-r border-gray-200">Shipping Cost</div>
              <div class="p-2 border-r border-gray-200">Doc Fee</div>
              <div class="p-2 border-r border-gray-200">VAT</div>
              <div class="p-2">Surcharge</div>
            </div>

            <div class="grid grid-cols-8 text-sm text-gray-900 bg-white text-center">
              <div class="p-3 border-r border-gray-200">{{ form.pickingFirst }}</div>
              <div class="p-3 border-r border-gray-200">{{ form.pickingAdditional }}</div>
              <div class="p-3 border-r border-gray-200">{{ form.packagingUsed }}</div>
              <div class="p-3 border-r border-gray-200">{{ form.packagingCost }}</div>
              <div class="p-3 border-r border-gray-200">{{ form.shippingCost }}</div>
              <div class="p-3 border-r border-gray-200">{{ form.docFee }}</div>
              <div class="p-3 border-r border-gray-200">{{ form.taxVat }}</div>
              <div class="p-3">{{ form.taxSurcharge }}</div>
            </div>
          </div>

          <!-- Total Footer -->
          <div class="flex justify-between items-center pt-2 border-t border-gray-100">
            <span class="text-lg font-bold text-gray-900">Total</span>
            <span class="text-xl font-bold text-gray-900">{{ form.grandTotal }}</span>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <!-- Footer content if needed -->
    </template>
  </Drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Drawer } from '@/components/base/Drawer'
import { ShoppingCart, More } from '@element-plus/icons-vue'
import { getOutboundBillingDetail } from '@/api/billing/outbound'

const props = defineProps<{
  visible: boolean
  billingDetailId?: string
  company?: string
}>()

const emit = defineEmits(['update:visible', 'close', 'save', 'delete'])

const form = ref<any>({})
const loading = ref(false)
const title = computed(() => '') // Custom header used

function fmtUsd(v: unknown): string {
  if (v == null || v === '') return '$0.00'
  const n = Number(v)
  return Number.isFinite(n) ? `$${n.toFixed(2)}` : '$0.00'
}
function fmtDate(v: unknown): string {
  if (!v) return '-'
  const s = String(v)
  return s.length >= 10 ? s.slice(0, 10) : s
}

watch([() => props.visible, () => props.billingDetailId], async ([visible, id]) => {
  if (visible && id) {
    loading.value = true
    form.value = {}
    try {
      const res = await getOutboundBillingDetail(id, props.company).send()
      const msg = (res as any)?.message ?? res
      const d = msg?.success ? msg.data : msg?.data
      if (d && typeof d === 'object') {
        const parts = [d.destination_postcode, d.au_zone, d.destination_country].filter(Boolean)
        form.value = {
          title: d.sales_order || d.name || 'Order Detail',
          code: fmtDate(d.pack_time || d.order_time),
          trackingNo: d.tracking_no || '-',
          carrier: '-',
          method: 'Regular Shipping',
          sendingTo: parts.length ? parts.join(', ') : '-',
          itemQuantity: String(d.item_qty ?? '-'),
          chargingWeight: d.charge_weight != null ? `${d.charge_weight} kg` : '-',
          pickingFirst: fmtUsd(d.first_pick_usd),
          pickingAdditional: fmtUsd(d.additional_pick_usd),
          packagingUsed: d.packing_item_code || '-',
          packagingCost: fmtUsd(d.packaging_usd),
          shippingCost: fmtUsd(d.shipping_fee_usd),
          docFee: fmtUsd(d.document_fee_usd),
          taxVat: fmtUsd(d.vat_usd),
          taxSurcharge: fmtUsd(d.vat_surcharge_usd),
          grandTotal: fmtUsd(d.total_cost_usd),
          deliveryStatus: d.status || 'Delivered',
        }
      }
    } catch (e) {
      console.error('Failed to load billing detail:', e)
    } finally {
      loading.value = false
    }
  } else if (!visible) {
    form.value = {}
  }
}, { immediate: true })
</script>