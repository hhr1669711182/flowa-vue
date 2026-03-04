<template>
  <el-form ref="formRef" :model="form" :rules="rules" size="large" class="auth-card">
    <div class="text-center mb-15">
      <h2 class="title">Reset your new password</h2>
      <p class="subtitle">Please provide your email to reset your password and regain access to your account.</p>
    </div>
    <el-form-item prop="email" class="mb-3">
      <div class="label">Email</div>
      <el-input v-model="form.email" :prefix-icon="Message" placeholder="email@address.com" class="input" />
    </el-form-item>
    <div v-if="errorTip" class="error-tip">
      {{ errorTip }}
    </div>
    <el-button type="primary" class="primary-btn mt-4" :loading="loading" @click="submit">Continue</el-button>
    <div class="mt-4 text-center text-sm text-[#6B6B6B]">
      Don't have an account?
      <a class="link" @click="$emit('signup')">Sign Up</a>
    </div>
  </el-form>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { Message } from '@element-plus/icons-vue'
import { requestPasswordReset } from '@/api/auth'
import { ElMessage } from 'element-plus'

const emit = defineEmits<{
  (e: 'verify'): void
  (e: 'signup'): void
}>()

const formRef = ref()
const loading = ref(false)
const errorTip = ref('')
const form = reactive({
  email: ''
})
const rules = {
  email: [{ required: true, message: 'Please enter email', trigger: 'blur' }]
}
const submit = async () => {
  errorTip.value = ''
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    const res = await requestPasswordReset({ email: form.email })
    if (!res.ok) {
      errorTip.value = res.message || 'Email not found'
      return
    }
    ElMessage.success('Verification code sent')
    emit('verify')
  })
}
</script>

<style scoped lang="less">
.auth-card {
  padding: 0 13%;
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
.error-tip {
  margin-top: 6px;
  background: #ffecec;
  color: #b00020;
  border: 1px solid #ffb3b3;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 13px;
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
