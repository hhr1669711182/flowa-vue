# Vue 3 Prompt Corpus: Pinia - Actions & Getters

## Context
Use this prompt when implementing logic (Actions) and derived state (Getters) in a Pinia store.

## Guidelines

### 1. Actions (Business Logic)
- **Functions inside `defineStore` are actions.**
- Use `async/await` for asynchronous operations (API calls).
- **Mutations**: Modify state directly (`state.value = ...`).
- **Error Handling**: Use `try/catch` blocks inside actions.
- **Side Effects**: Trigger notifications (e.g., `ElMessage`) or navigation (`router.push`) if appropriate, but keep stores primarily for state.

### 2. Getters (Derived State)
- **Computed properties inside `defineStore` are getters.**
- They are cached based on dependencies.
- **Parameters**: Getters cannot accept parameters directly. Return a function if needed (cache is lost).

### 3. Example
```ts
// Actions
const fetchUser = async (id: number) => {
  isLoading.value = true;
  try {
    const data = await api.getUser(id);
    user.value = data;
  } catch (err) {
    error.value = err;
  } finally {
    isLoading.value = false;
  }
};

// Getters
const isAdmin = computed(() => user.value?.role === 'admin');

// Parameterized Getter (Function)
const getUserById = computed(() => {
  return (userId: number) => users.value.find(u => u.id === userId);
});
```
