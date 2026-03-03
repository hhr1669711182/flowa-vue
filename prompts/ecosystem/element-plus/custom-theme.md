# Vue 3 Prompt Corpus: Element Plus - Custom Theme

## Context
Use this prompt for overriding Element Plus SCSS variables and configuring global theme settings.

## Guidelines

### 1. SCSS Override
- Create `src/styles/element/index.scss`.
- Forward `element-plus/theme-chalk/src/common/var.scss` with `!default` variable overrides.
- Import this file in `vite.config.ts` under `css.preprocessorOptions.scss.additionalData`.

### 2. CSS Variables (Dark Mode)
- Use CSS variables for dynamic theming (e.g., `--el-color-primary`, `--el-bg-color`).
- Toggle class `.dark` on `html` tag for dark mode support.
- Use `useDark()` from `@vueuse/core` to manage dark mode state.

### 3. Example
```scss
// src/styles/element/index.scss
@forward 'element-plus/theme-chalk/src/common/var.scss' with (
  $colors: (
    'primary': (
      'base': #005c9e,
    ),
  ),
);
```

```ts
// vite.config.ts
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/element/index.scss" as *;`,
      },
    },
  },
});
```
