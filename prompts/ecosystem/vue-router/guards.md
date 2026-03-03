# Vue 3 Prompt Corpus: Vue Router - Navigation Guards

## Context
Use this prompt for securing routes (authentication, permissions) and data fetching before navigation.

## Guidelines

### 1. Global Guards (`beforeEach`)
- Use for auth checks (`requiresAuth`).
- Check `to.meta` for route-specific config.
- Always call `next()` or return a location (`{ name: 'Login' }`).
- Update page title (`document.title`).

### 2. Per-Route Guards (`beforeEnter`)
- Use for specific route logic (e.g., verifying user role).
- Avoid heavy logic; keep guards fast.

### 3. Component Guards (`onBeforeRouteUpdate`, `onBeforeRouteLeave`)
- Use inside setup function.
- `onBeforeRouteLeave`: Confirm unsaved changes.
- `onBeforeRouteUpdate`: React to param changes (e.g., user ID change).

### 4. Example
```ts
router.beforeEach((to, from, next) => {
  const store = useAuthStore();
  
  if (to.meta.requiresAuth && !store.isAuthenticated) {
    next({ 
      name: 'Login', 
      query: { redirect: to.fullPath } 
    });
  } else {
    next();
  }
});
```
