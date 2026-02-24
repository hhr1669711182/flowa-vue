<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold text-gray-800 mb-4">{{ title }}</h2>
    <div class="bg-white rounded-xl shadow-card p-8 flex flex-col items-center justify-center min-h-[400px]">
      <el-empty description="Page Under Construction" />
      <el-button type="primary" class="mt-4">Go Back Home</el-button>
    </div>
    
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { useRoute } from "vue-router"
import webPrintPdf from 'web-print-pdf';


// 简单打印

await webPrintPdf.printHtml({

    content: '<h1>Hello World</h1>',

    pdfOptions: { paperFormat: 'A4' },

    printOptions: { copies: 1 }

});

const route = useRoute()
const title = computed(() => route.meta.title || "Page")
</script>
