<template>
  <div class="bundles h-full flex flex-col">
    <div class="flex justify-between items-center mb-4 flex-shrink-0">
      <div>
        <div class="flex items-center gap-1 line-height-22px">
          <div class="text-#000 text-28px line-height-36px">Inventory</div>
          <div class="text-#9A9A9A text-20px pt-1">/Bundles</div>
        </div>
        <div class="text-14px text-#6B6B6B">
          Create and manage product bundles. Combine items, edit configurations, and control bundled inventory.
        </div>
      </div>
      <div class="flex items-center gap-3">
        <el-button type="primary" size="large" @click="handleCreateBundle">
          <span class="flex items-center gap-2">
            <img src="./Icons/plus.svg" alt="plus" class="w-3 h-3" />
            <span>Create Bundle</span>
          </span>
        </el-button>
      </div>
    </div>
    
    <BundleFilter ref="filterRef" @search="handleFilterSearch" />

    <div class="flex-1 min-h-0 rounded-xl overflow-hidden mt-3">
      <BaseTable
        :data="tableData"
        :columns="columns"
        :loading="loading"
        :pagination="true"
        :total="total"
        v-model:page="page"
        v-model:limit="limit"
        @pagination-change="fetchData"
        @expand-change="handleExpandChange"
      >
        <!-- Collapsed Row Slots -->
        <template #bundle="{ row }">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded bg-gray-100 flex-shrink-0 overflow-hidden">
              <img :src="row.image" class="w-full h-full object-cover" />
            </div>
            <div class="flex flex-col">
              <span class="text-sm font-bold text-gray-900">{{ row.name }}</span>
              <span class="text-xs text-gray-500">{{ row.sku }}</span>
            </div>
          </div>
        </template>
        
        <template #items="{ row }">
          <div class="flex flex-col text-xs text-gray-500">
            <span v-for="(item, idx) in (row.items || []).slice(0, 2)" :key="idx">
              {{ item.name }} x{{ item.qty }}
            </span>
            <span v-if="(row.items || []).length > 2">...</span>
          </div>
        </template>

        <template #inventory="{ row }">
          <el-tag 
            effect="dark" 
            class="!rounded-full !px-3 !border-none"
            :class="row.stock > 0 ? '!bg-[#E6F4EA] !text-[#1E8E3E]' : '!bg-[#FCE8E6] !text-[#D93025]'"
          >
            {{ row.stock > 0 ? 'In Stock' : 'Out of Stock' }}
          </el-tag>
        </template>

        <template #packWeight>
          <span class="text-gray-600">0,5 g</span>
        </template>

        <template #cog="{ row }">
          <span class="text-gray-600">$ {{ row.price }}</span>
        </template>

        <template #actions="{ row }">
          <div class="flex items-center gap-2">
            <el-button circle size="small" class="!border-gray-200" @click="handleEdit(row)">
              <el-icon class="text-gray-600"><Edit /></el-icon>
            </el-button>
            <el-button circle size="small" class="!border-gray-200">
              <el-icon class="text-gray-600"><MoreFilled /></el-icon>
            </el-button>
          </div>
        </template>

        <!-- Expanded Row Content -->
        <template #expand="{ row }">
          <div class="p-4 bg-gray-50/50">
            <div class="bg-white rounded-xl border border-gray-100 p-6">
              <div class="flex justify-between items-start mb-6">
                <div>
                  <h3 class="text-xl font-bold text-gray-900 mb-1">{{ row.name }}</h3>
                  <p class="text-sm text-gray-500">Last Update: {{ row.lastUpdated }}</p>
                </div>
                <div class="text-right">
                  <div class="text-sm text-gray-500">
                    Bundle Name <span class="font-bold text-gray-900 ml-1">{{ row.name }}</span>
                  </div>
                  <div class="text-sm text-gray-500 mt-1">
                    Barcode <span class="text-gray-900 ml-1">{{ row.sku }}</span>
                  </div>
                </div>
              </div>

              <!-- Inner Table -->
              <el-table :data="row.items || []" class="inner-table">
                <el-table-column label="Product/ SKU ID" width="300">
                  <template #default="{ row: item }">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded bg-gray-100 flex-shrink-0">
                        <img src="https://via.placeholder.com/40" class="w-full h-full object-cover rounded" />
                      </div>
                      <div>
                        <div class="font-bold text-gray-900">{{ item.name }}</div>
                        <div class="text-xs text-gray-500">SKU {{ item.sku }}</div>
                      </div>
                    </div>
                  </template>
                </el-table-column>
                
                <el-table-column label="Details" prop="details">
                  <template #default="{ row: item }">
                    <span class="text-gray-500 truncate block">{{ item.details }}</span>
                  </template>
                </el-table-column>

                <el-table-column label="Quantity" width="150">
                  <template #default="{ row: item }">
                    <div class="flex flex-col items-center">
                      <span class="font-medium">{{ item.qty }}</span>
                      <el-tag 
                        size="small" 
                        effect="dark" 
                        class="!rounded-full mt-1 !border-none"
                        :class="item.stockStatus === 'In Stock' ? '!bg-[#E6F4EA] !text-[#1E8E3E]' : '!bg-[#FCE8E6] !text-[#D93025]'"
                      >
                        {{ item.stockStatus }}
                      </el-tag>
                    </div>
                  </template>
                </el-table-column>

                <el-table-column label="Actions" width="100" align="right">
                  <template #default>
                    <el-button link type="danger">
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </template>
      </BaseTable>
    </div>

    <BundleDetail 
      v-model="detailVisible"
      :bundle-id="currentBundleId"
      @save="fetchData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BaseTable from '../../components/common/BaseTable.vue'
