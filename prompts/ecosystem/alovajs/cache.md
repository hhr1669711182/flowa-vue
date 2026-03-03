# Vue 3 Prompt Corpus: AlovaJS - Caching

## Context
Use this prompt for configuring caching behavior in AlovaJS to optimize performance.

## Guidelines

### 1. Global Configuration
- Set `cacheFor` in `createAlova` (e.g., `'memory'`, `'storage'`, `'no-cache'`).
- Default is often memory cache.

### 2. Method-Level Cache
- Override cache for specific requests (e.g., `Get('/users', { cacheFor: 0 })`).
- Use `invalidateCache` manually when data changes (e.g., after successful mutation).

### 3. Sharing
- Enable `shareRequest` to prevent duplicate requests for same endpoint.

### 4. Example
```ts
// Invalidate cache after mutation
const { onSuccess } = useRequest(api.deleteUser(id));

onSuccess(() => {
  invalidateCache(api.getUserList(filter)); // Clear specific cache
  // OR
  invalidateCache(); // Clear all cache
});
```
