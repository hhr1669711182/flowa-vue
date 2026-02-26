import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueJsx from '@vitejs/plugin-vue-jsx'
import UnoCSS from 'unocss/vite'
import { viteMockServe } from 'vite-plugin-mock'
// @ts-ignore
import PurgeIcons from 'vite-plugin-purge-icons'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import { resolve } from 'path'
import Icons from "unplugin-icons/vite"
import IconsResolver from "unplugin-icons/resolver"
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from "unplugin-vue-components/resolvers"


const root = process.cwd()
function pathResolve(dir: string) {
  return resolve(root, '.', dir)
}

export default defineConfig({
  base: './',
  plugins: [
    Components({
      dts: 'types/components.d.ts',
      resolvers: [
        ElementPlusResolver(),
        // IconsResolver({
        //   prefix: 'i',
        //   enabledCollections: ['icon-park'],
        // }),
        IconsResolver({
          enabledCollections: ['ep'] // 按需加载
        }),
      ]
    }),
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'types/auto-imports.d.ts',
      vueTemplate: true,
    }),
    vue(),
    VueJsx(),
    UnoCSS(),
    viteMockServe({
      mockPath: 'src/mock',
      enable: true,
    }),
    Icons({
      compiler: 'vue3',
      autoInstall: true,
    }),
    createSvgIconsPlugin({
      iconDirs: [pathResolve('src/assets/svgs')],
      symbolId: 'icon-[dir]-[name]',
      svgoOptions: true
    }),
    PurgeIcons(),
  ],
  css: {
    preprocessorOptions: {
      less: {
        additionalData: '@import "./src/styles/variables.module.less";',
        javascriptEnabled: true
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
