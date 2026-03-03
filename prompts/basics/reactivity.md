# Vue 3 Prompt Corpus: Basics - Reactivity

## Context
Use this prompt to choose the correct reactivity primitive (`ref` vs `reactive`) and understand reactivity caveats.

## Guidelines

### 1. Ref vs Reactive
- **`ref()`**: 
  - Use for primitives (`string`, `number`, `boolean`).
  - Use for arrays or objects you might replace entirely (`data.value = newData`).
  - **Access**: `.value` in script, auto-unwrapped in template.
- **`reactive()`**: 
  - Use for grouped state (e.g., forms, settings objects).
  - **Access**: Direct property access.
  - **Caveat**: CANNOT replace the whole object (`state = newState` breaks reactivity). Use `Object.assign(state, newState)`.
  - **Caveat**: Destructuring breaks reactivity unless `toRefs` is used.

### 2. Shallow & Raw
- **`shallowRef()`**: Use for large datasets where deep reactivity is costly and you only replace the root.
- **`markRaw()`**: Use for complex objects that should never be reactive (e.g., third-party library instances, Vue component definitions).

### 3. Example
```ts
// Primitives
const count = ref(0);

// Grouped State (Form)
const form = reactive({
  name: '',
  email: ''
});

// Resetting Reactive Object
const resetForm = () => {
  Object.assign(form, { name: '', email: '' });
};

// Destructuring (maintaining reactivity)
const { name, email } = toRefs(form);
```
