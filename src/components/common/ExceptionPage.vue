<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { propTypes } from '@/utils/propTypes'

defineOptions({
  name: 'ExceptionPage'
})

const props = defineProps({
  title: propTypes.string.def(''),
  type: propTypes.string.validate((v: string) => ['403', '404', '500', 'empty', 'construction'].includes(v)).def('construction'),
  description: propTypes.string,
  btnText: propTypes.string.def('Go Back Home'),
  showButton: propTypes.bool.def(true)
})

const emit = defineEmits(['action'])
const router = useRouter()

const descriptionText = computed(() => {
  if (props.description) return props.description
  switch (props.type) {
    case '403': return 'Permission Denied'
    case '404': return 'Page Not Found'
    case '500': return 'Server Error'
    case 'empty': return 'No Data'
    case 'construction': return 'Page Under Construction'
    default: return 'No Data'
  }
})

const handleAction = () => {
  emit('action')
  router.push('/')
}
</script>

<template>
  <div class="p-6">
    <h2 v-if="title" class="text-2xl font-bold text-gray-800 mb-4">{{ title }}</h2>
    <div class="bg-white rounded-xl shadow-card p-8 flex flex-col items-center justify-center min-h-[400px]">
      <el-empty :description="descriptionText" />
      <el-button v-if="showButton" type="primary" class="mt-4" @click="handleAction">
        {{ btnText }}
      </el-button>
    </div>
  </div>
</template>
