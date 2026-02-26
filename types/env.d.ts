/// <reference types="vite/client" />
/// <reference types="vite-plugin-svg-icons/client" />

declare module 'virtual:svg-icons-register' {}

declare module '*.vue' {
  import { DefineComponent } from 'vue'

  const component: DefineComponent<{}, {}, any>
  export default component
}

declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}
