# Vue 3 Prompt Corpus: Others - Lodash

## Context
Use this prompt for utility functions (array/object manipulation, debouncing) in Vue 3 projects.

## Guidelines

### 1. Installation
- `npm install lodash @types/lodash`
- Import: `import { debounce, cloneDeep } from 'lodash'`

### 2. Common Uses
- **Deep Clone**: `cloneDeep(obj)` (for resetting forms).
- **Debounce**: `debounce(fn, 300)` (for search input).
- **Throttle**: `throttle(fn, 1000)` (for scroll).

### 3. Example
```ts
import { debounce } from 'lodash';

const search = debounce((query) => {
  api.search(query);
}, 500);

// Use unref(lodashFn) if wrapped
```
