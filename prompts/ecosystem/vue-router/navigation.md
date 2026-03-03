# Vue 3 Prompt Corpus: Vue Router - Navigation

## Context
Use this prompt for navigating between routes programmatically (`router.push`) or declaratively (`<RouterLink>`).

## Guidelines

### 1. Declarative (`<RouterLink>`)
- Use `:to` with route objects (`{ name: 'User', params: { id: 1 } }`).
- Use `<RouterLink>` for internal links (faster, no reload).
- Use `<a>` for external links.

### 2. Programmatic (`useRouter`)
- Use `router.push()` for standard navigation.
- Use `router.replace()` to replace current history entry (no back button).
- Use `router.go(-1)` for back navigation.

### 3. Params & Query
- **Params**: Defined in path (`/user/:id`).
- **Query**: URL parameters (`/search?q=vue`).

### 4. Example
```vue
<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute(); // Reactive route object

// Access params
const userId = route.params.id;

// Navigate
const goHome = () => {
  router.push({ name: 'Home' });
};

const search = (query: string) => {
  router.push({ 
    path: '/search', 
    query: { q: query } 
  });
};
</script>

<template>
  <RouterLink :to="{ name: 'Profile', params: { id: 123 } }">
    Go to Profile
  </RouterLink>
</template>
```
