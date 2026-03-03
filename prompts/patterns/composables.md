# Vue 3 Prompt Corpus: Patterns - Composables

## Context
Use this prompt for extracting reusable logic into composable functions (hooks).

## Guidelines

### 1. Naming Convention
- Use `use` prefix (e.g., `useCounter`, `useFetch`).
- Place in `src/composables/` or specific feature folder.

### 2. Structure
- Accept arguments (refs or raw values) using `toValue` or `unref`.
- Return reactive state (`ref`, `computed`) and methods.
- Manage side effects (`onMounted`, `onUnmounted`) inside the composable.

### 3. Example
```ts
// src/composables/useMouse.ts
import { ref, onMounted, onUnmounted } from 'vue';

export function useMouse() {
  const x = ref(0);
  const y = ref(0);

  function update(event: MouseEvent) {
    x.value = event.pageX;
    y.value = event.pageY;
  }

  onMounted(() => window.addEventListener('mousemove', update));
  onUnmounted(() => window.removeEventListener('mousemove', update));

  return { x, y };
}
```
