# Vue 3 Prompt Corpus: Others - Vite Config

## Context
Use this prompt for configuring Vite (plugins, aliases, proxy) in Vue 3 projects.

## Guidelines

### 1. Configuration
- `vite.config.ts`.
- Plugins: `vue()`, `vueJsx()`, `AutoImport()`, `Components()`.
- Alias: `'@': fileURLToPath(new URL('./src', import.meta.url))`.
- Server: Proxy API requests (`/api`).
- Build: Optimize deps (`optimizeDeps`).

### 2. Example
```ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
});
```
