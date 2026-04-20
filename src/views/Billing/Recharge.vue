<template>
  <div class="p-6 max-w-xl">
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-800">Top Up</h2>
      <p class="text-gray-500 mt-1">Enter the amount and submit to proceed to the payment page (USD).</p>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <el-form :model="form" label-position="top" @submit.prevent="onSubmit">
        <el-form-item label="Amount" required>
          <el-input-number
            v-model="form.amount"
            :min="1"
            :max="999999"
            :step="100"
            placeholder="Enter amount (USD)"
            class="w-full"
            size="large"
          />
        </el-form-item>
        <el-form-item v-if="companyOptions.length > 1" label="Company">
          <el-select v-model="form.company" placeholder="Select company" class="w-full" size="large">
            <el-option v-for="c in companyOptions" :key="c" :label="c" :value="c" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            class="!bg-[#1e3a8a] !border-none w-full"
            size="large"
            :loading="loading"
            @click="onSubmit"
          >
            Create payment
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { createRechargePayment } from '@/api/dashboard'
import { useAuthStore } from '@/store/modules/auth'
import { useRequest } from 'alova/client'

const authStore = useAuthStore()
const companyOptions = computed(() =>
  (authStore as any).companies?.length ? (authStore as any).companies : (authStore as any).company ? [(authStore as any).company] : []
)
const form = reactive({
  amount: 5000,
  company: '',
})

let payWindow: Window | null = null

const { loading, send: sendPaymentRequest, onSuccess: onPaymentSuccess, onError: onPaymentError } = useRequest(
  (amount: number, company: string) => createRechargePayment({ amount, company }),
  { immediate: false }
);

onPaymentSuccess(({ data: url }) => {
  if (url) {
    ElMessage.success('Payment link created. Redirecting...')
    if (payWindow) {
      payWindow.location.href = url
      payWindow.focus?.()
    } else {
      window.location.href = url
    }
  } else {
    if (payWindow && !payWindow.closed) payWindow.close()
    ElMessage.error('Failed to create payment link')
  }
});

onPaymentError(({ error }) => {
  if (payWindow && !payWindow.closed) payWindow.close()
  ElMessage.error(error.message || 'Failed to create payment')
});

function onSubmit() {
  const amount = Number(form.amount) || 0
  if (amount < 1) {
    ElMessage.warning('Please enter a valid amount')
    return
  }
  const company = form.company || (authStore as any).company || companyOptions.value[0] || undefined
  if (!company) {
    ElMessage.warning('Please select a company or wait for company to load')
    return
  }
  payWindow = window.open('', '_blank')
  sendPaymentRequest(amount, company)
}
</script>

