<template>
  <div class="h-full">
    <ExceptionPage v-if="!hasPermission" type="403" :title="title" />

    <ExceptionPage
      v-else-if="!hasData"
      type="construction"
      :title="title"
      description="Page Under Construction"
    />

    <div v-else class="px-6 py-3">
    <!-- Header Section -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-800 mb-1">Settings</h2>
      <p class="text-gray-500 text-sm">
        View open and resolved tickets, track their status, and chat directly
        with the Flowa Support Team.
      </p>
    </div>

    <!-- Toolbar: Tabs and Search -->
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4"
    >
      <div
        class="flex space-x-1 bg-#fff p-1 rounded-lg border border-1.5px border-solid border-#ECECEC"
      >
        <button
          v-for="tab in ['Profile', 'General', 'Order Operation Log']"
          :key="tab"
          @click="activeTab = tab"
          class="px-4 py-1.5 rounded-md text-sm font-medium transition-all border-0 bg-transparent"
          :class="
            activeTab === tab
              ? '!bg-#16215B text-white'
              : 'text-#6B6B6B hover:text-gray-900'
          "
        >
          {{ tab }}
        </button>
      </div>
      <div class="w-full sm:w-64">
        <el-input
          v-model="searchText"
          placeholder="Search"
          :prefix-icon="Search"
          clearable
          @clear="handleSearch"
          @input="handleSearch"
        />
      </div>
    </div>

    <!-- Profile Details Card -->
    <div
      v-if="activeTab === 'Profile'"
      class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <!-- Card Header -->
      <div
        class="px-6 py-4 border-b border-gray-100 flex justify-between items-center"
      >
        <div class="text-lg font-bold text-gray-800">Profile Details</div>
        <div class="flex space-x-2">
          <el-button
            v-if="!isEditing"
            circle
            plain
            class="!border-gray-200"
            @click="isEditing = true"
          >
            <el-icon><Edit /></el-icon>
          </el-button>

          <el-popover placement="bottom-end" :width="200" trigger="click">
            <template #reference>
              <el-button circle plain class="!border-gray-200">
                <el-icon><MoreFilled /></el-icon>
              </el-button>
            </template>
            <div class="py-1">
              <div
                class="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2 text-red-600 font-medium"
              >
                <el-icon><Headset /></el-icon>
                Contact Support
              </div>
            </div>
          </el-popover>
        </div>
      </div>
      <el-divider vertical class="!my-0" />

      <div class="p-6 sm:p-8">
        <div class="flex flex-col md:flex-row gap-6">
          <div class="w-full md:w-1/3 flex justify-center md:justify-start">
            <div
              class="relative group w-full aspect-square rounded-xl overflow-hidden bg-yellow-400"
            >
              <img
                src="./icons/avator.png"
                alt="Profile"
                class="w-full h-full object-cover"
              />
              <div
                class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4"
              >
                <el-upload
                  action="#"
                  :show-file-list="false"
                  :auto-upload="false"
                  :on-change="handleFileChange"
                >
                  <el-button
                    type="primary"
                    plain
                    class="!bg-white !text-primary !border-none shadow-lg"
                  >
                    <el-icon class="mr-1"><Upload /></el-icon>
                    Upload from Device
                  </el-button>
                </el-upload>
              </div>
            </div>
          </div>

          <div class="w-full md:w-2/3">
            <el-form
              :model="formData"
              label-position="top"
              class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2"
            >
              <el-form-item label="Name">
                <el-input
                  v-model="formData.name"
                  :readonly="!isEditing"
                  :class="{
                    '!border-none !shadow-none !bg-transparent': !isEditing,
                  }"
                />
              </el-form-item>

              <el-form-item label="Account">
                <el-input
                  v-model="formData.account"
                  readonly
                  class="!bg-gray-50"
                />
              </el-form-item>

              <el-form-item label="Department">
                <el-input
                  v-model="formData.department"
                  :readonly="!isEditing"
                />
              </el-form-item>

              <el-form-item label="Role">
                <el-input v-model="formData.role" readonly />
              </el-form-item>

              <el-form-item label="Email" class="sm:col-span-2">
                <el-input v-model="formData.email" :readonly="!isEditing">
                  <template #prefix>
                    <el-icon class="text-gray-400"><Message /></el-icon>
                  </template>
                </el-input>
              </el-form-item>

              <el-form-item label="Phone Number" class="sm:col-span-2">
                <div class="flex w-full">
                  <el-select
                    v-model="formData.countryCode"
                    class="w-32 mr-2"
                    :disabled="!isEditing"
                  >
                    <template #prefix>
                      <span class="text-lg mr-1">🇺🇸</span>
                    </template>
                    <el-option label="+01" value="+01" />
                    <el-option label="+86" value="+86" />
                  </el-select>
                  <el-input
                    v-model="formData.phone"
                    :readonly="!isEditing"
                    class="flex-1"
                  />
                </div>
              </el-form-item>

              <el-form-item label="Password" class="sm:col-span-2">
                <div class="flex w-full items-center gap-4">
                  <el-input
                    v-model="formData.password"
                    type="password"
                    readonly
                    show-password
                  />
                  <el-button
                    v-if="isEditing"
                    plain
                    @click="showPasswordDialog = true"
                    >Change Password</el-button
                  >
                </div>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>

      <!-- Footer Actions (Edit Mode Only) -->
      <div
        v-if="isEditing"
        class="px-6 py-4 border-t border-gray-100 flex justify-between bg-gray-50"
      >
        <el-button class="!px-8" @click="cancelEdit">Close</el-button>
        <el-button type="primary" class="!px-8 !bg-primary" @click="saveProfile"
          >Save</el-button
        >
      </div>
    </div>

    <!-- General Settings Tab -->
    <div
      v-else-if="activeTab === 'General'"
      class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <div class="p-6">
        <div
          v-for="category in ['Inventory', 'Orders']"
          :key="category"
          class="mb-8 last:mb-0"
        >
          <h3 class="text-lg font-bold text-gray-800 mb-4">{{ category }}</h3>
          <div class="space-y-6">
            <div
              v-for="setting in generalSettings.filter(
                (s) => s.category === category,
              )"
              :key="setting.id"
              class="flex items-center justify-between"
            >
              <div>
                <div class="font-medium text-gray-900">{{ setting.label }}</div>
                <div class="text-sm text-gray-500 mt-1">
                  {{ setting.description }}
                </div>
              </div>
              <el-switch
                v-model="setting.value"
                @change="
                  (val) => handleSettingChange(setting.key, val as boolean)
                "
                style="--el-switch-on-color: #1e3a8a"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Order Operation Log Tab -->
    <div
      v-else-if="activeTab === 'Order Operation Log'"
      class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <!-- Filters -->
      <div
        class="p-4 border-b border-gray-100 flex flex-wrap gap-4 items-center bg-gray-50"
      >
        <div class="w-64">
          <el-input
            v-model="logFilters.search"
            placeholder="Search by ID, SKU, Operator..."
            :prefix-icon="Search"
            clearable
            @input="handleLogsFilterChange"
          />
        </div>
        <el-date-picker
          v-model="logFilters.dateRange"
          type="daterange"
          range-separator="|"
          start-placeholder="Start date"
          end-placeholder="End date"
          format="DD MMM"
          class="!w-64"
          @change="handleLogsFilterChange"
        />
        <el-select
          v-model="logFilters.operator"
          placeholder="Operator"
          clearable
          class="!w-40"
          @change="handleLogsFilterChange"
        >
          <el-option label="Auto" value="Auto" />
          <el-option label="Admin" value="Admin" />
        </el-select>
      </div>

      <el-table
        :data="operationLogs"
        style="width: 100%"
        height="calc(100vh - 420px)"
        v-loading="logsLoading"
      >
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <el-table-column
          prop="sku"
          label="SKU"
          width="120"
          class-name="font-medium"
        />
        <el-table-column prop="actionInfo" label="Action Info" min-width="200">
          <template #default="{ row }">
            <div class="text-xs text-gray-600 line-clamp-2">
              {{ row.actionInfo }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="operationDetails"
          label="Operation Details"
          min-width="200"
        >
          <template #default="{ row }">
            <div class="text-xs text-gray-600 line-clamp-2">
              {{ row.operationDetails }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="operator"
          label="Operator"
          width="100"
          align="center"
          class-name="font-bold text-gray-900"
        />
        <el-table-column prop="date" label="Date" width="120" align="center">
          <template #default="{ row }">
            <div class="text-xs text-gray-500 whitespace-pre-line text-center">
              {{ row.date }}
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="p-4 flex justify-end">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          layout="prev, pager, next"
          :total="totalLogs"
          background
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>

  <el-dialog
    v-model="showPasswordDialog"
    title="Set your new password"
    width="500px"
    destroy-on-close
    class="!rounded-xl"
  >
    <div class="text-gray-500 text-sm mb-6">
      Use at least 10 characters, including 1 uppercase letter and 1 special
      character.<br />
      For security reasons, your new password must be different from your
      previous passwords.
    </div>

    <el-form :model="passwordForm" label-position="top">
      <el-form-item label="Email">
        <el-input v-model="formData.email" readonly>
          <template #prefix
            ><el-icon><Message /></el-icon
          ></template>
        </el-input>
      </el-form-item>
      <el-form-item label="New Password">
        <el-input
          v-model="passwordForm.newPassword"
          type="password"
          show-password
          placeholder="................"
        />
      </el-form-item>
      <el-form-item label="Confirm New Password">
        <el-input
          v-model="passwordForm.confirmPassword"
          type="password"
          show-password
          placeholder="................"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="flex justify-between">
        <el-button class="!px-6" @click="showPasswordDialog = false"
          >Cancel</el-button
        >
        <el-button
          type="primary"
          class="!px-6 !bg-primary"
          @click="handlePasswordChange"
          >Save New Password</el-button
        >
      </div>
    </template>
  </el-dialog>

  <el-dialog
    v-model="showSuccessDialog"
    width="400px"
    class="!rounded-xl text-center"
    :show-close="true"
  >
    <div class="flex flex-col items-center py-4">
      <div
        class="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4 text-primary text-3xl"
      >
        <el-icon><Check /></el-icon>
      </div>
      <h3 class="text-xl font-bold text-gray-900 mb-2">Password Updated</h3>
      <p class="text-gray-500 text-center mb-6">
        Your password has been changed. You can now use your new password to
        sign in.
      </p>

      <div class="flex w-full gap-3">
        <el-button class="flex-1" @click="showSuccessDialog = false"
          >Cancel</el-button
        >
        <el-button
          type="primary"
          class="flex-1 !bg-primary"
          @click="showSuccessDialog = false"
          >Done</el-button
        >
      </div>
    </div>
  </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import ExceptionPage from "@/components/common/ExceptionPage.vue";
import {
  Search,
  Edit,
  MoreFilled,
  Upload,
  Message,
  Check,
  Headset,
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import {
  getGeneralSettings,
  updateGeneralSetting,
  getOperationLogs,
  type GeneralSetting,
  type OperationLog,
} from "@/api/settings";

const route = useRoute();
const title = computed(() => route.meta.title || "Settings");

const hasPermission = ref(true);
const hasData = ref(true);

// UI State
const activeTab = ref("Profile");
const searchText = ref("");
const isEditing = ref(false);
const showPasswordDialog = ref(false);
const showSuccessDialog = ref(false);

// --- Profile Data ---
const formData = reactive({
  name: "Evan Su",
  account: "Evansu@email.com",
  department: "Management",
  role: "Owner",
  email: "email@address.com",
  countryCode: "+01",
  phone: "000 000 000 000",
  password: "password123",
});

const passwordForm = reactive({
  newPassword: "",
  confirmPassword: "",
});

// --- General Settings Data ---
const generalSettings = ref<GeneralSetting[]>([]);

// --- Logs Data ---
const operationLogs = ref<OperationLog[]>([]);
const logsLoading = ref(false);
const totalLogs = ref(0);
const logFilters = reactive({
  search: "",
  dateRange: null,
  operator: "",
});

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
});

// --- Initialization & Watchers ---
onMounted(() => {
  fetchGeneralSettings();
});

watch(activeTab, (val) => {
  if (val === "Order Operation Log") {
    // Reset pagination when switching to logs tab
    pagination.currentPage = 1;
    fetchLogs();
  }
});

// --- Methods ---

// General Settings
const fetchGeneralSettings = async () => {
  generalSettings.value = await getGeneralSettings();
};

const handleSettingChange = async (key: string, val: boolean) => {
  const success = await updateGeneralSetting(key, val);
  if (success) {
    ElMessage.success("Setting updated");
  } else {
    ElMessage.error("Failed to update setting");
    // Revert change locally if needed, but for mock assume success
  }
};

// Logs
const fetchLogs = async () => {
  logsLoading.value = true;
  try {
    const res = await getOperationLogs({
      search: logFilters.search,
      operator: logFilters.operator,
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      // date range logic would go here
    });
    operationLogs.value = res.list;
    totalLogs.value = res.total;
  } finally {
    logsLoading.value = false;
  }
};

const handleLogsFilterChange = () => {
  pagination.currentPage = 1; // Reset to first page on filter change
  fetchLogs();
};

const handlePageChange = (page: number) => {
  pagination.currentPage = page;
  fetchLogs();
};

const handleSearch = () => {
  // Global search implementation if needed
  if (activeTab.value === "Order Operation Log") {
    logFilters.search = searchText.value;
    handleLogsFilterChange();
  }
};

// Profile Methods
const handleFileChange = (file: any) => {
  ElMessage.success(`File selected: ${file.name}`);
};

const cancelEdit = () => {
  isEditing.value = false;
};

const saveProfile = () => {
  isEditing.value = false;
  ElMessage.success("Profile updated successfully");
};

const handlePasswordChange = () => {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    ElMessage.error("Passwords do not match");
    return;
  }
  if (passwordForm.newPassword.length < 6) {
    ElMessage.warning("Password is too short");
    return;
  }

  showPasswordDialog.value = false;
  showSuccessDialog.value = true;
  passwordForm.newPassword = "";
  passwordForm.confirmPassword = "";
};
</script>

<style scoped>
/* Custom primary color override */
.bg-primary {
  background-color: #1e3a8a;
}
.text-primary {
  color: #1e3a8a;
}

:deep(.el-input__wrapper) {
  box-shadow: none !important;
  border: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #1e3a8a;
  background-color: #fff;
}

/* When not editing, make inputs look like plain text */
:deep(.el-form-item) {
  margin-bottom: 12px;
}
</style>
