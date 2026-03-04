<template>
  <div>
    <div class="text-center mb-15">
      <h2 class="title">Email Verification</h2>
      <p class="subtitle">
        Enter the 5-digit code we sent to your email to confirm your identity.
      </p>
    </div>
    <div class="mb-4">
      <div class="label">Email</div>
      <el-input
        v-model="email"
        :prefix-icon="Message"
        placeholder="email@address.com"
        class="input"
      />
    </div>
    <div class="code-row">
      <input
        v-for="(_, i) in digits"
        :key="i"
        ref="digitRefs"
        class="code-input"
        maxlength="1"
        inputmode="numeric"
        pattern="[0-9]*"
        v-model="digits[i]"
        @input="onInput(i)"
        @keydown.backspace="onBackspace(i)"
      />
    </div>
    <div class="divider mt-5"></div>
    <el-button
      type="primary"
      class="primary-btn mt-6"
      :loading="loading"
      @click="submit"
      >Continue</el-button
    >
    <div class="mt-4 text-center text-sm text-[#6B6B6B]">
      Didn't receive the code?
      <a class="link" @click="resend">Resend.</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { Message } from "@element-plus/icons-vue";
import { resendEmailCode, verifyEmailCode } from "@/api/auth";

const emit = defineEmits<{
  (e: "register"): void;
}>();

const email = ref("");
const loading = ref(false);
const digits = ref<string[]>(["", "", "", "", ""]);
const digitRefs = ref<HTMLInputElement[]>([] as unknown as HTMLInputElement[]);
const onInput = (i: number) => {
  const cur = digits.value[i] ?? "";
  digits.value[i] = cur.replace(/\\D/g, "").slice(0, 1);
  const next = digitRefs.value[i + 1];
  if (digits.value[i] && next) next.focus();
};
const onBackspace = (i: number) => {
  const prev = digitRefs.value[i - 1];
  if (!digits.value[i] && prev) prev.focus();
};
const submit = () => {
  loading.value = true;
  const code = digits.value.join("");
  verifyEmailCode({ email: email.value, code })
    .then((res) => {
      if (res.ok) {
        ElMessage.success("Email verified");
        emit("register");
      } else {
        ElMessage.warning(res.message || "Invalid code");
      }
    })
    .finally(() => (loading.value = false));
};
const resend = () => {
  resendEmailCode({ email: email.value }).then(() => {
    ElMessage.success("Code resent");
  });
};
</script>

<style scoped lang="less">
.auth-card {
  background: #ffffff;
  border: 1px solid #ececec;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
  max-width: 480px;
}
.title {
  font-size: 28px;
  line-height: 32px;
  font-weight: 700;
  color: #16215b;
}
.subtitle {
  color: #6b6b6b;
}

.label {
  font-weight: 600;
  color: #000000;
  margin-bottom: 4px;
}
.input :deep(.el-input__wrapper) {
  min-height: 44px;
  border-width: 1.5px;
  border-color: #ececec;
  border-radius: 12px;
  box-shadow: 0 0 0 1px #ececec inset;
}
.code-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin-top: 16px;
}
.code-input {
  height: 48px;
  border: 1.5px solid #ececec;
  border-radius: 12px;
  text-align: center;
  font-size: 20px;
}
.primary-btn {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  font-size: 16px;
  background: #16215b;
  border-color: #16215b;
}
.link {
  color: #16215b;
  font-weight: 600;
  cursor: pointer;
}
</style>
