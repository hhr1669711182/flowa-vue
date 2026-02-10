/*
 * @Author: huanghuanrong
 * @Date: 2026-02-10 11:39:46
 * @LastEditTime: 2026-02-10 18:42:36
 * @LastEditors: huanghuanrong
 * @Description: 文件描述
 * @FilePath: \flowa1\vite.config.ts
 */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import { viteMockServe } from 'vite-plugin-mock'
import { resolve } from 'path'
// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    vue(),
    UnoCSS(),
    viteMockServe({
      mockPath: 'src/mock',
      enable: true,
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
