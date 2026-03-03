# Vue 3 Prompt Corpus: TypeScript - TSX Support

## Context
Use this prompt for enabling TSX/JSX support in Vue 3 projects.

## Guidelines

### 1. Configuration
- Ensure `@vitejs/plugin-vue-jsx` is installed and configured in `vite.config.ts`.
- Use `.tsx` file extension for components.

### 2. Syntax
- Use `defineComponent` with `setup()`.
- Return render function `() => <div />`.
- Use `v-model` directives as props (`modelValue={val} onUpdate:modelValue={setVal}`).
- Use slots as function props (`v-slots={{ default: () => ... }}`).

### 3. Example
```tsx
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'MyComponent',
  props: {
    msg: String
  },
  setup(props) {
    const count = ref(0);
    return () => (
      <div>
        <h1>{props.msg}</h1>
        <button onClick={() => count.value++}>Count: {count.value}</button>
      </div>
    );
  }
});
```
