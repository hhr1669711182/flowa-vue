<template>
  <el-form ref="formRef" :model="form" :rules="rules" size="large">
    <div class="text-center mb-15">
      <h2 class="title">Welcome To Flowa</h2>
      <p class="subtitle">Enter your details to verify your account and get started securely.</p>
    </div>
    <el-row :gutter="12" class="mb-2">
      <el-col :span="12">
        <el-form-item prop="fullName">
          <div class="label">Full Name*</div>
          <el-input v-model="form.fullName" class="input" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item prop="company">
          <div class="label">Company Name*</div>
          <el-input v-model="form.company" class="input" />
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="12" class="mb-2">
      <el-col :span="12">
        <el-form-item>
          <div class="label">Department (Optional)</div>
          <el-input v-model="form.department" class="input" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item>
          <div class="label">Role (Optional)</div>
          <el-input v-model="form.role" class="input" />
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="12" class="mb-2">
      <el-col :span="12">
        <el-form-item prop="email">
          <div class="label">Email*</div>
          <el-input v-model="form.email" :prefix-icon="Message" class="input" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item prop="phone">
          <div class="label">Phone Number*</div>
          <el-input v-model="form.phone" class="input" />
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="12" class="mb-3">
      <el-col :span="12">
        <el-form-item prop="password">
          <div class="label">Password*</div>
          <el-input v-model="form.password" type="password" show-password class="input" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item prop="repeat">
          <div class="label">Repeat Password*</div>
          <el-input v-model="form.repeat" type="password" show-password class="input" />
        </el-form-item>
      </el-col>
    </el-row>
    <div class="hint">
      Please choose a password that is at least 10 characters long, featuring at least one uppercase letter and one special character.
    </div>
    <el-button type="primary" class="primary-btn mt-4" :loading="loading" @click="submit">Continue</el-button>
    <div class="mt-4 text-center text-sm text-[#6B6B6B]">
      Already have an account?
      <a class="link" @click="$emit('login')">Log In Now!</a>
    </div>
  </el-form>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Message } from '@element-plus/icons-vue'
import { registerAccount } from '@/api/auth'

const emit = defineEmits<{
  (e: 'login'): void
}>()

const formRef = ref()
const loading = ref(false)
const form = reactive({
  fullName: '',
  company: '',
  department: '',
  role: '',
  email: '',
  phone: '',
  password: '',
  repeat: ''
})
const rules = {
  fullName: [{ required: true, message: 'Please enter name', trigger: 'blur' }],
  company: [{ required: true, message: 'Please enter company', trigger: 'blur' }],
  email: [{ required: true, message: 'Please enter email', trigger: 'blur' }],
  phone: [{ required: true, message: 'Please enter phone', trigger: 'blur' }],
  password: [{ required: true, message: 'Please enter password', trigger: 'blur' }],
  repeat: [
    { required: true, message: 'Please repeat password', trigger: 'blur' },
    {
      validator: (_: unknown, v: string, cb: Function) => {
        if (v !== form.password) cb(new Error('Passwords do not match'))
        else cb()
      },
      trigger: 'blur'
    }
  ]
}
const submit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    loading.value = true
    const res = await registerAccount({
      fullName: form.fullName,
      company: form.company,
      department: form.department,
      role: form.role,
      email: form.email,
      phone: form.phone,
      password: form.password
    })
    loading.value = false
    if (res.ok) {
      ElMessage.success('Registration submitted')
      emit('login')
    } else {
      ElMessage.error('Registration failed')
    }
  })
}
</script>

<style scoped lang="less">
.auth-card {
  background: #ffffff;
  border: 1px solid #ececec;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
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
  color: #9A9A9A;
  margin-bottom: 4px;
}
.input :deep(.el-input__wrapper) {
  min-height: 44px;
  border-width: 1.5px;
  border-color: #ececec;
  border-radius: 12px;
  box-shadow: 0 0 0 1px #ececec inset;
}
.hint {
  margin-top: 4px;
  background: #f8f8f8;
  border: 1px solid #ececec;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 12px;
  color: #6b6b6b;
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
