import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueDevTools from 'vite-plugin-vue-devtools'
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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const useMock = env.VITE_USE_MOCK === 'true'
  const proxyTarget = env.VITE_PROXY_TARGET || 'http://localhost:8888'

  return {
    base: './',
    plugins: [
      Components({
        dts: 'types/components.d.ts',
        resolvers: [
          ElementPlusResolver(),
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
      VueDevTools(),
      vue(),
      VueJsx(),
      UnoCSS(),
      viteMockServe({
        mockPath: 'src/mock',
        enable: useMock,
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
    server: {
      proxy: useMock
        ? undefined
        : {
          '/api': {
            target: proxyTarget,
            changeOrigin: true,
            secure: false,
            rewrite: (path) => path.replace(/^\/api/, ''),
          },
        },
    },
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        'vue-types',
        'element-plus/es/locale/lang/zh-cn',
        'element-plus/es/locale/lang/en',
        '@iconify/iconify',
        '@vueuse/core',
        'axios',
        'qs',
        'echarts',
        'echarts-wordcloud',
        'qrcode',
        '@wangeditor/editor',
        '@wangeditor/editor-for-vue',
        'vue-json-pretty',
        '@zxcvbn-ts/core',
        'dayjs',
        'cropperjs'
      ]
    }
  }
})
