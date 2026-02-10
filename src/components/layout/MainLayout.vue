<template>
  <div class="common-layout h-full bg-gray-50/50">
    <el-container class="h-full flex flex-col min-h-screen relative">
      <Header @toggle-drawer="drawer = true" />

      <!-- Mobile Drawer Sidebar -->
      <!-- <el-drawer
        v-model="drawer"
        :with-header="false"
        direction="ltr"
        size="240px"
        class="!p-0 !bg-dark"
      >
        <div class="h-full bg-dark text-white flex flex-col">
          <div
            class="h-16 flex items-center px-6 bg-dark shadow-sm flex-shrink-0 border-b border-white/10"
          >
            <div class="w-8 h-8 rounded-lg bg-primary mr-3 flex-center">
              <el-icon class="text-white text-lg"><ElementPlus /></el-icon>
            </div>
            <span class="text-lg font-bold tracking-wide text-white"
              >Flowa OMS</span
            >
          </div>
          <el-scrollbar class="flex-1">
            <SidebarMenu />
          </el-scrollbar>
        </div>
      </el-drawer> -->

      <el-container class="h-1">
        <el-aside
          width="240px"
          class="hidden md:flex text-blue transition-all duration-300 shadow-xl z-20 flex-col h-full"
        >
          <!-- Logo -->
       

          <!-- Menu -->
          <el-scrollbar class="flex-1">
            <SidebarMenu />
          </el-scrollbar>
        </el-aside>

        <el-main class="bg-gray-50/50 p-2 sm:p-2 overflow-hidden max-h-full">
          <div class="max-w-7xl mx-auto w-full overflow-y-scroll h-full">
            <router-view v-slot="{ Component }">
              <transition
                enter-active-class="animate__animated animate__fadeIn animate__faster"
                leave-active-class="animate__animated animate__fadeOut animate__faster"
                mode="out-in"
              >
                <component :is="Component" />
              </transition>
            </router-view>
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import SidebarMenu from "./SidebarMenu.vue";
import Header from "./Header.vue";

const drawer = ref(false);
</script>

