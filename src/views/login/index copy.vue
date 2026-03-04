<template>
  <div class="min-h-screen flex bg-white">
    <div class="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden bg-[#16215B]">
      <div class="absolute top-6 left-6">
        <img
          src="@/assets/login.png"
          alt="Flowa"
          class="w-[192px] h-[72px] object-contain"
        />
      </div>

      <div class="absolute inset-0 bg-gradient-to-br from-[#1E2A78CC] to-[#0A0F2BCC] z-10"></div>
      <div
        class="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full bg-primary/10 blur-3xl"
      ></div>
      <div
        class="absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full bg-primary/10 blur-3xl"
      ></div>

      <div
        class="relative z-20 text-center px-12 animate__animated animate__fadeIn bg-[url(@/assets/fj.png)] bg-no-repeat bg-center w-[430px] h-[300px]"
      >
        <div
          class="mb-8 flex justify-center absolute top--30 left-50% translate-x--50%"
        >
          <!-- <div
            class="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20"
          >
            <el-icon class="text-white text-4xl"><ElementPlus /></el-icon>
          </div> -->
        </div>

        <div class="bg-[#979EF066] absolute bottom--14 right--3 rounded-lg bg-[url(@/views/icon/logins.jpg)] bg-no-repeat bg-center bg-cover w-[241px] h-[191px]" />

        <div class="z-12">
          <!-- <h1 class="text-4xl font-bold text-white mb-4 tracking-tight">
            Flowa OMS
          </h1> -->
          <!-- <p class="text-blue-100 text-lg leading-relaxed max-w-md mx-auto">
            Next-generation Order Management System designed for scalability and
            efficiency.
          </p> -->
        </div>

        <div class="box box1">
          <span class="text-[18px] font-medium">4–10 Days</span>
          <span class="text-[10px] font-normal">Global delivery speed</span>
        </div>
        <div class="box box2">
           <span class="text-[18px] font-medium">100+ Markets</span>
          <span class="text-[10px] font-normal">Instant global reach</span>
        </div>
        <div class="box box3">
           <span class="text-[18px] font-medium">40% Saved</span>
          <span class="text-[10px] font-normal">Lower logistics costs</span>
        </div>
        <div class="box box4">
           <span class="text-[18px] font-medium">0 Tax Hassle</span>
          <span class="text-[10px] font-normal">Duties managed by Flowa</span>
        </div>
      </div>

      <div class="absolute z-20 top-60% right--17 bg-[url(@/views/icon/feiji.png)] bg-no-repeat bg-right bg-contain w-full h-[87px]" />
    </div>

    <div class="w-full lg:w-1/2 flex items-center justify-center bg-white px-6 sm:px-12">
      <div class="w-full max-w-md animate__animated animate__fadeInRight">
        <component
          :is="currentComp"
          @forgot="go('reset')"
          @signup="go('register')"
          @verify="go('verify')"
          @register="go('register')"
          @login="go('login')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import LoginForm from "./components/LoginForm.vue";
import ResetPassword from "./components/ResetPassword.vue";
import EmailVerification from "./components/EmailVerification.vue";
import RegisterForm from "./components/RegisterForm.vue";

const route = useRoute();
const router = useRouter();
const step = ref<"login" | "reset" | "verify" | "register">(
  (route.query.step as any) || "login"
);
const map = {
  login: LoginForm,
  reset: ResetPassword,
  verify: EmailVerification,
  register: RegisterForm,
};
const currentComp = computed(() => map[step.value]);
const go = (s: "login" | "reset" | "verify" | "register") => {
  step.value = s;
  router.replace({ path: "/login", query: { step: s } });
};
</script>

<style lang="less" scoped>
:deep(.el-input__wrapper) {
  padding: 8px 15px;
  box-shadow: 0 0 0 1px #e5e7eb inset;
}
:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--el-color-primary) inset !important;
}

.login-input :deep(.el-input__wrapper) {
  min-height: 44px;
  border-width: 1.5px;
  border-color: #ececec;
  border-radius: 12px;
}

.box {
  position: absolute;
  width: 152px;
  height: 70px;
  // top: 660.79px;
  // left: 291.79px;
  border-radius: 7.78px;
  border-width: 0.65px;
  // padding-top: 15.55px;
  // padding-right: 20.74px;
  // padding-bottom: 15.55px;
  // padding-left: 20.74px;
  gap: 7.78px;
  transform: rotate(0deg);
  opacity: 1;
  backdrop-filter: blur(19.58515739440918px);
  box-shadow: 0px 1.96px 24.48px 0px #0000004d;
  background: #979EF066;
  border: 0.65px solid #979EF0;
  z-index: 1000;

  color: #fff;
  display: grid;
  align-items: center;
  justify-items: center;
  box-sizing: border-box;
  gap: 1px;
  padding: 6px;
}

.box1 {
  top: -40px;
  left: -20px;
}
.box2 {
  top: 20px;
  right: -20px;
}
.box3 {
  bottom: 30px;
  left: 20px;
}
.box4 {
  bottom: -105px;
  right: 140px;
}
</style>
