<template>
  <div class="min-h-screen box-border relative overflow-hidden bg-gradient-to-br from-[#0B1220] via-[#111A2E] to-[#0B1220]">
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#16215B]/30 blur-3xl" />
      <div class="absolute top-1/3 -right-24 w-96 h-96 rounded-full bg-[#2563EB]/20 blur-3xl" />
      <div class="absolute -bottom-24 left-1/3 w-96 h-96 rounded-full bg-[#C62828]/15 blur-3xl" />
    </div>

    <div class="relative flex items-center justify-center min-h-screen px-6 py-10  box-border">
      <div class="w-full max-w-5xl">
        <div
          class="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_70px_rgba(0,0,0,0.35)]"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-10 p-8 md:p-12 items-center">
            <div class="text-center md:text-left">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white/80 text-xs">
                <span class="w-2 h-2 rounded-full bg-[#2563EB]" />
                Page Not Found
              </div>

              <h1 class="mt-5 text-6xl md:text-7xl font-extrabold tracking-tight text-white">
                404
              </h1>
              <p class="mt-4 text-base md:text-lg text-white/70 leading-relaxed">
                你访问的页面不存在或已被移动。你可以返回上一页，或者回到仪表盘继续浏览。
              </p>

              <div class="mt-8 flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <el-button type="primary" size="large" class="!rounded-xl !px-6" @click="goHome">
                  <span class="flex items-center gap-2">
                    <Icon icon="svg-icon:rectangles-4" color="#fff" />
                    返回 Dashboard
                  </span>
                </el-button>
                <el-button size="large" class="!rounded-xl !px-6" @click="goBack">
                  <span class="flex items-center gap-2">
                    <Icon icon="svg-icon:arrow-left" color="#16215B" />
                    返回上一页
                  </span>
                </el-button>
              </div>

              <div class="mt-6 text-xs text-white/50">
                Requested path: <span class="text-white/70">{{ route.fullPath }}</span>
              </div>
            </div>

            <div class="flex items-center justify-center">
              <div class="relative w-full max-w-md">
                <div class="absolute inset-0 rounded-2xl bg-white/5 border border-white/10" />
                <div class="relative p-8">
                  <!-- <img :src="img404" alt="404" class="w-full h-auto select-none" /> -->
                  <div class="mt-6 grid grid-cols-2 gap-3">
                    <div class="rounded-xl bg-white/5 border border-white/10 p-4 text-left">
                      <div class="text-xs text-white/60">状态</div>
                      <div class="mt-1 text-sm font-semibold text-white">Not Found</div>
                    </div>
                    <div class="rounded-xl bg-white/5 border border-white/10 p-4 text-left">
                      <div class="text-xs text-white/60">建议</div>
                      <div class="mt-1 text-sm font-semibold text-white">检查 URL</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6 text-center text-xs text-white/40">
          Flowa Admin · {{ new Date().getFullYear() }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";

const router = useRouter();
const route = useRoute();

const goHome = () => {
  router.replace("/dashboard");
};

const goBack = () => {
  if (window.history.length > 1) router.back();
  else router.replace("/dashboard");
};
</script>
