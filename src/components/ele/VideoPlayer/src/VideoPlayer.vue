<script setup lang="ts">
import Player from 'xgplayer'
import 'xgplayer/dist/index.min.css'
import { ref, unref, onMounted, watch, onBeforeUnmount, nextTick } from 'vue'

const props = defineProps({
  url: {
    type: String,
    default: '',
    required: true
  },
  poster: {
    type: String,
    default: ''
  }
})

const playerRef = ref<Player>()

const videoEl = ref<HTMLDivElement>()

const intiPlayer = () => {
  if (!unref(videoEl)) return
  playerRef.value = new Player({
    autoplay: false,
    ...props,
    el: unref(videoEl)
  })
}

onMounted(() => {
  intiPlayer()
})

watch(
  () => props,
  async (newProps) => {
    await nextTick()
    if (newProps) {
      unref(playerRef)?.setConfig(newProps)
    }
  },
  {
    deep: true
  }
)

onBeforeUnmount(() => {
  unref(playerRef)?.destroy()
})

defineExpose({
  playerExpose: () => unref(playerRef)
})
</script>

<template>
  <div ref="videoEl"></div>
</template>
