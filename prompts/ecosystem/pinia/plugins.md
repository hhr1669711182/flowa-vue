# Vue 3 Prompt Corpus: Pinia - Plugins

## Context
Use this prompt when adding Pinia plugins for persistence, logging, or other cross-cutting concerns.

## Guidelines

### 1. Persistence
- Use `pinia-plugin-persistedstate` or similar.
- Configure inside `defineStore` options (`persist: true`).

### 2. Custom Plugins
- Create plugins using `createPinia().use(...)`.
- Access context (`store`, `options`, `app`) inside the plugin.

### 3. Example
```ts
// main.ts
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(pinia);

// store.ts
export const useAuthStore = defineStore('auth', {
  state: () => ({ token: '' }),
  persist: true // Auto-save to localStorage
});
```
