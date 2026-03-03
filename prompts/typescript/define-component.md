# Vue 3 Prompt Corpus: TypeScript - Component Definition

## Context
Use this prompt for ensuring strict TypeScript typing in Vue components.

## Guidelines

### 1. `defineComponent` vs `<script setup>`
- **Prefer `<script setup lang="ts">`** as it handles type inference automatically.
- Use `defineComponent` only for non-SFC (JSX/TSX) or advanced manual render functions.

### 2. Global Types
- Define shared interfaces in `src/types/*.ts`.
- Use `export type` or `export interface`.
- Avoid `any`; use `unknown` if type is truly dynamic, or generic constraints.

### 3. Example
```ts
// src/types/user.ts
export interface User {
  id: number;
  name: string;
  role: 'admin' | 'user';
}
```

```vue
<script setup lang="ts">
import type { User } from '@/types/user';

const user = ref<User | null>(null);
</script>
```
