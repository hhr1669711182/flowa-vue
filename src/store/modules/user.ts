import { defineStore } from 'pinia'
import { store } from '../index'
import { UserLoginType, UserType } from '@/api/types'
import { ElMessageBox } from 'element-plus'
import { useI18n } from '@/hooks/web/useI18n'
import { loginOutApi } from '@/api/auth'
import { getProfileAvatar, uploadProfileAvatar } from '@/api/settings'
import { useTagsViewStore } from './tagsView'
import router from '@/router'
import defaultAvatarImg from '@/views/system/icons/avator.png'

interface UserState {
  userInfo?: UserType
  tokenKey: string
  token: string
  roleRouters?: string[] | AppCustomRouteRecordRaw[]
  rememberMe: boolean
  loginInfo?: UserLoginType
  avatarImg?: any
}

export const useUserStore = defineStore('user', {
  state: (): UserState => {
    return {
      userInfo: undefined,
      tokenKey: 'sso_token',
      token: localStorage.getItem('token') || '',
      roleRouters: undefined,
      rememberMe: false,
      loginInfo: undefined,
      avatarImg: defaultAvatarImg
    }
  },
  getters: {
    getTokenKey(): string {
      return this.tokenKey
    },
    getToken(): string {
      return this.token
    },
    getUserInfo(): UserType | undefined {
      return this.userInfo
    },
    getRoleRouters(): string[] | AppCustomRouteRecordRaw[] | undefined {
      return this.roleRouters
    },
    getRememberMe(): boolean {
      return this.rememberMe
    },
    getLoginInfo(): UserLoginType | undefined {
      return this.loginInfo
    },
    getAvatarImg(): string {
      return this.avatarImg || defaultAvatarImg
    }
  },
  actions: {
    setTokenKey(tokenKey: string) {
      this.tokenKey = tokenKey
    },
    setToken(token: string) {
      this.token = token
    },
    setUserInfo(userInfo?: UserType) {
      this.userInfo = userInfo
    },
    setRoleRouters(roleRouters: string[] | AppCustomRouteRecordRaw[]) {
      this.roleRouters = roleRouters
    },
    logoutConfirm() {
      const { t } = useI18n()
      ElMessageBox.confirm(t('common.loginOutMessage'), t('common.reminder'), {
        confirmButtonText: t('common.ok'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      })
        .then(async () => {
          const res = await loginOutApi().catch(() => {})
          if (res) {
            this.reset()
          }
        })
        .catch(() => {})
    },
    reset() {
      const tagsViewStore = useTagsViewStore()
      tagsViewStore.delAllViews()
      this.setToken('')
      localStorage.removeItem('token')
      this.setUserInfo(undefined)
      this.setRoleRouters([])
      this.setAvatarImg(defaultAvatarImg)
      router.replace('/login')
    },
    logout() {
      this.reset()
    },
    setRememberMe(rememberMe: boolean) {
      this.rememberMe = rememberMe
    },
    setLoginInfo(loginInfo: UserLoginType | undefined) {
      this.loginInfo = loginInfo
    },
    setAvatarImg(avatarImg: any) {
      this.avatarImg = avatarImg || defaultAvatarImg
    },
    async fetchAvatarImg() {
      const res = await getProfileAvatar()
      if (res.avatarImg) {
        this.setAvatarImg(res.avatarImg)
      }
      return this.getAvatarImg
    },
    async uploadAvatarImg(payload: { avatarImg: string; fileName: string }) {
      const res = await uploadProfileAvatar(payload)
      this.setAvatarImg(res.avatarImg)
      return this.getAvatarImg
    }
  },
  persist: true
})

export const useUserStoreWithOut = () => {
  return useUserStore(store)
}
