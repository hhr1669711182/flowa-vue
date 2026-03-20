<template>
  <div class="bundle-detail">
    <Drawer
      v-model="visible"
      size="80%"
      :with-header="true"
      :show-close="false"
      destroy-on-close
      class="bundle-drawer"
    >
      <template #header>
        <div class="flex items-center justify-between w-full">
          <div class="flex items-center gap-4">
            <el-button link class="!text-gray-600 !p-0" @click="handleCancel">
              <el-icon :size="20"><Back /></el-icon>
            </el-button>
            <div class="flex flex-col">
              <div class="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <span class="text-blue-600 font-medium cursor-pointer" @click="handleCancel">Bundles</span>
                <span>/</span>
                <span>{{ form.name || 'New Bundle' }}</span>
              </div>
            </div>
          </div>
          <el-button link class="!text-gray-400 !p-0" @click="handleCancel">
            <el-icon :size="20"><Close /></el-icon>
          </el-button>
        </div>
      </template>

      <!-- Main Content -->
      <div class="space-y-6">
        <!-- Title Section -->
        <div class="flex justify-between items-start">
          <div>
            <div v-if="!isEdit" class="text-3xl font-bold text-gray-900 mb-2">Create New Bundle</div>
            <div v-else class="text-3xl font-bold text-gray-900 mb-2">{{ form.name }}</div>
            <div class="text-sm text-gray-500 flex items-center gap-2">
              <span v-if="form.sku">/{{ form.sku }}</span>
              <span v-if="isEdit">Last Update: {{ lastUpdated || 'Just now' }}</span>
            </div>
          </div>
          <div class="flex gap-2">
            <el-button circle size="small"><el-icon><Edit /></el-icon></el-button>
            <el-button circle size="small"><el-icon><Printer /></el-icon></el-button>
            <el-button circle size="small"><el-icon><MoreFilled /></el-icon></el-button>
          </div>
        </div>

        <!-- Card 1: General Info -->
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div class="flex gap-8">
            <!-- Image -->
            <div class="w-48 h-32 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden relative group cursor-pointer">
              <img v-if="form.image" :src="form.image" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                <el-icon :size="32"><Picture /></el-icon>
              </div>
              <div class="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white">
                Change
              </div>
            </div>

            <!-- Fields -->
            <div class="flex-1 space-y-6">
              <div class="flex gap-8">
                <div class="flex-1">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Cost Of Good</label>
                  <el-input v-model="form.cost" placeholder="$ 0.00">
                    <template #prefix>$</template>
                  </el-input>
                </div>
                <div class="flex-1">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Best Before</label>
                  <el-date-picker 
                    v-model="form.bestBefore" 
                    type="date" 
                    placeholder="Select date" 
                    class="!w-full"
                    format="MM/YYYY"
                    value-format="YYYY-MM-DD"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-900 mb-3">Measures</label>
                <div class="grid grid-cols-4 gap-4">
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">Length (cm)</label>
                    <el-input v-model="form.measures.length" placeholder="0 cm" />
                  </div>
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">Width (cm)</label>
                    <el-input v-model="form.measures.width" placeholder="0 cm" />
                  </div>
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">Height (cm)</label>
                    <el-input v-model="form.measures.height" placeholder="0 cm" />
                  </div>
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">Net Weight (g)</label>
                    <el-input v-model="form.measures.weight" placeholder="0 g" />
                  </div>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-500 mb-2">Packaging</label>
                <el-select v-model="form.packaging" class="w-full" placeholder="Packaging Selection">
                  <el-option label="Standard Box" value="Standard Box" />
                  <el-option label="Poly Mailer" value="Poly Mailer" />
                  <el-option label="Bubble Mailer" value="Bubble Mailer" />
                </el-select>
              </div>
            </div>
          </div>
        </div>

        <!-- Card 2: Items -->
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold text-gray-900">Items</h3>
            <el-button type="primary" plain @click="addItem">
              <el-icon class="mr-1"><Plus /></el-icon> Add Item
            </el-button>
          </div>

          <el-table :data="form.items" class="items-table" :header-cell-style="{ background: '#F9FAFB', color: '#111827', fontWeight: '600' }">
            <el-table-column type="selection" width="40" />
            <el-table-column label="Product/ SKU ID" min-width="240">
              <template #default="{ row }">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded bg-gray-100 flex-shrink-0">
                    <img src="https://via.placeholder.com/40" class="w-full h-full object-cover rounded" />
                  </div>
                  <div>
                    <div class="font-bold text-gray-900">{{ row.name || 'New Item' }}</div>
                    <div class="text-xs text-gray-500">SKU {{ row.sku || '---' }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="Details" min-width="200">
              <template #default="{ row }">
                <span class="text-gray-500 truncate block">{{ row.details || 'No details' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="Quantity" width="120">
              <template #default="{ row }">
                <el-input-number v-model="row.qty" :min="1" size="small" controls-position="right" class="!w-20" />
              </template>
            </el-table-column>
            <el-table-column label="Inventory" width="120">
              <template #default="{ row }">
                <el-tag 
                  size="small" 
                  effect="dark" 
                  class="!rounded-full !border-none"
                  :class="row.stockStatus === 'Out of Stock' ? '!bg-[#FCE8E6] !text-[#D93025]' : '!bg-[#E6F4EA] !text-[#1E8E3E]'"
                >
                  {{ row.stockStatus || 'In Stock' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="Actions" width="80" align="center">
              <template #default="{ $index }">
                <el-button link type="danger" @click="removeItem($index)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button size="large" class="!px-8" @click="handleCancel">Cancel</el-button>
          <el-button type="primary" size="large" class="!px-8 !bg-[#1E2B58]" @click="handleSave">Save</el-button>
        </div>
      </template>
    </Drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { Plus, Delete, Edit, Printer, MoreFilled, Back, Close, Picture } from '@element-plus/icons-vue'
import { getBundleDetail, createBundle, updateBundle } from '@/api/inventory'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  modelValue: boolean
  bundleId?: string
}>()

const emit = defineEmits(['update:modelValue', 'save', 'close'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const isEdit = computed(() => !!props.bundleId)
const lastUpdated = ref('')

const form = reactive({
  name: '',
  sku: '',
  image: '',
  cost: '',
  bestBefore: '',
  measures: {
    length: '',
    width: '',
    height: '',
    weight: ''
  },
  packaging: '',
  items: [] as any[]
})

const loadData = async () => {
  if (!props.bundleId) {
    // Reset form
    form.name = 'New Bundle'
    form.sku = ''
    form.image = ''
    form.cost = ''
    form.bestBefore = ''
    form.measures = { length: '100', width: '100', height: '100', weight: '100' }
    form.packaging = ''
    form.items = []
    lastUpdated.value = ''
    return
  }
  
  try {
    const res = await getBundleDetail(props.bundleId)
    form.name = res.name
    form.sku = res.sku
    form.image = res.image
    form.cost = res.cost
    form.bestBefore = res.bestBefore
    form.measures = res.measures || { length: '100', width: '100', height: '100', weight: '100' }
    form.packaging = res.packaging
    form.items = res.items || []
    lastUpdated.value = res.lastUpdated
  } catch (error) {
    console.error(error)
    ElMessage.error('Failed to load bundle details')
  }
}

watch(() => props.modelValue, (val) => {
  if (val) {
    loadData()
  }
})

const addItem = () => {
  // Mock adding a product
  form.items.push({
    name: 'Black Shirt S',
    sku: '012345',
    details: 'Black Shirt S Cotton...',
    qty: 1,
    stockStatus: 'In Stock'
  })
}

const removeItem = (index: number) => {
  form.items.splice(index, 1)
}

const handleSave = async () => {
  try {
    if (isEdit.value) {
      await updateBundle(props.bundleId!, form)
      ElMessage.success('Bundle updated successfully')
    } else {
      await createBundle(form)
      ElMessage.success('Bundle created successfully')
    }
    emit('save')
    visible.value = false
  } catch (error) {
    console.error(error)
    ElMessage.error('Failed to save bundle')
  }
}

const handleCancel = () => {
  visible.value = false
  emit('close')
}
</script>

<style scoped>
.items-table :deep(th.el-table__cell) {
  background-color: #F9FAFB !important;
  color: #111827;
  font-weight: 600;
  border-bottom: 1px solid #E5E7EB;
}
.items-table :deep(td.el-table__cell) {
  border-bottom: 1px solid #F3F4F6;
}
</style>
