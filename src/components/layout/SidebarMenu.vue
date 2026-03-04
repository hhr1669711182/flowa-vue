<template>
  <el-menu
    router
    :default-active="activeMenu"
    class="sidebar-menu border-none w-full bg-white"
    :collapse-transition="false"
  >
    <template v-for="item in sidebarMenu" :key="item.path">
      <!-- Submenu -->
      <el-sub-menu v-if="item.children && item.children.length > 0" :index="item.path">
        <template #title>
          <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
          <span>{{ item.title }}</span>
        </template>
        
        <el-menu-item 
          v-for="child in item.children" 
          :key="child.path" 
          :index="child.path"
        >
          <span>{{ child.title }}</span>
        </el-menu-item>
      </el-sub-menu>

      <!-- Single Menu Item -->
      <el-menu-item v-else :index="item.path">
        <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
        <span>{{ item.title }}</span>
      </el-menu-item>
    </template>
  </el-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { sidebarMenu } from '../../config/menu'

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<style lang="less" scoped>
.sidebar-menu {
  padding: 28px 16px !important;
  // padding: 32px 16px !important;
  box-sizing: border-box;
  :deep(.el-menu-item),
  :deep(.el-sub-menu__title) {
    border-radius: 12px;
    margin: 2px 6px;
    padding: 10px 12px;
    transition: background-color 0.15s ease, color 0.15s ease;
  }

  :deep(.el-menu-item:hover),
  :deep(.el-sub-menu__title:hover) {
    background-color: #f5f7ff !important;
    color: #16215b !important;
  }

  /* Active pill for parent when child selected */
  :deep(.el-sub-menu.is-active > .el-sub-menu__title) {
    background-color: #eef2ff !important;
    color: #16215b !important;
    font-weight: 600;
  }

  /* Single item active */
  :deep(.el-menu-item.is-active) {
    background-color: #eef2ff !important;
    color: #16215b !important;
    font-weight: 600;
  }

  /* Submenu list styling: left divider and indentation */
  :deep(.el-sub-menu) {
    .el-menu {
      border-left: 1px solid #e5e7eb;
      margin: 10px 0 10px 30px;
      // padding-left: 8px;
      background: transparent;
    }
    .el-menu-item {
      // margin: 0 0 4px 0;
      // padding-left: 4px;
      border-radius: 8px;
      color: #6b6b6b;
    }
    .el-menu-item.is-active {
      color: #16215b !important;
      font-weight: 600;
      background: transparent !important;
    }
    .el-menu-item.is-disabled {
      color: #bfbfbf !important;
    }
  }
}
</style>
