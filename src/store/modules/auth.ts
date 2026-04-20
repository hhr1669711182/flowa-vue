import { defineStore } from 'pinia'
import { login as apiLogin, getCurrentUserInfo, logout as apiLogout, getFrappeCsrfTokenApi, type LoginPayload } from '@/api/auth'
import {
  saveRememberCredentials,
  loadRememberCredentials,
  clearRememberCredentials,
} from '@/utils/storage'

const OMS_CACHED_COMPANY = 'oms_cached_company'
const OMS_CACHED_COMPANIES = 'oms_cached_companies'

function loadCachedCompany(): string | null {
  try {
    const s = localStorage.getItem(OMS_CACHED_COMPANY)
    return s?.trim() ? s.trim() : null
  } catch {
    return null
  }
}

function loadCachedCompanies(): string[] {
  try {
    const s = localStorage.getItem(OMS_CACHED_COMPANIES)
    if (!s) return []
    const arr = JSON.parse(s)
    return Array.isArray(arr) ? arr.filter((c: unknown) => typeof c === 'string' && c.trim()) : []
  } catch {
    return []
  }
}

function saveCachedCompany(company: string | null) {
  try {
    if (company?.trim()) localStorage.setItem(OMS_CACHED_COMPANY, company.trim())
    else localStorage.removeItem(OMS_CACHED_COMPANY)
  } catch {
    return
  }
}

function saveCachedCompanies(companies: string[]) {
  try {
    if (companies?.length) localStorage.setItem(OMS_CACHED_COMPANIES, JSON.stringify(companies))
    else localStorage.removeItem(OMS_CACHED_COMPANIES)
  } catch {
    return
  }
}

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
  company: string | null
  companies: string[]
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => {
    const token = localStorage.getItem('token')
    const company = token ? loadCachedCompany() : null
    const companies = token ? loadCachedCompanies() : []
    return {
      token,
      user: null,
      remember: false,
      company,
      companies,
    }
  },
  getters: {
    isAuthed: (s) => !!s.token,
    currentCompany: (s) => s.company ?? (s.token ? loadCachedCompany() : null),
  },
  actions: {
    async login(payload: LoginPayload) {
      // 1. 先获取 CSRF Token 并缓存到 localStorage，后续所有非 Auth 请求会从缓存取
      try {
        const csrfRes = await getFrappeCsrfTokenApi()
        const csrf = typeof csrfRes?.message === 'string' ? csrfRes.message : (csrfRes as unknown as string)
        if (csrf) localStorage.setItem('frappe_csrf_token', csrf.trim())
      } catch (e) {
        return console.warn('Failed to fetch CSRF token before login', e)
      }

      // 2. 发起登录请求
      const res = await apiLogin(payload)
      if (res && res.message === 'Logged In') {
        if (payload.remember) {
          await saveRememberCredentials({ email: payload.email, password: payload.password })
          this.remember = true
        } else {
          await clearRememberCredentials()
          this.remember = false
        }
        await this.fetchUserInfo(payload.email)
        return { ok: true }
      }
    },
    async ensureCompany() {
      if (this.currentCompany) return this.currentCompany;
      await this.fetchUserInfo();
      return this.currentCompany;
    },
    async fetchUserInfo(email?: string) {
      try {
        const infoRes = await getCurrentUserInfo().send()
        const msg = (infoRes as any)?.message ?? infoRes
        if (msg && typeof msg === 'object') {
          if ((msg as any).company !== undefined) {
            this.company = (msg as any).company || null
            saveCachedCompany(this.company)
          }
          if (Array.isArray((msg as any).companies)) {
            this.companies = (msg as any).companies
            saveCachedCompanies(this.companies)
          }
          if ((msg as any).user_id !== undefined || (msg as any).full_name) {
            this.user = {
              id: (msg as any).user_id ?? this.user?.id ?? '',
              name: (msg as any).full_name ?? this.user?.name ?? email ?? '',
              email: this.user?.email ?? email ?? '',
              role: this.user?.role ?? 'Member',
            }
          }
        }
      } catch {
        return
      }
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
      try {
        await apiLogout()
      } catch {
        return
      } finally {
        this.token = null
        this.user = null
        this.company = null
        this.companies = []
        localStorage.removeItem('token')
        localStorage.removeItem('frappe_csrf_token')
        saveCachedCompany(null)
        saveCachedCompanies([])
      }
    },
  },
})
