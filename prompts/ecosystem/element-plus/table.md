# Vue 3 Prompt Corpus: Element Plus - Table

## Context
Use this prompt for displaying data in sortable, filterable, and paginated tables using Element Plus.

## Guidelines

### 1. Data Binding
- Bind `:data` to an array.
- Use `el-table-column` with `prop` or default slot for custom rendering.
- Enable `border`, `stripe`, and `highlight-current-row` for styling.

### 2. Features
- **Pagination**: Use `el-pagination` component.
- **Selection**: Enable checkbox selection with `type="selection"`.
- **Sorting**: Enable sortable columns with `sortable`.
- **Expandable Rows**: Use `type="expand"` for nested details.

### 3. Example
```vue
<template>
  <el-table :data="tableData" style="width: 100%">
    <el-table-column prop="date" label="Date" width="180" />
    <el-table-column prop="name" label="Name" width="180" />
    <el-table-column label="Operations">
      <template #default="scope">
        <el-button size="small" @click="handleEdit(scope.$index, scope.row)">Edit</el-button>
        <el-button size="small" type="danger" @click="handleDelete(scope.$index, scope.row)">Delete</el-button>
      </template>
    </el-table-column>
  </el-table>
  <el-pagination
    v-model:current-page="currentPage"
    v-model:page-size="pageSize"
    :total="total"
    layout="prev, pager, next"
  />
</template>
```
