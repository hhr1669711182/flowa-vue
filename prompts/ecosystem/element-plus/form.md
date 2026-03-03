# Vue 3 Prompt Corpus: Element Plus - Form Handling

## Context
Use this prompt for creating forms with validation, dynamic fields, and complex interactions using Element Plus components.

## Guidelines

### 1. Form Structure
- Use `el-form` with `:model` and `:rules`.
- Use `el-form-item` with `prop` matching rule key.
- Bind `v-model` to reactive state.
- Use `ref` on `el-form` to access methods (`validate`, `resetFields`).

### 2. Validation
- Define rules in `reactive` or `computed`.
- Rules support async validators for server-side checks.
- Trigger validation on `submit` action.

### 3. Example
```vue
<script setup lang="ts">
import { ref, reactive } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';

const formRef = ref<FormInstance>();
const formData = reactive({ name: '', email: '' });

const rules = reactive<FormRules>({
  name: [{ required: true, message: 'Required', trigger: 'blur' }],
  email: [{ type: 'email', message: 'Invalid email', trigger: 'blur' }]
});

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate((valid) => {
    if (valid) {
      console.log('Submit!');
    }
  });
};
</script>

<template>
  <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px">
    <el-form-item label="Name" prop="name">
      <el-input v-model="formData.name" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submitForm(formRef)">Submit</el-button>
    </el-form-item>
  </el-form>
</template>
```
