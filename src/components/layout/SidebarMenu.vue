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
// .sidebar-menu {
//   :deep(.el-menu-item), :deep(.el-sub-menu__title) {
//     &:hover {
//       background-color: var(--el-menu-hover-bg-color) !important;
//       color: #000 !important;
//     }
//   }

//   :deep(.el-menu-item) {
//     &.is-active {
//       background-color: var(--el-color-primary);
//       color: #fff;
//       font-weight: 600;
//       border-right: 3px solid var(--el-color-primary);
//     }
//   }

//   /* 子菜单样式 */
//   :deep(.el-sub-menu) {
//     .el-menu {
//       background-color: #f5f5f5; /* 嵌套项稍暗一点 */
//     }
//   }
// }
</style>
