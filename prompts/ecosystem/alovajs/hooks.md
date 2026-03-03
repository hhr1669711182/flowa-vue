# Vue 3 Prompt Corpus: AlovaJS - Hooks

## Context
Use this prompt for data fetching logic inside components (GET/POST/PUT/DELETE).

## Guidelines

### 1. `useWatcher` (Auto-fetch)
- Use for data that depends on reactive sources (pagination, search).
- Pass reactive variables (page, query) to watch array.
- Debounce search input (`debounce: 500`).
- Returns `loading`, `data`, `error`.

### 2. `useRequest` (Manual)
- Use for user-triggered actions (form submit, delete button).
- Returns `loading`, `send`, `onSuccess`, `onError`.
- Pass function returning a `Method` instance.

### 3. Example
```vue
<script setup lang="ts">
import { useWatcher, useRequest } from 'alova/client';
import { api } from '@/api/user';

const filter = reactive({ page: 1, query: '' });

// Auto-fetch on filter change
const { loading, data: list } = useWatcher(
  () => api.getUserList(filter),
  [() => filter.page, () => filter.query],
  { debounce: 500, immediate: true }
);

// Manual submit
const { loading: saving, send: save } = useRequest(
  (data) => api.updateUser(data),
  { immediate: false }
);

const handleSave = async (user) => {
  await save(user);
  // Refresh list or show success
};
</script>
```
