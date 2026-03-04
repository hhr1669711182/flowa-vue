<template>
  <el-form ref="formRef" :model="form" :rules="rules" size="large" class="auth-card">
    <div class="text-center mb-15">
      <h2 class="title">Welcome To Flowa</h2>
      <p class="subtitle">Ship globally. Faster. Smarter. From China.</p>
    </div>
    <el-form-item prop="email" class="mb-4">
      <div class="label">Email</div>
      <el-input v-model="form.email" :prefix-icon="User" placeholder="Enter your email" class="input" />
    </el-form-item>
    <el-form-item prop="password" class="mb-6">
      <div class="label">Password</div>
      <el-input v-model="form.password" :prefix-icon="Lock" type="password" placeholder="Enter your password" show-password class="input" />
    </el-form-item>
    <div class="flex items-center justify-between mb-6">
      <el-checkbox v-model="form.remember" custom-class="text-[#6B6B6B]">Remember for 30 Days</el-checkbox>
      <a class="link" @click="$emit('forgot')">Forgot password?</a>
    </div>
    <el-button type="primary" class="primary-btn" :loading="loading" @click="submit">Sign In</el-button>
    <div class="mt-5 text-center text-sm text-[#6B6B6B]">
      Don't have an account?
      <a class="link" @click="$emit('signup')">Sign Up</a>
    </div>
  </el-form>
  <!-- <div class="mt-6 text-center">
    <p class="copyright">© 2025 Flowa OMS. All rights reserved.</p>
  </div> -->
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { login } from '@/api/auth'
import { useRequest } from 'alova/client'

const emit = defineEmits<{
  (e: 'forgot'): void
  (e: 'signup'): void
}>()
const formRef = ref()
const { send: sendLogin, loading } = useRequest(
  (payload: { email: string; password: string; remember?: boolean }) => login(payload),
  { immediate: false }
)
const form = reactive({
  email: '',
  password: '',
  remember: false
})
const rules = {
  email: [{ required: true, message: 'Please enter email', trigger: 'blur' }],
  password: [{ required: true, message: 'Please enter password', trigger: 'blur' }]
}
const submit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    try {
      const res = await sendLogin({ email: form.email, password: form.password, remember: form.remember })
      localStorage.setItem('token', res.token)
      ElMessage.success('Login successfully')
      window.location.href = '#/'
    } catch (e: any) {
      ElMessage.error(e?.message || 'Login failed')
    }
  })
}
</script>

<style scoped lang="less">
.auth-card {
  padding: 0 13%;
}
.title {
  font-size: 32px;
  line-height: 36px;
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
.copyright {
  font-size: 12px;
  color: #9aa0a6;
}
</style>
