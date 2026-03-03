# Vue 3 Prompt Corpus: Vue Router - Route Setup

## Context
Use this prompt for defining routes, lazy loading components, and handling nested views.

## Guidelines

### 1. Structure
- Use `createRouter` and `createWebHistory`.
- Define `routes` array.
- Use path aliases (`@/views/...`) for component imports.
- Use `lazy loading` (`() => import(...)`) for all page components to reduce initial bundle size.

### 2. Nested Routes
- Use `children` for nested layouts (e.g., `MainLayout` wrapping `Dashboard`).
- `<RouterView />` is required in the parent component.

### 3. Example
```ts
const routes = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: 'Dashboard', requiresAuth: true }
      },
      {
        path: 'profile/:id',
        name: 'Profile',
        component: () => import('@/views/Profile.vue'),
        props: true // Pass params as props
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
];
```
