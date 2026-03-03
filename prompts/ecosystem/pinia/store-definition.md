# Vue 3 Prompt Corpus: Pinia - Store Definition

## Context
Use this prompt when defining a new Pinia store.

## Core Guidelines

### 1. Setup Store Syntax
- Use `defineStore` with a function (Setup Store) over Option Store.
- The `id` should be unique (e.g., `'auth'`, `'cart'`, `'settings'`).
- Return ONLY what components need to access (public API).

### 2. State Management
- Use `ref()` for simple state.
- Use `reactive()` for grouped state.
- Keep state flat where possible.

### 3. Example
```ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useCounterStore = defineStore('counter', () => {
  // State
  const count = ref(0);
  const name = ref('Eduardo');

  // Getters (Computed)
  const doubleCount = computed(() => count.value * 2);

  // Actions (Functions)
  function increment() {
    count.value++;
  }

  // Async Action
  async function randomize() {
    count.value = Math.round(100 * Math.random());
  }

  return { count, name, doubleCount, increment, randomize };
});
```
