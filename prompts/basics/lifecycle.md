# Vue 3 Prompt Corpus: Basics - Lifecycle Hooks

## Context
Use this prompt to hook into component lifecycle events.

## Guidelines

### 1. Composition API Hooks
- **`onMounted`**: Use for DOM manipulation, initial API calls, or starting timers.
- **`onUnmounted`**: Use for cleanup (removing event listeners, stopping timers, cancelling requests).
- **`onBeforeMount`**: Rarely used (setup runs before mount anyway).
- **`onUpdated`**: Use sparingly; prefer `watch` or `computed` for data-driven updates.
- **`onActivated` / `onDeactivated`**: Use for `KeepAlive` components (caching/restoring state).

### 2. Usage
- Import hooks from `vue`.
- Register hooks inside `setup()`.
- Hooks can be registered multiple times (even in composables).

### 3. Example
```ts
import { onMounted, onUnmounted, onActivated } from 'vue';

// Basic Mount/Unmount
onMounted(() => {
  console.log('Component rendered to DOM');
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  console.log('Component destroyed');
  window.removeEventListener('resize', handleResize);
});

// KeepAlive Specific
onActivated(() => {
  console.log('Restored from cache');
  refreshData(); // Re-fetch data if needed
});
```
