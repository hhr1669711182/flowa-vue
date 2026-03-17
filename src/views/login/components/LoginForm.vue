<template>
  <el-form ref="formRef" :model="form" :rules="rules" size="large" class="auth-card">
    <div class="text-center mb-15">
      <h2 class="title">Welcome To Flowa</h2>
      <p class="subtitle">Ship globally. Faster. Smarter. From China.</p>
    </div>
    <el-form-item prop="email" class="mb-4">
      <div class="label">Email</div>
      <el-input v-model="form.email" :prefix-icon="User" placeholder="Enter your email" class="input" @input="clearError" />
    </el-form-item>
    <el-form-item prop="password" class="mb-6">
      <div class="label">Password</div>
      <el-input v-model="form.password" :prefix-icon="Lock" type="password" placeholder="Enter your password" show-password class="input" @input="clearError" />
    </el-form-item>
    <div class="flex items-center justify-between mb-6">
      <el-checkbox v-model="form.remember" custom-class="text-[#6B6B6B]">Remember for 30 Days</el-checkbox>
      <a class="link" @click="$emit('forgot')">Forgot password?</a>
    </div>
    <div v-if="errorTip" class="error-tip mb-4">
      {{ errorTip }}
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
import { reactive, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { login } from '@/api/auth'
import { useRequest } from 'alova/client'
import {
  saveRememberCredentials,
  loadRememberCredentials,
  clearRememberCredentials
} from '@/utils/storage'
import { tryBrowserCredentialStore } from '@/utils/storage'
import { useUserStore } from '@/store/modules/user'

const emit = defineEmits<{
  (e: 'forgot'): void
  (e: 'signup'): void
}>()
const formRef = ref()
const userStore = useUserStore()
const { send: sendLogin, loading } = useRequest(
  (payload: { email: string; password: string; remember?: boolean }) => login(payload),
  { immediate: false }
)
const form = reactive({
  email: '',
  password: '',
  remember: false
})
const errorTip = ref('')
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
      if ('token' in res) {
        localStorage.setItem('token', res.token)
        userStore.setToken(res.token)
        userStore.setRememberMe(!!form.remember)
        userStore.setLoginInfo({ username: form.email, password: form.password })
        userStore.setUserInfo({
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
          username: res.user.name || form.email,
          password: '',
          role: res.user.role,
          roleId: res.user.role
        })
        if (form.remember) {
          await saveRememberCredentials({ email: form.email, password: form.password })
          await tryBrowserCredentialStore(form.email, form.password)
        } else {
          await clearRememberCredentials()
        }
        errorTip.value = ''
        ElMessage.success('Login successfully')
        window.location.href = '#/'
      } else {
        errorTip.value =
          res.message ||
          'Incorrect email or password. Try again, or contact the Flowa Support Team.'
      }
    } catch (e: any) {
      errorTip.value =
        e?.message ||
        'Login failed due to a network or system issue. Please try again later.'
    }
  })
}

onMounted(async () => {
  const remembered = await loadRememberCredentials()
  if (remembered) {
    form.email = remembered.email
    form.password = remembered.password
    form.remember = true
  }
})

const clearError = () => {
  errorTip.value = ''
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
.error-tip {
  background: #fff2f2;
  border: 1px solid #ffbdbd;
  color: #d32f2f;
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 12px;
  line-height: 1.4;
}
.copyright {
  font-size: 12px;
  color: #9aa0a6;
}
</style>
