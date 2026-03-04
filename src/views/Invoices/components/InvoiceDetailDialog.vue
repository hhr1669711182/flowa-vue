<template>
  <el-dialog
    :model-value="modelValue"
    width="760px"
    destroy-on-close
    @update:model-value="(val: boolean) => emit('update:modelValue', val)"
  >
    <template #header>
      <div class="pr-8">
        <h3 class="text-xl font-bold text-black">{{ invoice?.invoiceId || 'Invoice Details' }}</h3>
        <p class="text-sm text-[#6B6B6B] mt-1">{{ invoice?.reference || '--' }}</p>
      </div>
    </template>

    <div v-loading="loading" class="space-y-5">
      <div class="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
        <div class="flex justify-between border-b border-[#ECECEC] pb-2">
          <span class="text-[#6B6B6B]">Invoice Date</span>
          <span class="font-medium text-black">{{ invoice?.invoiceDate || '--' }}</span>
        </div>
        <div class="flex justify-between border-b border-[#ECECEC] pb-2">
          <span class="text-[#6B6B6B]">Due Date</span>
          <span class="font-medium text-black">{{ invoice?.dueDate || '--' }}</span>
        </div>
        <div class="flex justify-between border-b border-[#ECECEC] pb-2 col-span-2">
          <span class="text-[#6B6B6B]">Issued for Period</span>
          <span class="font-medium text-black">
            {{ invoice?.periodStart || '--' }} - {{ invoice?.periodEnd || '--' }}
          </span>
        </div>
      </div>

      <el-table
        :data="invoice?.lineItems || []"
        border
        size="small"
        :header-cell-style="{ background: '#F7F7F7', color: '#000000' }"
      >
        <el-table-column prop="description" label="Description" min-width="220" />
        <el-table-column prop="quantity" label="Qty" width="80" align="center" />
        <el-table-column label="Unit Price" width="120" align="right">
          <template #default="{ row }">${{ row.unitPrice.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column label="Amount" width="120" align="right">
          <template #default="{ row }">${{ row.amount.toFixed(2) }}</template>
        </el-table-column>
      </el-table>

      <div class="flex justify-end">
        <div class="w-[240px] border border-[#ECECEC] rounded-lg p-4 space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-[#6B6B6B]">Status</span>
            <span class="font-semibold">{{ invoice?.status || '--' }}</span>
          </div>
          <div class="flex justify-between text-base font-bold">
            <span>Total</span>
            <span>${{ invoice?.total?.toLocaleString() || '0.00' }}</span>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <el-button @click="emit('update:modelValue', false)">Close</el-button>
        <el-button type="primary" @click="invoice && emit('download', invoice)">
          Download PDF
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import type { InvoiceRecord } from '@/api/invoices'

interface Props {
  modelValue: boolean
  loading?: boolean
  invoice: InvoiceRecord | null
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'download', invoice: InvoiceRecord): void
}>()
</script>
