# Vue 3 Prompt Corpus: Basics - Components

## Context
Use this prompt when creating components and managing their communication (props, emits, slots).

## Guidelines

### 1. Props
- Define types using `defineProps<Props>()`.
- Use `withDefaults` to set default values for props.
- **NEVER** mutate props directly.

### 2. Emits
- Define events using `defineEmits<Emits>()`.
- Use descriptive event names (e.g., `update:value`, `close`, `submit`).

### 3. Slots
- Use named slots for structured content (`<template #header>`).
- Use scoped slots to pass data from child to parent (`<slot :item="item">`).

### 4. Example
```vue
<script setup lang="ts">
// Props
interface Props {
  title: string;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
});

// Emits
const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', data: any): void;
}>();

// Slots
defineSlots<{
  default(props: { count: number }): any;
  header(props: { title: string }): any;
}>();

const handleSubmit = () => {
  if (!props.loading) {
    emit('submit', { success: true });
  }
};
</script>

<template>
  <div class="card">
    <slot name="header" :title="title">
      <h2>{{ title }}</h2>
    </slot>
    <div class="content">
      <slot :count="10" />
    </div>
    <button @click="handleSubmit">Submit</button>
  </div>
</template>
```
