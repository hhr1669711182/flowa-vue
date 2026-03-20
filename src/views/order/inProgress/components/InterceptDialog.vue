<template>
  <el-dialog
    :model-value="visible"
    width="760px"
    destroy-on-close
    :show-close="true"
    align-center
    @close="emit('update:visible', false)"
  >
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div class="text-#000 font-700">Confirm Order Interception</div>
      </div>
    </template>

    <div class="space-y-4">
      <div class="px-4 py-3 rounded-lg bg-[#FDEAEA]">
        <div class="text-12px text-[#C62828] font-500">
          Intercepting this order will stop it from being shipped. Do you want to continue?
        </div>
      </div>

      <div class="bg-#fff rounded-lg border border-#ECECEC">
        <div class="px-6 py-4">
          <div class="flex justify-between items-start">
            <div>
              <div class="flex items-center gap-3">
                <div class="text-#000 font-700">{{ record?.title || record?.orderId }}</div>
                <span class="px-2 py-0.5 rounded text-xs font-medium bg-[#EEF2FF] text-[#1D4ED8]">
                  {{ record?.status }}
                </span>
              </div>
              <div class="text-12px text-#6B6B6B mt-1">
                {{ record?.stage }}
                <span class="mx-1">/</span>
                Due Date: {{ record?.dueDate }}
              </div>
            </div>
            <div class="text-right text-xs text-#6B6B6B">
              <div>
                Sending to <span class="text-#000 font-600">{{ record?.destination }}</span>
              </div>
              <div class="mt-1">
                Estimated arrived at
                <span class="text-#000 font-600">{{ record?.etaText }}</span>
              </div>
            </div>
          </div>

          <div class="mt-4">
            <Steps
              :steps="steps"
              :active="active"
              :show-state-icon="true"
            />
          </div>

          <div class="mt-4 text-sm">
            <span class="text-#6B6B6B">Tracking No.:</span>
            <span class="text-#000 font-700 ml-1">{{ record?.trackingNo }}</span>
          </div>
        </div>
      </div>

      <div v-if="service" class="bg-#fff rounded-lg border border-#ECECEC overflow-hidden">
        <div class="px-6 py-4 flex justify-between items-start">
          <div>
            <div class="text-#000 font-700">{{ service.id }}</div>
            <div class="text-12px text-#6B6B6B mt-1">
              Type: {{ service.type }}
              <span class="mx-1">/</span>
              {{ service.typeDescription }}
            </div>
          </div>
          <div class="text-right text-xs text-#6B6B6B">
            <div>Approved Date {{ service.approvedDate }}</div>
            <div class="mt-1">Approved By {{ service.approvedBy }}</div>
          </div>
        </div>

        <div class="px-6 pb-4">
          <div class="grid grid-cols-2 text-xs text-#6B6B6B border-t border-#ECECEC">
            <div class="py-3 border-b border-#ECECEC">Price</div>
            <div class="py-3 border-b border-#ECECEC text-right text-#000 font-600">{{ service.price }}</div>
            <div class="py-3 border-b border-#ECECEC">UOM</div>
            <div class="py-3 border-b border-#ECECEC text-right text-#000 font-600">{{ service.uom }}</div>
            <div class="py-3 border-b border-#ECECEC">Quantity</div>
            <div class="py-3 border-b border-#ECECEC text-right text-#000 font-600">{{ service.quantity }}</div>
            <div class="py-3 border-b border-#ECECEC">Subtotal</div>
            <div class="py-3 border-b border-#ECECEC text-right text-#000 font-600">{{ service.subtotal }}</div>
          </div>

          <div class="flex justify-between items-center mt-4">
            <div class="text-#000 font-700">Total</div>
            <div class="text-#000 font-700">{{ service.total }}</div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-between items-center w-full">
        <el-button class="!px-6" @click="emit('update:visible', false)">Cancel</el-button>
        <el-button type="primary" class="!px-6 !bg-[#0A123C]" @click="emit('confirm')">
          Cancel Order
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Steps } from "@/components/base/Steps";

const props = defineProps<{
  visible: boolean;
  record: any;
  steps: any[];
  active: number;
}>();

const emit = defineEmits<{
  (e: "update:visible", val: boolean): void;
  (e: "confirm"): void;
}>();

const service = computed(() => {
  const list = props.record?.services;
  return Array.isArray(list) ? list[0] : undefined;
});
</script>