import BundleFilter from './components/BundleFilter.vue'
import BundleDetail from './components/BundleDetail.vue'
import { getInventoryBundles } from '@/api/inventory'
import { Edit, MoreFilled, Delete } from '@element-plus/icons-vue'

const filterRef = ref()
const currentFilters = ref({})
const detailVisible = ref(false)
const currentBundleId = ref<string | undefined>(undefined)

const columns = [
  { type: 'expand', slot: 'expand', width: 40, label: '' }, // Add expand column
  { label: 'Bundle / Barcode', slot: 'bundle', width: 280 },
  { label: 'Items', slot: 'items' },
  { label: 'Inventory', slot: 'inventory', width: 140 },
  { label: 'Packaging Weight', slot: 'packWeight', width: 160 },
  { label: 'COG', slot: 'cog', width: 140 },
  { label: 'Actions', slot: 'actions', width: 120, fixed: 'right' }
]

const tableData = ref<any[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const limit = ref(10)

const fetchData = async () => {
  loading.value = true
  try {
    const response = await getInventoryBundles({
      page: page.value,
      pageSize: limit.value,
      ...currentFilters.value
    })
    tableData.value = response.list
    total.value = response.total
  } catch (error) {
    console.error('Failed to fetch bundles:', error)
  } finally {
    loading.value = false
  }
}

const handleFilterSearch = (params: any) => {
  currentFilters.value = params
  page.value = 1
  fetchData()
}

const handleCreateBundle = () => {
  currentBundleId.value = undefined
  detailVisible.value = true
}

const handleEdit = (row: any) => {
  currentBundleId.value = row.id
  detailVisible.value = true
}

const handleExpandChange = () => {
  // Logic to load details if needed, currently we assume details are in row.items
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped lang="less">
.inner-table {
  :deep(th) {
    font-weight: 600;
    color: #111827;
    background-color: transparent !important;
    border-bottom: 1px solid #E5E7EB !important;
  }
  :deep(td) {
    background-color: transparent !important;
    border-bottom: 1px solid #F3F4F6 !important;
  }
  :deep(.el-table__inner-wrapper::before) {
    display: none;
  }
}
</style>
