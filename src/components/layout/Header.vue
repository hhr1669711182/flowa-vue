<template>
  <el-header
    class="w-full bg-white h-16 flex items-center justify-between px-4 sm:px-6 z-10 sticky top-0 shadow-sm border-b border-gray-100"
  >
    <div class="flex items-center gap-4">
      <!-- Mobile Toggle -->
      <!-- <el-button 
        class="md:hidden" 
        circle 
        text 
        @click="$emit('toggle-drawer')"
      >
        <el-icon class="text-xl"><Expand /></el-icon>
      </el-button> -->

      <!-- Logo Area -->
      <div class="flex items-center">
        <img
          src="@/assets/logo.png"
          alt="Flowa"
          class="h-10 w-auto object-contain"
        />
      </div>

      <div class="hidden md:block w-141 ml-10">
        <el-input
          v-model="searchText"
          placeholder="Search orders, products..."
          :prefix-icon="Search"
          clearable
          class="w-full"
        />
      </div>

      <!-- Divider -->
      <!-- <el-divider direction="vertical" class="hidden sm:block !h-6 !mx-4" /> -->

      <!-- Breadcrumbs -->
      <!-- <el-breadcrumb separator="/" class="hidden sm:flex">
        <el-breadcrumb-item :to="{ path: '/' }">Home</el-breadcrumb-item>
        <el-breadcrumb-item v-for="(matched, index) in route.matched" :key="index" :to="{ path: matched.path }">
          {{ matched.meta.title || matched.name }}
        </el-breadcrumb-item>
      </el-breadcrumb> -->
    </div>

    <!-- Right Actions -->
    <div class="flex items-center space-x-2 sm:space-x-4">
      <!-- Search (Optional) -->

      <el-tooltip content="Notifications" placement="bottom">
        <el-button
          circle
          plain
          class="!border-none hover:bg-gray-100 relative"
          @click="onShowDrawer"
        >
          <el-icon class="text-gray-600 text-lg"><Bell /></el-icon>
          <span
            class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"
          ></span>
        </el-button>
      </el-tooltip>

      <el-dropdown trigger="click" @command="handleCommand">
        <div
          class="flex items-center cursor-pointer hover:bg-gray-50 px-2 py-1.5 rounded-lg transition-colors border border-transparent hover:border-gray-100"
        >
          <el-avatar
            :size="32"
            class="mr-2 bg-gradient-to-br from-primary to-blue-600 text-white font-semibold shadow-sm"
          >
            A
          </el-avatar>
          <div class="hidden sm:flex flex-col items-start mr-2">
            <span class="text-sm font-semibold text-gray-700 leading-tight"
              >Admin User</span
            >
            <span class="text-xs text-gray-500 leading-tight"
              >Administrator</span
            >
          </div>
          <el-icon class="hidden sm:block text-gray-400"
            ><CaretBottom
          /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu class="w-48">
            <div class="px-4 py-2 border-b border-gray-50 mb-1">
              <p class="text-sm font-medium text-gray-800">Admin User</p>
              <p class="text-xs text-gray-500">admin@flowa.com</p>
            </div>
            <el-dropdown-item command="profile">
              <el-icon><User /></el-icon>Profile
            </el-dropdown-item>
            <el-dropdown-item command="settings">
              <el-icon><Setting /></el-icon>Settings
            </el-dropdown-item>
            <el-dropdown-item divided command="logout" class="text-red-500">
              <el-icon><SwitchButton /></el-icon>Logout
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </el-header>

  <messageAll v-model:show="drawerVisible" />
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  Expand,
  Bell,
  CaretBottom,
  Search,
  User,
  Setting,
  SwitchButton,
} from "@element-plus/icons-vue";
import messageAll from "./messageAll.vue";

const route = useRoute();
const router = useRouter();
const searchText = ref("");

const drawerVisible = ref(false);

const pageTitle = computed(() => {
  return route.meta.title || route.name?.toString() || "Dashboard";
});

const handleCommand = (command: string) => {
  if (command === "logout") {
    logout();
  } else if (command === "profile") {
    // router.push('/profile')
  }
};

const logout = () => {
  localStorage.removeItem("token");
  router.push("/login");
};

const onShowDrawer = () => {
  drawerVisible.value = true;
};

defineEmits(["toggle-drawer"]);
</script>

<style scoped>
:deep(.el-breadcrumb__inner) {
  font-weight: 500 !important;
  color: #6b7280 !important;
}

:deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: var(--el-color-primary) !important;
  font-weight: 600 !important;
}

:deep(.el-input__wrapper) {
  background-color: #f9fafb;
  box-shadow: none !important;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
}

:deep(.el-input__wrapper:hover),
:deep(.el-input__wrapper.is-focus) {
  background-color: #fff;
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 1px var(--el-color-primary) !important;
}
</style>
