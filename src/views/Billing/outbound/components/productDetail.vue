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
            <span class="text-blue-600 cursor-pointer" @click="emit('close')">Billing / Orders</span>
            <span class="mx-1">/</span>
            <span>{{ form.title || 'Order Detail' }}</span>
          </div>
          <div class="flex items-center gap-3">
            <h2 class="text-xl font-bold text-gray-900">{{ form.title || 'Order Detail' }}</h2>
            <el-tag type="success" effect="light" round size="small" v-if="form.deliveryStatus === 'Delivered'">Delivered</el-tag>
            <el-tag type="warning" effect="light" round size="small" v-else>{{ form.deliveryStatus }}</el-tag>
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
      <div class="space-y-6">
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
                <span class="text-gray-900 font-medium text-sm text-right max-w-[200px]">Narangba, 4504, QLD, Australia</span>
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
import { getBillingOrderDetail } from '@/api/billing/orders'

const props = defineProps<{
  visible: boolean
  productId?: string | number
}>()

const emit = defineEmits(['update:visible', 'close', 'save', 'delete'])

const form = ref<any>({})
const title = computed(() => '') // Custom header used

watch(() => props.productId, async (id) => {
  if (id) {
    try {
      const res = await getBillingOrderDetail(id)
      form.value = res
    } catch (error) {
      console.error(error)
    }
  } else {
    form.value = {}
  }
}, { immediate: true })
</script>