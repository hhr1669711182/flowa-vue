// import { ConfigGlobalTypes } from '@/components/ConfigGlobal'
import { inject } from 'vue'

type ConfigGlobalTypes = any

export const useConfigGlobal = () => {
  const configGlobal = inject('configGlobal', {}) as ConfigGlobalTypes

  return {
    configGlobal
  }
}
