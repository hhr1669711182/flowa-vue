<template>
  <Dialog
    :model-value="visible"
    :width="dialogWidth"
    :title="dialogTitle"
    :show-close="true"
    @update:model-value="(val) => emit('update:visible', val)"
    @close="handleClose"
  >
    <div v-if="step === 1" class="flex flex-col items-center text-center py-4">
      <div
        class="w-12 h-12 rounded-full border-2 border-orange-100 flex items-center justify-center mb-6 bg-orange-50"
      >
        <span class="text-orange-500 text-2xl font-bold">!</span>
      </div>

      <h2 class="text-2xl font-bold text-gray-900 mb-4">Insufficient Credit</h2>

      <p class="text-gray-600 mb-8 max-w-sm mx-auto leading-relaxed">
        Your current balance is too low to process orders or perform actions on
        the platform.
        <br /><br />
        To keep your orders moving smoothly and avoid interruptions, please
        recharge your Flowa credit.
      </p>

      <div class="flex gap-4 w-full justify-center">
        <el-button size="large" class="!px-8 !rounded-lg" @click="handleClose"
          >Cancel</el-button
        >
        <el-button
          type="primary"
          size="large"
          class="!px-8 !rounded-lg !bg-[#FF7F2A] !border-[#FF7F2A]"
          @click="step = 2"
        >
          Recharge Credit Now
        </el-button>
      </div>
    </div>

    <div v-else-if="step === 2" class="py-2">
      <div class="mb-6">
        <p class="text-gray-500 mb-1">
          Add credit to your Flowa balance to continue processing orders and
          using all platform features.
        </p>
        <p class="text-gray-500">
          In the next step, you'll choose your payment method and local currency
          through our secure payment provider.
        </p>
      </div>

      <div class="mb-8">
        <label class="block text-xs font-medium text-gray-500 uppercase mb-2"
          >Amount to Add (USD)</label
        >
        <el-input
          v-model="amount"
          size="large"
          placeholder="$ 0,00"
          class="amount-input"
          :formatter="
            (value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          "
          :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
        />
      </div>

      <div class="flex justify-between mt-8">
        <el-button size="large" class="!px-8 !rounded-lg" @click="handleClose"
          >Cancel</el-button
        >
        <el-button
          type="primary"
          size="large"
          class="!px-8 !rounded-lg !bg-[#16215B] !border-[#16215B]"
          @click="handleRecharge"
          :disabled="!amount"
        >
          Continue to Payment
        </el-button>
      </div>
    </div>

    <div
      v-else-if="step === 3"
      class="flex flex-col items-center text-center py-4"
    >
      <div class="w-10 h-10 mb-6 relative flex items-center justify-center">
        <div
          class="absolute inset-0 border-4 border-blue-100 rounded-full border-t-blue-600 animate-spin"
          v-if="loading"
        >
          <Icon icon="svg-icon:circle-dashed" :size="40" color="#1E10C7" />
        </div>
        <div
          class="absolute inset-0 border-4 border-blue-600 rounded-full"
          v-else
        ></div>
        <Icon icon="svg-icon:check" :size="40" color="green" v-if="!loading" />
      </div>

      <h2 class="text-2xl font-bold text-gray-900 mb-4">Secure Payment</h2>

      <p class="text-gray-600 mb-8 max-w-sm mx-auto leading-relaxed">
        You'll be redirected to our secure payment gateway to complete your
        recharge.
        <br /><br />
        Once the payment is confirmed, your Flowa credit will be updated
        automatically and you'll be able to continue using the platform.
      </p>

      <div class="flex gap-4 w-full justify-center">
        <el-button size="large" class="!px-8 !rounded-lg" @click="handleClose"
          >Cancel</el-button
        >
        <el-button
          type="primary"
          size="large"
          class="!px-8 !rounded-lg !bg-[#16215B] !border-[#16215B]"
          :loading="loading"
          @click="handleDone"
        >
          {{ loading ? "Processing..." : "Done" }}
        </el-button>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { Dialog } from "@/components/base/Dialog";
import { createRechargePayment } from "@/api/dashboard";
import { useAuthStore } from "@/store/modules/auth";
import { ElMessage } from "element-plus";

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits(["update:visible", "success"]);

const step = ref(1);
const amount = ref("");
const loading = ref(false);

const dialogWidth = computed(() => {
  return step.value === 2 ? "600px" : "480px";
});

const dialogTitle = computed(() => {
  if (step.value === 2) return "Recharge Your Flowa Credit";
  return "";
});

watch(
  () => props.visible,
  (val) => {
    if (val) {
      step.value = 1;
      amount.value = "";
      loading.value = false;
    }
  },
);

const handleClose = () => {
  emit("update:visible", false);
};

const authStore = useAuthStore();

const handleRecharge = async () => {
  const amt = Number(String(amount.value).replace(/\D/g, "")) || 0;
  if (amt < 1) {
    ElMessage.warning("Please enter a valid amount");
    return;
  }
  step.value = 3;
  loading.value = true;
  const payWindow = window.open("", "_blank");
  try {
    const company = authStore.company || authStore.companies?.[0];
    const res = await createRechargePayment({ amount: amt, company });
    const anyRes = res as any;
    const payload =
      anyRes?.message && typeof anyRes.message === "object"
        ? anyRes.message
        : anyRes;
    const url =
      payload?.data?.payment_url ||
      payload?.payment_url ||
      payload?.redirect_url;
    const ok =
      typeof payload?.success === "boolean" ? payload.success : !!url;
    if (ok && url) {
      ElMessage.success("Payment link created. Redirecting...");
      if (payWindow) {
        payWindow.location.href = url;
        payWindow.focus?.();
      } else {
        window.location.href = url;
      }
      emit("success");
      handleClose();
    } else {
      if (payWindow && !payWindow.closed) payWindow.close();
      ElMessage.error(
        payload?.error ||
          anyRes?.error ||
          payload?.message ||
          anyRes?.message ||
          "Failed to create payment"
      );
      step.value = 2;
    }
  } catch (e: any) {
    if (payWindow && !payWindow.closed) payWindow.close();
    ElMessage.error(e?.message || "Failed to create payment");
    step.value = 2;
  } finally {
    loading.value = false;
  }
};

const handleDone = () => {
  if (!loading.value) {
    emit("success");
    handleClose();
  }
};
</script>

<style scoped>
:deep(.amount-input .el-input__wrapper) {
  padding: 8px 16px;
  font-size: 18px;
  font-weight: 600;
}
</style>
