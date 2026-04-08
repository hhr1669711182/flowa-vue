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
        <div>
          <div class="flex items-center text-xs text-gray-500 mb-1">
            <span class="text-blue-600 cursor-pointer" @click="emit('close')">All Products</span>
            <span class="mx-1">/</span>
            <span>{{ form.item_name || 'New Product' }}</span>
          </div>
          <div class="flex items-center gap-3">
            <h2 class="text-xl font-bold text-gray-900">{{ form.item_name || 'New Product' }}</h2>
            <el-tag type="success" effect="light" round size="small" v-if="!form.disabled">In Stock</el-tag>
            <el-tag type="danger" effect="light" round size="small" v-else>Disabled</el-tag>
          </div>
          <div class="text-xs text-gray-400 mt-1 flex items-center gap-2">
            <span>/SKU {{ form.item_code }}</span>
            <span>Last Update: {{ form.modified }}</span>
          </div>
        </div>
      </div>
    </template>

    <template #default>
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

      <!-- Product Details -->
      <div v-if="activeTab === 'Product Details'" class="space-y-6">
        <div class="flex gap-6">
          <div class="w-1/3">
            <div class="aspect-[4/3] bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
              <img v-if="form.image" :src="form.image" class="w-full h-full object-cover" />
              <div v-else class="text-gray-300 text-center">
                <el-icon :size="48"><Picture /></el-icon>
                <div class="text-xs mt-2">No Image</div>
              </div>
            </div>
            <el-input v-if="isEditing" v-model="form.image" placeholder="Image URL" size="small" class="mt-2" />
          </div>
          <div class="flex-1 grid grid-cols-2 gap-4 content-start">
            <div class="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
              <div class="text-xs text-gray-500 mb-1">Cost Of Good</div>
              <el-input-number v-if="isEditing" v-model="form.valuation_rate" :precision="2" :step="0.01" controls-position="right" class="w-full" />
              <div v-else class="text-lg font-bold text-gray-900">$ {{ (form.valuation_rate ?? 0).toFixed(2) }}</div>
            </div>
            <div class="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
              <div class="text-xs text-gray-500 mb-1">Best Before / End of Life</div>
              <el-date-picker v-if="isEditing" v-model="form.end_of_life" type="date" value-format="YYYY-MM-DD" placeholder="Select date" class="w-full" />
              <div v-else class="text-lg font-bold text-gray-900">{{ form.end_of_life || '-' }}</div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
          <h3 class="text-sm font-bold text-gray-900 mb-3">Product Details</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-xs text-gray-500 mb-1">Item Name (EN)</div>
              <el-input v-if="isEditing" v-model="form.item_name" placeholder="Item Name" />
              <p v-else class="text-sm text-gray-900">{{ form.item_name || '-' }}</p>
            </div>
            <div>
              <div class="text-xs text-gray-500 mb-1">Item Name (CN)</div>
              <el-input v-if="isEditing" v-model="form.item_name_cn" placeholder="Item Name CN" />
              <p v-else class="text-sm text-gray-900">{{ form.item_name_cn || '-' }}</p>
            </div>
            <div class="col-span-2">
              <div class="text-xs text-gray-500 mb-1">Description</div>
              <el-input v-if="isEditing" v-model="form.description" type="textarea" :rows="3" placeholder="Description" />
              <p v-else class="text-sm text-gray-600 leading-relaxed">{{ form.description || '-' }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-bold text-gray-900">Product Measures</h3>
            <div class="flex items-center gap-2 text-sm">
              <span :class="isMetric ? 'text-gray-900 font-medium' : 'text-gray-400'">Metric</span>
              <el-switch v-model="isMetric" style="--el-switch-on-color: #16215B; --el-switch-off-color: #16215B" />
              <span :class="!isMetric ? 'text-gray-900 font-medium' : 'text-gray-400'">Imperial</span>
            </div>
          </div>
          <div class="grid grid-cols-4 gap-4">
            <div>
              <div class="text-xs text-gray-500 mb-1">Length ({{ isMetric ? 'cm' : 'in' }})</div>
              <el-input-number v-if="isEditing" v-model="form.length" :precision="2" :step="0.1" controls-position="right" class="w-full" />
              <div v-else class="text-sm font-bold text-gray-900">{{ (form.length ?? 0).toFixed(2) }}</div>
            </div>
            <div>
              <div class="text-xs text-gray-500 mb-1">Width ({{ isMetric ? 'cm' : 'in' }})</div>
              <el-input-number v-if="isEditing" v-model="form.width" :precision="2" :step="0.1" controls-position="right" class="w-full" />
              <div v-else class="text-sm font-bold text-gray-900">{{ (form.width ?? 0).toFixed(2) }}</div>
            </div>
            <div>
              <div class="text-xs text-gray-500 mb-1">Height ({{ isMetric ? 'cm' : 'in' }})</div>
              <el-input-number v-if="isEditing" v-model="form.height" :precision="2" :step="0.1" controls-position="right" class="w-full" />
              <div v-else class="text-sm font-bold text-gray-900">{{ (form.height ?? 0).toFixed(2) }}</div>
            </div>
            <div>
              <div class="text-xs text-gray-500 mb-1">Net Weight ({{ isMetric ? 'g' : 'oz' }})</div>
              <el-input-number v-if="isEditing" v-model="form.weight_per_unit" :precision="2" :step="0.01" controls-position="right" class="w-full" />
              <div v-else class="text-sm font-bold text-gray-900">{{ (form.weight_per_unit ?? 0).toFixed(2) }}</div>
            </div>
          </div>
        </div>

        <div v-if="!isEditing" class="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
          <h3 class="text-sm font-bold text-gray-900 mb-2">Item Code (Read-only)</h3>
          <p class="text-sm text-gray-600 font-mono">{{ form.item_code }}</p>
        </div>
        <div v-if="!isEditing && barcodeDisplay" class="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
          <h3 class="text-sm font-bold text-gray-900 mb-2">Barcode (Read-only)</h3>
          <p class="text-sm text-gray-600 font-mono">{{ barcodeDisplay }}</p>
        </div>
      </div>

      <!-- Storage Details -->
      <div v-if="activeTab === 'Storage Details'" class="space-y-6">
        <div class="bg-white rounded-lg border border-gray-100 p-6 shadow-sm">
          <h3 class="text-base font-bold text-gray-900 mb-4">Inventory Snapshot (WDT)</h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="p-4 rounded-lg bg-gray-50">
              <div class="text-xs text-gray-500 mb-1">Total (WDT Quantity)</div>
              <div class="text-lg font-bold text-gray-900">{{ (form.wdt_quantity ?? 0).toFixed(2) }}</div>
            </div>
            <div class="p-4 rounded-lg bg-gray-50">
              <div class="text-xs text-gray-500 mb-1">Reserved (WDT Lock Quantity)</div>
              <div class="text-lg font-bold text-gray-900">{{ (form.wdt_lock_quantity ?? 0).toFixed(2) }}</div>
            </div>
            <div class="p-4 rounded-lg bg-gray-50 col-span-2">
              <div class="text-xs text-gray-500 mb-1">Available</div>
              <div class="text-lg font-bold text-gray-900">{{ Math.max(0, (form.wdt_quantity ?? 0) - (form.wdt_lock_quantity ?? 0)).toFixed(2) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Supplier Info -->
      <div v-if="activeTab === 'Supplier Info'" class="space-y-6">
        <div class="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
          <h3 class="text-base font-bold text-gray-900 mb-4">Item Defaults (Company / Warehouse)</h3>
          <div v-if="isEditing">
            <div v-for="(row, idx) in form.item_defaults" :key="idx" class="flex gap-2 mb-2 items-center">
              <el-input v-model="row.company" placeholder="Company" style="width: 180px" />
              <el-input v-model="row.default_warehouse" placeholder="Default Warehouse" style="flex: 1" />
              <el-button type="danger" text @click="form.item_defaults.splice(idx, 1)">Remove</el-button>
            </div>
            <el-button type="primary" text @click="form.item_defaults.push({ company: '', default_warehouse: '' })">Add Row</el-button>
          </div>
          <div v-else>
            <div v-for="(row, idx) in (form.item_defaults || [])" :key="idx" class="text-sm text-gray-600 py-1">
              {{ row.company }} — {{ row.default_warehouse || '-' }}
            </div>
            <p v-if="!form.item_defaults?.length" class="text-sm text-gray-400">No entries</p>
          </div>
        </div>
        <div class="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
          <h3 class="text-base font-bold text-gray-900 mb-4">Supplier Items</h3>
          <div v-if="isEditing">
            <div v-for="(row, idx) in form.supplier_items" :key="idx" class="flex gap-2 mb-2 items-center">
              <el-select v-model="row.supplier" placeholder="Supplier" filterable clearable style="width: 220px" @focus="loadSupplierList">
                <el-option v-for="s in supplierList" :key="s.name" :label="s.supplier_name || s.name" :value="s.name" />
              </el-select>
              <el-input v-model="row.supplier_part_no" placeholder="Supplier Part No" style="flex: 1" />
              <el-button type="danger" text @click="form.supplier_items.splice(idx, 1)">Remove</el-button>
            </div>
            <el-button type="primary" text @click="form.supplier_items.push({ supplier: '', supplier_part_no: '' })">Add Row</el-button>
          </div>
          <div v-else>
            <div v-for="(row, idx) in (form.supplier_items || [])" :key="idx" class="text-sm text-gray-600 py-1">
              {{ row.supplier }} — {{ row.supplier_part_no || '-' }}
            </div>
            <p v-if="!form.supplier_items?.length" class="text-sm text-gray-400">No entries</p>
          </div>
        </div>
      </div>

      <!-- Declare info -->
      <div v-if="activeTab === 'Declare info'" class="space-y-6">
        <div class="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
          <h3 class="text-base font-bold text-gray-900 mb-4">Declaration</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-xs text-gray-500 mb-1">To US Declared value (USD)</div>
              <el-input-number v-if="isEditing" v-model="form.valuation_rate" :precision="2" :step="0.01" controls-position="right" class="w-full" />
              <div v-else class="text-sm text-gray-900">{{ form.valuation_rate != null ? Number(form.valuation_rate).toFixed(2) : '-' }}</div>
            </div>
            <div>
              <div class="text-xs text-gray-500 mb-1">Declared value (USD)</div>
              <el-input-number v-if="isEditing" v-model="form.custom_valuation_rate2" :precision="2" :step="0.01" controls-position="right" class="w-full" />
              <div v-else class="text-sm text-gray-900">{{ form.custom_valuation_rate2 != null ? Number(form.custom_valuation_rate2).toFixed(2) : '-' }}</div>
            </div>
            <div>
              <div class="text-xs text-gray-500 mb-1">EX China Declared value FOB (USD)</div>
              <el-input-number v-if="isEditing" v-model="form.custom_ex_china_declared_value" :precision="2" :step="0.01" controls-position="right" class="w-full" />
              <div v-else class="text-sm text-gray-900">{{ form.custom_ex_china_declared_value != null ? Number(form.custom_ex_china_declared_value).toFixed(2) : '-' }}</div>
            </div>
            <div>
              <div class="text-xs text-gray-500 mb-1">HS Code</div>
              <el-input v-if="isEditing" v-model="form.hs_code" placeholder="HS Code" />
              <div v-else class="text-sm text-gray-900">{{ form.hs_code || '-' }}</div>
            </div>
            <div class="col-span-2">
              <div class="text-xs text-gray-500 mb-1">Declared name EN</div>
              <el-input v-if="isEditing" v-model="form.custom_declared_name_en" placeholder="Declared name EN" />
              <div v-else class="text-sm text-gray-900">{{ form.custom_declared_name_en || '-' }}</div>
            </div>
            <div class="col-span-2">
              <div class="text-xs text-gray-500 mb-1">Declared name CN</div>
              <el-input v-if="isEditing" v-model="form.custom_declared_name_cn" placeholder="Declared name CN" />
              <div v-else class="text-sm text-gray-900">{{ form.custom_declared_name_cn || '-' }}</div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-between items-center w-full">
        <el-button class="!rounded-lg" @click="handleClose">Close</el-button>
        <div class="flex gap-2">
          <el-popconfirm v-if="productId" title="Are you sure to delete this product?" @confirm="handleDelete">
            <template #reference>
              <el-button type="danger" plain class="!rounded-lg">Delete</el-button>
            </template>
          </el-popconfirm>
          <template v-if="isEditing">
            <el-button class="!rounded-lg" @click="cancelEdit">Cancel</el-button>
            <el-button type="primary" class="!rounded-lg !bg-[#16215B] !border-[#16215B]" :loading="saving" @click="handleSave">Save</el-button>
          </template>
          <el-button v-else type="primary" class="!rounded-lg !bg-[#16215B] !border-[#16215B]" @click="isEditing = true">Edit</el-button>
        </div>
      </div>
    </template>
  </Drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Drawer } from '@/components/base/Drawer'
import { Picture } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getProductDetail, updateProduct, deleteProduct, createProduct, getSupplierList } from '@/api/inventory'

const props = defineProps<{
  visible: boolean
  productId?: string
  company?: string
}>()

const emit = defineEmits(['update:visible', 'close', 'save', 'delete'])

const activeTab = ref('Product Details')
const tabs = ['Product Details', 'Storage Details', 'Supplier Info', 'Declare info']
const isMetric = ref(true)
const isEditing = ref(false)
const saving = ref(false)
const supplierList = ref<{ name: string; supplier_name: string }[]>([])
const formBackup = ref<any>(null)

const form = ref<any>({
  item_code: '',
  item_name: '',
  item_name_cn: '',
  description: '',
  image: '',
  valuation_rate: 0,
  end_of_life: '',
  brand: '',
  company: '',
  modified: '',
  weight_per_unit: 0,
  length: 0,
  width: 0,
  height: 0,
  disabled: 0,
  wdt_quantity: 0,
  wdt_lock_quantity: 0,
  custom_valuation_rate2: null,
  custom_ex_china_declared_value: null,
  custom_declared_name_en: '',
  custom_declared_name_cn: '',
  hs_code: '',
  item_defaults: [] as { company: string; default_warehouse: string }[],
  supplier_items: [] as { supplier: string; supplier_part_no: string }[],
})

const productId = computed(() => props.productId)
const title = computed(() => '')

const barcodeDisplay = computed(() => {
  const barcodes = (form.value.barcodes as { barcode?: string }[]) || []
  return barcodes.map(r => r.barcode).filter(Boolean).join(', ') || ''
})

const loadSupplierList = async () => {
  const company = props.company || form.value.company || (form.value.item_defaults?.[0] as any)?.company
  try {
    const res = await getSupplierList(company).send()
    const msg = (res as any)?.message ?? res
    const d = msg?.success === true ? msg.data : (msg?.data ?? msg)
    if (Array.isArray(d)) {
      supplierList.value = d
    } else if (d && Array.isArray(d?.data)) {
      supplierList.value = d.data
    } else {
      supplierList.value = []
    }
  } catch {
    supplierList.value = []
  }
}

watch(() => props.visible, (v) => {
  if (v) {
    loadBrandList()
  }
}, { immediate: true })

watch([() => props.company, () => form.value.item_defaults, () => form.value.company], () => {
  if (props.visible && isEditing.value && activeTab.value === 'Supplier Info') loadSupplierList()
}, { deep: true })

watch([activeTab, isEditing], () => {
  if (props.visible && isEditing.value && activeTab.value === 'Supplier Info') loadSupplierList()
})

watch(() => props.productId, async (id) => {
  if (id) {
    try {
      const res = await getProductDetail(id, props.company).send()
      const msg = (res as any)?.message ?? res
      const d = msg?.success === true ? msg.data : (msg?.data ?? msg)
      if (d && typeof d === 'object' && !d.error) {
        form.value = {
          item_code: d.item_code ?? d.name ?? id,
          item_name: d.item_name ?? d.name ?? '',
          item_name_cn: d.item_name_cn ?? '',
          description: d.description ?? '',
          image: d.image ?? '',
          valuation_rate: Number(d.valuation_rate ?? 0),
          end_of_life: d.end_of_life || d.best_before || '',
          brand: d.brand ?? '',
          company: d.company ?? '',
          modified: d.modified ? String(d.modified).slice(0, 10) : '',
          weight_per_unit: Number(d.weight_per_unit ?? 0),
          length: Number(d.length ?? 0),
          width: Number(d.width ?? 0),
          height: Number(d.height ?? 0),
          disabled: d.disabled ? 1 : 0,
          wdt_quantity: d.wdt_quantity ?? 0,
          wdt_lock_quantity: d.wdt_lock_quantity ?? 0,
          custom_valuation_rate2: d.custom_valuation_rate2 != null ? Number(d.custom_valuation_rate2) : null,
          custom_ex_china_declared_value: d.custom_ex_china_declared_value != null ? Number(d.custom_ex_china_declared_value) : null,
          custom_declared_name_en: d.custom_declared_name_en ?? '',
          custom_declared_name_cn: d.custom_declared_name_cn ?? '',
          hs_code: d.hs_code ?? '',
          barcodes: Array.isArray(d.barcodes) ? [...d.barcodes] : [],
          item_defaults: Array.isArray(d.item_defaults)
            ? d.item_defaults.map((r: any) => ({ company: r.company || '', default_warehouse: r.default_warehouse || '' }))
            : [],
          supplier_items: Array.isArray(d.supplier_items)
            ? d.supplier_items.map((r: any) => ({ supplier: r.supplier || '', supplier_part_no: r.supplier_part_no || '' }))
            : [],
        }
      }
    } catch (err) {
      console.error(err)
    }
  } else {
    form.value = {
      item_code: '',
      item_name: '',
      item_name_cn: '',
      description: '',
      image: '',
      valuation_rate: 0,
      end_of_life: '',
      brand: '',
      company: '',
      modified: '',
      weight_per_unit: 0,
      length: 0,
      width: 0,
      height: 0,
      disabled: 0,
      wdt_quantity: 0,
      wdt_lock_quantity: 0,
      custom_valuation_rate2: null,
      custom_ex_china_declared_value: null,
      custom_declared_name_en: '',
      custom_declared_name_cn: '',
      hs_code: '',
      barcodes: [],
      item_defaults: [],
      supplier_items: [],
    }
  }
}, { immediate: true })

const cancelEdit = () => {
  isEditing.value = false
  if (formBackup.value) {
    form.value = JSON.parse(JSON.stringify(formBackup.value))
  }
}

const handleClose = () => {
  if (isEditing.value) cancelEdit()
  emit('close')
}

watch(isEditing, (v) => {
  if (v) {
    formBackup.value = JSON.parse(JSON.stringify(form.value))
  }
})

const handleSave = async () => {
  if (!props.productId) return
  saving.value = true
  try {
    const company = props.company || form.value.company
    const payload: Record<string, any> = {
      company,
      item_name: form.value.item_name,
      item_name_cn: form.value.item_name_cn || undefined,
      description: form.value.description,
      valuation_rate: form.value.valuation_rate != null ? Number(Number(form.value.valuation_rate).toFixed(2)) : undefined,
      weight_per_unit: form.value.weight_per_unit != null ? Number(Number(form.value.weight_per_unit).toFixed(2)) : undefined,
      length: form.value.length != null ? Number(Number(form.value.length).toFixed(2)) : undefined,
      width: form.value.width != null ? Number(Number(form.value.width).toFixed(2)) : undefined,
      height: form.value.height != null ? Number(Number(form.value.height).toFixed(2)) : undefined,
      image: form.value.image || undefined,
      end_of_life: form.value.end_of_life || undefined,
      custom_valuation_rate2: form.value.custom_valuation_rate2 != null ? Number(Number(form.value.custom_valuation_rate2).toFixed(2)) : undefined,
      custom_ex_china_declared_value: form.value.custom_ex_china_declared_value,
      custom_declared_name_en: form.value.custom_declared_name_en || undefined,
      custom_declared_name_cn: form.value.custom_declared_name_cn || undefined,
      hs_code: form.value.hs_code || undefined,
      item_defaults: form.value.item_defaults?.filter((r: any) => r.company) || [],
      supplier_items: form.value.supplier_items?.filter((r: any) => r.supplier) || [],
    }
    await updateProduct(props.productId, payload).send()
    ElMessage.success('Product updated successfully')
    isEditing.value = false
    emit('save')
  } catch (error: any) {
    ElMessage.error(error?.message || 'Update failed')
  } finally {
    saving.value = false
  }
}

const handleDelete = async () => {
  if (!props.productId) return
  try {
    await deleteProduct(props.productId).send()
    ElMessage.success('Product deleted')
    emit('delete')
    emit('close')
  } catch {
    ElMessage.error('Delete failed')
  }
}
</script>
