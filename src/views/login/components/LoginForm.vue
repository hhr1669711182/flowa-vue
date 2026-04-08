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
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useAuthStore } from '@/store/modules/auth'
import { useUserStore } from '@/store/modules/user'
import { loadRememberCredentials } from '@/utils/storage'

const emit = defineEmits<{
  (e: 'forgot'): void
  (e: 'signup'): void
}>()
const router = useRouter()
const formRef = ref()
const authStore = useAuthStore()
const userStore = useUserStore()
const loading = ref(false)
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
    loading.value = true
    errorTip.value = ''
    try {
      const result = await authStore.login({
        email: form.email,
        password: form.password,
        remember: form.remember
      })
      if (result.ok) {
        userStore.setToken(authStore.token || '')
        userStore.setRememberMe(!!form.remember)
        userStore.setLoginInfo({ username: form.email, password: form.password })
        if (authStore.user) {
          userStore.setUserInfo({
            id: authStore.user.id,
            name: authStore.user.name,
            email: authStore.user.email,
            username: authStore.user.name || form.email,
            password: '',
            role: authStore.user.role,
            roleId: authStore.user.role
          })
        }
        ElMessage.success('Login successfully')
        await router.push('/')
      } else {
        const { getDisplayMessage } = await import('@/utils/errorCenter')
        errorTip.value = result.message || getDisplayMessage({ code: 'INCORRECT_CREDENTIALS' })
      }
    } catch (e: any) {
      const { getDisplayMessage } = await import('@/utils/errorCenter')
      errorTip.value = getDisplayMessage(e)
    } finally {
      loading.value = false
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
