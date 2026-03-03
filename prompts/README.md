# Vue 3 Prompt Corpus: Root README

## Overview
This repository contains a structured collection of prompt files designed to guide AI assistants (like ChatGPT, Claude, Copilot) in generating high-quality Vue 3 code. It covers the core framework, ecosystem libraries, TypeScript integration, and common design patterns.

## Directory Structure

### [Basics](./basics/)
Core Vue 3 concepts using the Composition API.
- [Composition API](./basics/composition-api.md): `<script setup>` syntax and structure.
- [Reactivity](./basics/reactivity.md): `ref` vs `reactive` usage.
- [Lifecycle](./basics/lifecycle.md): Component lifecycle hooks.
- [Components](./basics/components.md): Props, emits, and slots.

### [Ecosystem](./ecosystem/)
Official and popular Vue 3 libraries.
- **Pinia**: [Store Definition](./ecosystem/pinia/store-definition.md), [Actions/Getters](./ecosystem/pinia/actions-getters.md), [Plugins](./ecosystem/pinia/plugins.md).
- **Vue Router**: [Routes](./ecosystem/vue-router/routes-setup.md), [Navigation](./ecosystem/vue-router/navigation.md), [Guards](./ecosystem/vue-router/guards.md).
- **AlovaJS**: [Instance](./ecosystem/alovajs/instance.md), [Hooks](./ecosystem/alovajs/hooks.md), [Caching](./ecosystem/alovajs/cache.md).
- **Element Plus**: [Form](./ecosystem/element-plus/form.md), [Table](./ecosystem/element-plus/table.md), [Theme](./ecosystem/element-plus/custom-theme.md).

### [TypeScript](./typescript/)
Strong typing for Vue applications.
- [Component Definition](./typescript/define-component.md): Typing components.
- [Props & Emits](./typescript/props-emits.md): `defineProps` and `defineEmits`.
- [TSX Support](./typescript/tsx-support.md): Using JSX/TSX.

### [Patterns](./patterns/)
Common architectural patterns.
- [Composables](./patterns/composables.md): Reusable logic extraction.
- [Async Data](./patterns/async-data.md): Handling API calls.
- [Error Handling](./patterns/error-handling.md): Managing exceptions.

### [Others](./others/)
Utility libraries and build tools.
- [Day.js](./others/dayjs.md): Date manipulation.
- [Lodash](./others/lodash.md): Utility functions.
- [Vite Config](./others/vite-config.md): Build configuration.

## Usage
When asking an AI to generate code, reference the relevant file path or copy its content to set the context and standards.
