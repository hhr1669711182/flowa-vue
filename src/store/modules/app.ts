import { defineStore } from 'pinia'
import { store } from '../index'
import { setCssVar, humpToUnderline } from '@/utils'
import { colorIsDark, hexToRGB, lighten, mix } from '@/utils/color'
import { ElMessage, ComponentSize } from 'element-plus'
import { useCssVar } from '@vueuse/core'
import { computed, reactive, toRefs, unref } from 'vue'
import { useDark } from '@vueuse/core'

interface AppState {
  useMock: boolean
  breadcrumb: boolean
  breadcrumbIcon: boolean
  collapse: boolean
  uniqueOpened: boolean
  hamburger: boolean
  schemeConfig: boolean
  screenfull: boolean
  size: boolean
  locale: boolean
  tagsView: boolean
  tagsViewIcon: boolean
  logo: boolean
  fixedHeader: boolean
  greyMode: boolean
  dynamicRouter: boolean
  serverDynamicRouter: boolean
  pageLoading: boolean
  layout: LayoutType
  title: string
  isDark: boolean
  currentSize: ComponentSize
  sizeMap: ComponentSize[]
  mobile: boolean
  footer: boolean
  theme: ThemeTypes
  fixedMenu: boolean
}

export const useAppStore = defineStore(
  'app',
  () => {
    const state = reactive<AppState>({
      useMock: (import.meta as any).env?.VITE_USE_MOCK === 'true',
      sizeMap: ['default', 'large', 'small'],
      mobile: false,
      title: import.meta.env.VITE_APP_TITLE,
      pageLoading: false,
      breadcrumb: true,
      breadcrumbIcon: true,
      collapse: false,
      uniqueOpened: false,
      hamburger: true,
      schemeConfig: true,
      screenfull: true,
      size: true,
      locale: true,
      tagsView: true,
      tagsViewIcon: true,
      logo: true,
      fixedHeader: true,
      footer: false,
      greyMode: false,
      dynamicRouter: false,
      serverDynamicRouter: true,
      fixedMenu: false,
      layout: 'classic',
      isDark: true,
      currentSize: 'default',
      theme: {
        elColorPrimary: '#409eff',
        leftMenuBorderColor: 'inherit',
        leftMenuBgColor: '#001529',
        leftMenuBgLightColor: '#0f2438',
        leftMenuBgActiveColor: 'var(--el-color-primary)',
        leftMenuCollapseBgActiveColor: 'var(--el-color-primary)',
        leftMenuTextColor: '#bfcbd9',
        leftMenuTextActiveColor: '#fff',
        logoTitleTextColor: '#fff',
        logoBorderColor: 'inherit',
        topHeaderBgColor: '#fff',
        topHeaderTextColor: 'inherit',
        topHeaderHoverColor: '#f6f6f6',
        topToolBorderColor: '#eee'
      } as ThemeTypes
    })

    const getUseMock = computed(() => state.useMock)
    const getBreadcrumb = computed(() => state.breadcrumb)
    const getBreadcrumbIcon = computed(() => state.breadcrumbIcon)
    const getCollapse = computed(() => state.collapse)
    const getUniqueOpened = computed(() => state.uniqueOpened)
    const getHamburger = computed(() => state.hamburger)
    const getSchemeConfig = computed(() => state.schemeConfig)
    const getScreenfull = computed(() => state.screenfull)
    const getSize = computed(() => state.size)
    const getLocale = computed(() => state.locale)
    const getTagsView = computed(() => state.tagsView)
    const getTagsViewIcon = computed(() => state.tagsViewIcon)
    const getLogo = computed(() => state.logo)
    const getFixedHeader = computed(() => state.fixedHeader)
    const getGreyMode = computed(() => state.greyMode)
    const getDynamicRouter = computed(() => state.dynamicRouter)
    const getServerDynamicRouter = computed(() => state.serverDynamicRouter)
    const getFixedMenu = computed(() => state.fixedMenu)
    const getPageLoading = computed(() => state.pageLoading)
    const getLayout = computed(() => state.layout)
    const getTitle = computed(() => state.title)
    const getIsDark = computed(() => state.isDark)
    const getCurrentSize = computed(() => state.currentSize)
    const getSizeMap = computed(() => state.sizeMap)
    const getMobile = computed(() => state.mobile)
    const getTheme = computed(() => state.theme)
    const getFooter = computed(() => state.footer)

    const setBreadcrumb = (breadcrumb: boolean) => {
      state.breadcrumb = breadcrumb
    }
    const setBreadcrumbIcon = (breadcrumbIcon: boolean) => {
      state.breadcrumbIcon = breadcrumbIcon
    }
    const setCollapse = (collapse: boolean) => {
      state.collapse = collapse
    }
    const setUniqueOpened = (uniqueOpened: boolean) => {
      state.uniqueOpened = uniqueOpened
    }
    const setHamburger = (hamburger: boolean) => {
      state.hamburger = hamburger
    }
    const setScreenfull = (screenfull: boolean) => {
      state.screenfull = screenfull
    }
    const setSize = (size: boolean) => {
      state.size = size
    }
    const setLocale = (locale: boolean) => {
      state.locale = locale
    }
    const setTagsView = (tagsView: boolean) => {
      state.tagsView = tagsView
    }
    const setTagsViewIcon = (tagsViewIcon: boolean) => {
      state.tagsViewIcon = tagsViewIcon
    }
    const setLogo = (logo: boolean) => {
      state.logo = logo
    }
    const setFixedHeader = (fixedHeader: boolean) => {
      state.fixedHeader = fixedHeader
    }
    const setGreyMode = (greyMode: boolean) => {
      state.greyMode = greyMode
    }
    const setDynamicRouter = (dynamicRouter: boolean) => {
      state.dynamicRouter = dynamicRouter
    }
    const setServerDynamicRouter = (serverDynamicRouter: boolean) => {
      state.serverDynamicRouter = serverDynamicRouter
    }
    const setFixedMenu = (fixedMenu: boolean) => {
      state.fixedMenu = fixedMenu
    }
    const setPageLoading = (pageLoading: boolean) => {
      state.pageLoading = pageLoading
    }
    const setLayout = (layout: LayoutType) => {
      if (state.mobile && layout !== 'classic') {
        ElMessage.warning('移动端模式下不支持切换其它布局')
        return
      }
      state.layout = layout
    }
    const setTitle = (title: string) => {
      state.title = title
    }
    const setCurrentSize = (currentSize: ComponentSize) => {
      state.currentSize = currentSize
    }
    const setMobile = (mobile: boolean) => {
      state.mobile = mobile
    }
    const setTheme = (theme: ThemeTypes) => {
      state.theme = Object.assign(state.theme, theme)
    }
    const setFooter = (footer: boolean) => {
      state.footer = footer
    }

    const setPrimaryLight = () => {
      if (!state.theme.elColorPrimary) return
      const elColorPrimary = state.theme.elColorPrimary
      const color = state.isDark ? '#000000' : '#ffffff'
      const lightList = [3, 5, 7, 8, 9]
      lightList.forEach((v) => {
        setCssVar(`--el-color-primary-light-${v}`, mix(color, elColorPrimary, v / 10))
      })
      setCssVar('--el-color-primary-dark-2', mix(color, elColorPrimary, 0.2))
    }

    const setCssVarTheme = () => {
      for (const key in state.theme) {
        setCssVar(`--${humpToUnderline(key)}`, state.theme[key as keyof ThemeTypes])
      }
      setPrimaryLight()
    }

    const setIsDark = (isDark: boolean) => {
      state.isDark = isDark
      if (state.isDark) {
        document.documentElement.classList.add('dark')
        document.documentElement.classList.remove('light')
      } else {
        document.documentElement.classList.add('light')
        document.documentElement.classList.remove('dark')
      }
      setPrimaryLight()
    }

    const setMenuTheme = (color: string) => {
      const primaryColor = useCssVar('--el-color-primary', document.documentElement)
      const isDarkColor = colorIsDark(color)
      const theme: Recordable = {
        leftMenuBorderColor: isDarkColor ? 'inherit' : '#eee',
        leftMenuBgColor: color,
        leftMenuBgLightColor: isDarkColor ? lighten(color!, 6) : color,
        leftMenuBgActiveColor: isDarkColor
          ? 'var(--el-color-primary)'
          : hexToRGB(unref(primaryColor) as string, 0.1),
        leftMenuCollapseBgActiveColor: isDarkColor
          ? 'var(--el-color-primary)'
          : hexToRGB(unref(primaryColor) as string, 0.1),
        leftMenuTextColor: isDarkColor ? '#bfcbd9' : '#333',
        leftMenuTextActiveColor: isDarkColor ? '#fff' : 'var(--el-color-primary)',
        logoTitleTextColor: isDarkColor ? '#fff' : 'inherit',
        logoBorderColor: isDarkColor ? color : '#eee'
      }
      setTheme(theme)
      setCssVarTheme()
    }

    const setHeaderTheme = (color: string) => {
      const isDarkColor = colorIsDark(color)
      const textColor = isDarkColor ? '#fff' : 'inherit'
      const textHoverColor = isDarkColor ? lighten(color!, 6) : '#f6f6f6'
      const topToolBorderColor = isDarkColor ? color : '#eee'
      setCssVar('--top-header-bg-color', color)
      setCssVar('--top-header-text-color', textColor)
      setCssVar('--top-header-hover-color', textHoverColor)
      setTheme({
        topHeaderBgColor: color,
        topHeaderTextColor: textColor,
        topHeaderHoverColor: textHoverColor,
        topToolBorderColor
      })
      if (getLayout.value === 'top') {
        setMenuTheme(color)
      }
    }

    const initTheme = () => {
      const isDark = useDark({
        valueDark: 'dark',
        valueLight: 'light'
      })
      isDark.value = getIsDark.value
      const newTitle = import.meta.env.VITE_APP_TITLE
      if (newTitle !== getTitle.value) setTitle(newTitle)
    }

    return {
      ...toRefs(state),
      getUseMock,
      getBreadcrumb,
      getBreadcrumbIcon,
      getCollapse,
      getUniqueOpened,
      getHamburger,
      getSchemeConfig,
      getScreenfull,
      getSize,
      getLocale,
      getTagsView,
      getTagsViewIcon,
      getLogo,
      getFixedHeader,
      getGreyMode,
      getDynamicRouter,
      getServerDynamicRouter,
      getFixedMenu,
      getPageLoading,
      getLayout,
      getTitle,
      getIsDark,
      getCurrentSize,
      getSizeMap,
      getMobile,
      getTheme,
      getFooter,
      setBreadcrumb,
      setBreadcrumbIcon,
      setCollapse,
      setUniqueOpened,
      setHamburger,
      setScreenfull,
      setSize,
      setLocale,
      setTagsView,
      setTagsViewIcon,
      setLogo,
      setFixedHeader,
      setGreyMode,
      setDynamicRouter,
      setServerDynamicRouter,
      setFixedMenu,
      setPageLoading,
      setLayout,
      setTitle,
      setIsDark,
      setCurrentSize,
      setMobile,
      setTheme,
      setCssVarTheme,
      setFooter,
      setPrimaryLight,
      setMenuTheme,
      setHeaderTheme,
      initTheme
    }
  },
  {
    persist: true
  }
)

export const useAppStoreWithOut = () => {
  return useAppStore(store)
}
