<template>
  <Drawer
    :model-value="visible"
    :title="title"
    size="800px"
    @update:model-value="val => emit('update:visible', val)"
    @close="emit('close')"
  >
    <template #header>
      <div class="flex items-center justify-between w-full pr-4">
        <!-- Breadcrumb & Title -->
        <div>
          <div class="flex items-center text-xs text-gray-500 mb-1">
            <span class="text-blue-600 cursor-pointer" @click="emit('close')">All Products</span>
            <span class="mx-1">/</span>
            <span>{{ form.name || 'New Product' }}</span>
          </div>
          <div class="flex items-center gap-3">
            <h2 class="text-xl font-bold text-gray-900">{{ form.name || 'New Product' }}</h2>
            <el-tag type="success" effect="light" round size="small" v-if="form.status === 'In Stock'">In Stock</el-tag>
            <el-tag type="warning" effect="light" round size="small" v-else-if="form.status === 'Low Stock'">Low Stock</el-tag>
            <el-tag type="danger" effect="light" round size="small" v-else>Out of Stock</el-tag>
          </div>
          <div class="text-xs text-gray-400 mt-1 flex items-center gap-2">
            <span>/SKU {{ form.sku }}</span>
            <span>Last Update: {{ form.lastUpdated }}</span>
            <div class="flex items-center gap-2 ml-2">
              <el-button link :icon="Edit" />
              <el-button link :icon="Link" />
              <el-button link :icon="More" />
            </div>
          </div>
        </div>
        
        <!-- Close Icon -->
        <!-- <el-icon class="cursor-pointer" @click="emit('close')"><Close /></el-icon> -->
      </div>
    </template>

    <template #default>
      <!-- Tabs -->
      <div class="flex gap-2 mb-6 border-b border-gray-100 pb-4">
        <div 
          v-for="tab in tabs" 
          :key="tab"
          class="px-4 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-colors"
          :class="activeTab === tab ? 'bg-[#16215B] text-white' : 'text-gray-500 hover:bg-gray-50'"
          @click="activeTab = tab"
        >
          {{ tab }}
        </div>
      </div>

      <div v-if="activeTab === 'Product Details'" class="space-y-6">
        <!-- Top Info Section -->
        <div class="flex gap-6">
          <div class="w-1/3 aspect-[4/3] bg-gray-50 rounded-lg overflow-hidden">
            <img :src="form.image" class="w-full h-full object-cover" v-if="form.image" />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
              <el-icon :size="32"><Picture /></el-icon>
            </div>
          </div>
          <div class="flex-1 grid grid-cols-2 gap-4 content-start">
            <div class="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
              <div class="text-xs text-gray-500 mb-1">Cost Of Good</div>
              <div class="text-lg font-bold text-gray-900">$ {{ form.cost?.toFixed(2) || '0.00' }}</div>
            </div>
            <div class="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
              <div class="text-xs text-gray-500 mb-1">Best Before</div>
              <div class="text-lg font-bold text-gray-900">{{ form.bestBefore || '-' }}</div>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div class="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
          <h3 class="text-sm font-bold text-gray-900 mb-2">Product Details</h3>
          <p class="text-sm text-gray-600 leading-relaxed">
            {{ form.description }}
          </p>
        </div>

        <!-- Measures -->
        <div class="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-bold text-gray-900">Product Measures</h3>
            <div class="flex items-center gap-2 text-sm">
              <span :class="isMetric ? 'text-gray-900 font-medium' : 'text-gray-400'">Metric</span>
              <el-switch v-model="isMetric" style="--el-switch-on-color: #16215B; --el-switch-off-color: #16215B" />
              <span :class="!isMetric ? 'text-gray-900 font-medium' : 'text-gray-400'">Imperial</span>
            </div>
          </div>
          
          <div class="grid grid-cols-4 gap-4 mb-6">
            <div>
              <div class="text-xs text-gray-500 mb-1">Length ({{ isMetric ? 'cm' : 'in' }})</div>
              <div class="text-sm font-bold text-gray-900">{{ form.measures?.length }}</div>
            </div>
            <div>
              <div class="text-xs text-gray-500 mb-1">Width ({{ isMetric ? 'cm' : 'in' }})</div>
              <div class="text-sm font-bold text-gray-900">{{ form.measures?.width }}</div>
            </div>
            <div>
              <div class="text-xs text-gray-500 mb-1">Height ({{ isMetric ? 'cm' : 'in' }})</div>
              <div class="text-sm font-bold text-gray-900">{{ form.measures?.height }}</div>
            </div>
            <div>
              <div class="text-xs text-gray-500 mb-1">Net Weight ({{ isMetric ? 'g' : 'oz' }})</div>
              <div class="text-sm font-bold text-gray-900">{{ form.measures?.weight }}</div>
            </div>
          </div>

          <h4 class="text-sm font-bold text-gray-900 mb-3">QC Images</h4>
          <div class="grid grid-cols-4 gap-2">
            <div v-for="(img, idx) in form.qcImages" :key="idx" class="aspect-square bg-gray-50 rounded-lg overflow-hidden">
              <img :src="img" class="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-between items-center w-full">
        <el-button class="!rounded-lg" @click="emit('close')">Close</el-button>
        <div class="flex gap-2">
          <el-popconfirm title="Are you sure to delete this product?" @confirm="handleDelete">
            <template #reference>
              <el-button type="danger" plain class="!rounded-lg">Delete</el-button>
            </template>
          </el-popconfirm>
          <el-button type="primary" class="!rounded-lg !bg-[#16215B] !border-[#16215B]" @click="isEditing = true">Edit</el-button>
        </div>
      </div>
    </template>
  </Drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Drawer } from '@/components/base/Drawer'
import { Plus, Delete, Picture, Edit, Link, More } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getProductDetail, updateProduct, deleteProduct, createProduct } from '@/api/inventory'

const props = defineProps<{
  visible: boolean
  productId?: string
}>()

const emit = defineEmits(['update:visible', 'close', 'save', 'delete'])

const activeTab = ref('Product Details')
const tabs = ['Product Details', 'Storage Details', 'Supplier Info', 'Declare info']
const isMetric = ref(true)
const isEditing = ref(false)

const form = ref<any>({
  name: '',
  sku: '',
  status: 'In Stock',
  lastUpdated: '',
  cost: 0,
  bestBefore: '',
  description: '',
  measures: { length: 0, width: 0, height: 0, weight: 0 },
  qcImages: [],
  image: ''
})

const title = computed(() => '') // Custom header used

watch(() => props.productId, async (id) => {
  if (id) {
    try {
      const res = await getProductDetail(id)
      form.value = res
    } catch (error) {
      console.error(error)
    }
  } else {
    // Reset for new product
    form.value = {
      name: '',
      sku: '',
      status: 'In Stock',
      lastUpdated: new Date().toLocaleString(),
      cost: 0,
      description: '',
      measures: { length: 0, width: 0, height: 0, weight: 0 },
      qcImages: [],
      image: ''
    }
  }
}, { immediate: true })

const handleSave = async () => {
  try {
    if (props.productId) {
      await updateProduct(props.productId, form.value)
      ElMessage.success('Product updated successfully')
    } else {
      await createProduct(form.value)
      ElMessage.success('Product created successfully')
    }
    emit('save')
    emit('close')
  } catch (error) {
    ElMessage.error('Operation failed')
  }
}

const handleDelete = async () => {
  if (!props.productId) return
  try {
    await deleteProduct(props.productId)
    ElMessage.success('Product deleted')
    emit('delete')
    emit('close')
  } catch (error) {
    ElMessage.error('Delete failed')
  }
}
</script>