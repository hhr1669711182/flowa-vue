---
name: "superpowers"
description: "Provides repo-specific power tools (routing, mock/API scaffolding, page patterns, and safe refactors). Invoke when user says /superpowers or asks to quickly scaffold/standardize features."
---

# Superpowers

Use this skill to move fast in this repository with consistent patterns and minimal churn.

## When To Invoke

- User says `/superpowers`.
- User asks to “快速完善/补齐” a feature across multiple files (page + API + mock + wiring).
- User asks to add routes, error pages, or standardized UI patterns (e.g., expand rows, steps bar, action popovers).
- Before large refactors where you need consistent conventions without changing styles.

## Operating Principles

- Do not change styles unless explicitly requested.
- Prefer reusing existing patterns in the repo (BaseTable expand, action popover, mock endpoints under `src/services/mock/order/*`, API modules under `src/api/order/*`).
- Keep old import entrypoints working by re-exporting when files have legacy paths (e.g., `src/api/orderX.ts` → `export * from '@/api/order/x'`).
- Ensure new list endpoints return lightweight list rows; put heavy detail fields under `/detail` endpoints.
- Always run repository build/lint/typecheck commands if available (e.g., `npm run build:no-tsc`).

## Quick Patterns

### Add a New Order Page Slice (Example: Delivered / Blocked / In Progress)

1. Create/extend API module in `src/api/order/<slice>.ts`:
   - `get<Slice>OrderList(params)` → `GET /api/orders/<slice>`
   - `get<Slice>OrderDetail(id)` → `GET /api/orders/<slice>/detail`
   - Action endpoints as needed: `POST /status`, `/ticket`, etc.
2. Create/extend mock in `src/services/mock/order/<slice>.ts`:
   - List returns `{ total, list, ... }` (omit heavy fields like `items`).
   - Detail returns a single record including heavy fields.
3. Update page `src/views/order/<Slice>/index.vue`:
   - Map filter params to API params.
   - Use BaseTable with `@expand-change` to lazy-load detail and cache by `id`.
   - Keep style class names unchanged; only bind correct fields.

### Expand Row Detail Cache

- Maintain:
  - `expandDetailMap: Record<string, any>`
  - `expandLoadingMap: Record<string, boolean>`
- On `@expand-change`:
  - If expanded and cache missing: fetch detail, store in map.
- Use `getExpandRow(row)` to render expanded section.

### Steps Bar

- Use base Steps component: `import { Steps } from "@/components/base/Steps";`
- Pass:
  - `:steps="[{ title, subtitle, state }...]"`, `:active="number"`.
  - For delivered-like flows: `variant="success" :show-state-icon="true"`.

### All Orders (OrderList) Pattern

- List endpoint: `/api/orders/order-list`.
- Detail endpoint: `/api/orders/order-list/detail` with `items`.
- Actions:
  - `POST /status`
  - `POST /ticket`
  - `POST /item/delete` (update cached detail after deletion).

## Safety Checklist (Always)

- Ensure templates only reference variables/methods defined in `<script setup>`.
- Avoid referencing non-existent fields (e.g., `row.cancelledDate` on non-cancelled pages).
- Keep mock endpoints unique to avoid duplicate registration conflicts.
- Run build verification before finishing.

