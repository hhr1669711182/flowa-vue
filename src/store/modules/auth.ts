import { defineStore } from 'pinia'
import { login as apiLogin, type LoginPayload } from '@/api/auth'
import {
  saveRememberCredentials,
  loadRememberCredentials,
  clearRememberCredentials,
} from '@/utils/storage'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: 'Owner' | 'Admin' | 'Member'
}

interface AuthState {
  token: string | null
  user: AuthUser | null
  remember: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: localStorage.getItem('token'),
    user: null,
    remember: false,
  }),
  getters: {
    isAuthed: (s) => !!s.token,
  },
  actions: {
    async login(payload: LoginPayload) {
      const res = await apiLogin(payload)
      if ('token' in res) {
        this.token = res.token
        this.user = res.user as AuthUser
        localStorage.setItem('token', res.token)
        if (payload.remember) {
          await saveRememberCredentials({ email: payload.email, password: payload.password })
          this.remember = true
        } else {
          await clearRememberCredentials()
          this.remember = false
        }
        return { ok: true }
      }
      return { ok: false, message: res.message || 'Login failed' }
    },
    async loadRemember() {
      const v = await loadRememberCredentials()
      if (v) {
        this.remember = true
      } else {
        this.remember = false
      }
      return v
    },
    async logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
    },
  },
})
