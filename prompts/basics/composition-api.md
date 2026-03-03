# Vue 3 Prompt Corpus: Basics - Composition API

## Context
Use this prompt when generating Vue 3 components using the Composition API with `<script setup>`.

## Core Guidelines

### 1. Script Setup Syntax
- ALWAYS use `<script setup lang="ts">`.
- Imports should be grouped: Vue core -> Ecosystem (Pinia, Router) -> Components -> Utils/Types.
- No `export default` object; variables declared are automatically available in the template.

### 2. Component Structure
Follow this order:
1.  **Imports**: `import { ref, computed } from 'vue'`
2.  **Props/Emits**: `defineProps`, `defineEmits`
3.  **State**: `const count = ref(0)`
4.  **Computed**: `const double = computed(() => count.value * 2)`
5.  **Watchers**: `watch(count, (val) => ...)`
6.  **Methods/Functions**: `const increment = () => count.value++`
7.  **Lifecycle Hooks**: `onMounted(() => ...)`

### 3. Example
```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

// Props
const props = defineProps<{
  initialCount: number;
}>();

// Emits
const emit = defineEmits<{
  (e: 'update', val: number): void;
}>();

// State
const count = ref(props.initialCount);

// Computed
const isPositive = computed(() => count.value > 0);

// Methods
const increment = () => {
  count.value++;
  emit('update', count.value);
};

// Lifecycle
onMounted(() => {
  console.log('Component mounted');
});
</script>

<template>
  <button @click="increment">{{ count }} (Positive: {{ isPositive }})</button>
</template>
```
