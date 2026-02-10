<template>
  <div class="products">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold">Product List</h2>
      <el-button type="primary">Add Product</el-button>
    </div>
    
    <BaseSearch
      v-model="searchForm"
      :items="searchItems"
      @search="handleSearch"
      @reset="handleReset"
    />

    <BaseTable
      :data="tableData"
      :columns="columns"
      :loading="loading"
      :pagination="true"
      :total="total"
      v-model:page="page"
      v-model:limit="limit"
      @pagination-change="fetchData"
    >
      <template #operations>
        <el-button link type="primary" size="small">Edit</el-button>
        <el-button link type="danger" size="small">Delete</el-button>
      </template>
    </BaseTable>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import axios from 'axios'
import BaseTable from '../../components/common/BaseTable.vue'
import BaseSearch from '../../components/common/BaseSearch.vue'

// Search Configuration
const searchForm = reactive({
  name: '',
  category: ''
})

const searchItems: any[] = [
  { label: 'Product Name', prop: 'name', type: 'input', placeholder: 'Product Name' },
  { 
    label: 'Category', 
    prop: 'category', 
    type: 'select', 
    placeholder: 'Select Category',
    options: [
      { label: 'Electronics', value: 'Electronics' },
      { label: 'Clothing', value: 'Clothing' },
      { label: 'Home', value: 'Home' },
      { label: 'Books', value: 'Books' }
    ]
  }
]

// Table Configuration
const columns = [
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'name', label: 'Product Name', width: 250 },
  { prop: 'price', label: 'Price', width: 120 },
  { prop: 'stock', label: 'Stock', width: 120 },
  { prop: 'category', label: 'Category' },
  { label: 'Operations', slot: 'operations', width: 150, fixed: 'right' }
]

// Data Logic
const tableData = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const limit = ref(10)

const fetchData = async () => {
  loading.value = true
  try {
    const response = await axios.get('/api/products', {
      params: {
        page: page.value,
        limit: limit.value,
        ...searchForm
      }
    })
    tableData.value = response.data.data
    // Mock total count
    total.value = 200
  } catch (error) {
    console.error('Failed to fetch products:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  page.value = 1
  fetchData()
}

const handleReset = () => {
  searchForm.name = ''
  searchForm.category = ''
  handleSearch()
}

onMounted(() => {
  fetchData()
})
</script>
