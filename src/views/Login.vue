<template>
  <div class="min-h-screen flex">
    <div
      class="hidden lg:flex lg:w-1/2 bg-[#16215B] relative items-center justify-center overflow-hidden"
    >
      <div class="absolute top-6 left-6">
        <img
          src="@/assets/login.png"
          alt="Flowa"
          class="w-[192px] h-[72px] object-contain"
        />
      </div>

      <div
        class="absolute inset-0 from-primary/20 to-dark z-10"
      ></div>
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

        <div
          class="bg-[#979EF066] bg-blend-color absolute bottom--14 right--3 !rounded-lg bg-[url(@/views/icon/logins.jpg)] bg-no-repeat bg-center bg-cover w-[241px] h-[191px]"
        />

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

      <div
        class="absolute z-20 top-60% right--17 bg-[url(@/views/icon/feiji.png)] bg-no-repeat bg-right bg-contain w-full h-[87px]"
      />
    </div>

    <div
      class="w-full lg:w-1/2 flex items-center justify-center bg-white px-6 sm:px-12"
    >
      <div class="w-full max-w-md animate__animated animate__fadeInRight">
        <div class="text-center mb-10 lg:text-center">
          <h2 class="text-3xl font-bold text-#16215B mb-2">Welcome To Flowa</h2>
          <p class="text-gray-600">
            Ship globally. Faster. Smarter. From China.
          </p>
        </div>

        <el-form
          ref="loginFormRef"
          :model="form"
          :rules="rules"
          class="bg-white p-8 rounded-2xl shadow-card border border-gray-100"
          size="large"
        >
          <el-form-item prop="username" class="mb-6">
            <div class="font-medium text-gray-700 mb-1">Email</div>
            <el-input
              v-model="form.username"
              placeholder="Enter your username"
              :prefix-icon="User"
            />
          </el-form-item>

          <el-form-item prop="password" class="mb-6">
            <div class="font-medium text-gray-700 mb-1">Password</div>
            <el-input
              v-model="form.password"
              type="password"
              placeholder="Enter your password"
              show-password
              :prefix-icon="Lock"
            />
          </el-form-item>

          <div class="flex items-center justify-between mb-8">
            <el-checkbox v-model="form.remember" custom-class="text-gray-500"
              >Remember for 30 Days</el-checkbox
            >
            <a href="#" class="text-sm text-#16215B hover:underline"
              >Forgot password?</a
            >
          </div>

          <el-button
            type="primary"
            class="w-full !h-12 !text-lg !rounded-lg"
            :loading="loading"
            @click="handleLogin"
          >
            Sign In
          </el-button>

          <div class="mt-6 text-center text-sm text-gray-500">
            Don't have an account?
            <a href="#" class="text-primary font-medium hover:underline"
              >Sign Up</a
            >
          </div>
        </el-form>

        <div class="mt-8 text-center">
          <p class="text-xs text-gray-400">
            © 2025 Flowa OMS. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { User, Lock, ElementPlus } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

const router = useRouter();
const loginFormRef = ref();
const loading = ref(false);

const form = reactive({
  username: "",
  password: "",
  remember: false,
});

const rules = {
  username: [
    { required: true, message: "Please input username", trigger: "blur" },
    { min: 3, message: "Length should be at least 3", trigger: "blur" },
  ],
  password: [
    { required: true, message: "Please input password", trigger: "blur" },
    { min: 4, message: "Length should be at least 4", trigger: "blur" },
  ],
};

const handleLogin = async () => {
  if (!loginFormRef.value) return;

  await loginFormRef.value.validate((valid: boolean) => {
    if (valid) {
      loading.value = true;
      setTimeout(() => {
        localStorage.setItem("token", "mock-token-123");
        ElMessage.success("Login successfully");
        router.push("/");
        loading.value = false;
      }, 1000);
    }
  });
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
