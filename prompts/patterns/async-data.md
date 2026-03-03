# Vue 3 Prompt Corpus: Patterns - Async Data

## Context
Use this prompt for handling asynchronous data fetching, loading states, and error handling effectively.

## Guidelines

### 1. State Management
- Use `loading` state (`ref(false)`).
- Use `error` state (`ref<string | null>(null)`).
- Use `data` state (`ref<T | null>(null)`).

### 2. Composition API (with `await`)
- Use `await` inside `onMounted` or `watch`.
- Wrap in `try/catch/finally`.
- **Top-Level Await**: Only if using `<Suspense>` (experimental).

### 3. Example
```ts
const { loading, data, error } = useAsyncState(async () => {
  return await fetch('/api/user').then(r => r.json());
}, {
  immediate: true,
  resetOnExecute: false,
});

// Or manually:
const isLoading = ref(false);
const user = ref(null);

const loadUser = async () => {
  isLoading.value = true;
  try {
    user.value = await api.getUser();
  } catch (e) {
    ElMessage.error(e.message);
  } finally {
    isLoading.value = false;
  }
};
```
