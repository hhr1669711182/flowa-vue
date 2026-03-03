# Vue 3 Prompt Corpus: TypeScript - Props & Emits

## Context
Use this prompt for strictly typing props and events in Vue 3 components.

## Guidelines

### 1. Props (`defineProps`)
- Use generic argument syntax `defineProps<Props>()`.
- Use `withDefaults` to provide default values.
- Props are **readonly**.

### 2. Emits (`defineEmits`)
- Use generic argument syntax `defineEmits<Emits>()`.
- Define events as function signatures.
- Type event payload strictly.

### 3. Example
```ts
// Component.vue
<script setup lang="ts">
interface Props {
  count: number;
  label?: string;
  config: { mode: 'dark' | 'light' };
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Default Label',
  count: 0
});

const emit = defineEmits<{
  (e: 'update:count', value: number): void;
  (e: 'change', value: string): void;
}>();
</script>
```
