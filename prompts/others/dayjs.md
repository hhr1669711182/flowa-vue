# Vue 3 Prompt Corpus: Others - Day.js

## Context
Use this prompt for date and time manipulation in Vue 3 projects.

## Guidelines

### 1. Installation
- `npm install dayjs`
- Import: `import dayjs from 'dayjs'`

### 2. Plugins
- Extend with `relativeTime` or `localizedFormat`.
- `dayjs.extend(plugin)` in `main.ts` or per file.

### 3. Usage
- Formatting: `dayjs(date).format('YYYY-MM-DD HH:mm:ss')`.
- Manipulation: `dayjs().add(7, 'day')`.
- Parsing: `dayjs('2023-01-01')`.

### 4. Example
```vue
<script setup lang="ts">
import dayjs from 'dayjs';

const now = dayjs();
const formatted = now.format('YYYY/MM/DD');
</script>
```
