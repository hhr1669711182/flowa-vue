# Vue 3 Prompt Corpus: Patterns - Error Handling

## Context
Use this prompt for handling errors globally, per component, and in asynchronous flows.

## Guidelines

### 1. Global Errors (`app.config.errorHandler`)
- Catch unhandled errors in Vue components.
- Log to monitoring service (Sentry) or display generic message.

### 2. Boundary Components (`onErrorCaptured`)
- Use in parent components to catch child errors.
- Prevent error propagation (`return false`).

### 3. API Errors
- Use interceptors (axios/alova) for network errors (401, 500).
- Use `try/catch` for business logic errors.

### 4. Example
```ts
// Global (main.ts)
app.config.errorHandler = (err, instance, info) => {
  console.error('Global Error:', err);
  ElNotification.error('Something went wrong!');
};

// Component (Parent.vue)
onErrorCaptured((err) => {
  console.error('Child Error:', err);
  error.value = err;
  return false; // Stop propagation
});
```
