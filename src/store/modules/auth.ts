import { defineStore } from 'pinia'
import { login as apiLogin, getCurrentUserInfo, logout as apiLogout, type LoginPayload } from '@/api/auth'
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
  } catch (_) {}
}

function saveCachedCompanies(companies: string[]) {
  try {
    if (companies?.length) localStorage.setItem(OMS_CACHED_COMPANIES, JSON.stringify(companies))
    else localStorage.removeItem(OMS_CACHED_COMPANIES)
  } catch (_) {}
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

/** Frappe 登录成功后使用会话标记（鉴权依赖 Cookie） */
const FRAPPE_SESSION = 'frappe-session'

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
    /** 展示用姓名：若后端返回 Administrator/Admin User 或为空，则用邮箱 @ 前部分首字母大写 */
    displayName: (s): string => {
      const name = s.user?.name?.trim()
      if (name && name !== 'Administrator' && name !== 'Admin User') return name
      const email = s.user?.email?.trim()
      if (email) {
        const part = email.split('@')[0]?.trim()
        if (part) return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
      }
      return name || email || 'Admin User'
    },
  },
  actions: {
    async login(payload: LoginPayload) {
      const res = await apiLogin(payload)
      if ('token' in res && res.token) {
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
      // Frappe 登录成功：无 token，鉴权依赖 Cookie；设置会话标记并拉取用户信息
      if (res && !('ok' in res && res.ok === false)) {
        this.token = FRAPPE_SESSION
        localStorage.setItem('token', FRAPPE_SESSION)
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
      return { ok: false, message: (res as any)?.message || 'Login failed' }
    },
    async fetchUserInfo(email?: string) {
      try {
        const infoRes = await getCurrentUserInfo().send()
        const msg = (infoRes as any)?.message ?? infoRes
        if (msg && typeof msg === 'object') {
          if (msg.company !== undefined) {
            this.company = msg.company || null
            saveCachedCompany(this.company)
          }
          if (Array.isArray(msg.companies)) {
            this.companies = msg.companies
            saveCachedCompanies(this.companies)
          }
          if (msg.user_id !== undefined || msg.full_name) {
            this.user = {
              id: (msg as any).user_id ?? this.user?.id ?? '',
              name: (msg as any).full_name ?? this.user?.name ?? email ?? '',
              email: this.user?.email ?? email ?? '',
              role: this.user?.role ?? 'Member'
            }
          }
        }
      } catch (_) {}
    },
    /** 刷新后若内存无 company 则从 localStorage 恢复，避免接口不带 company */
    hydrateCompanyFromCache() {
      if (!this.token) return
      if (this.company?.trim()) return
      const c = loadCachedCompany()
      if (c) {
        this.company = c
        const list = loadCachedCompanies()
        this.companies = list?.length ? list : [c]
      }
    },
    async ensureCompany(): Promise<string> {
      if (!this.token) return ''
      this.hydrateCompanyFromCache()
      const fromCache = (this.company ?? loadCachedCompany() ?? '').trim()
      if (fromCache) return fromCache
      await this.fetchUserInfo()
      return (this.currentCompany ?? this.company ?? '').trim() || ''
    },
    /** 从 get_home_stats 等回填 company 时调用，写入内存并缓存 */
    setCompanyFromStats(company: string) {
      if (!company?.trim()) return
      const c = company.trim()
      this.company = c
      if (!this.companies?.length) this.companies = [c]
      saveCachedCompany(c)
      saveCachedCompanies(this.companies)
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
      } catch (_) {
        /* 忽略网络错误，仍清空本地 */
      }
      this.token = null
      this.user = null
      this.company = null
      this.companies = []
      localStorage.removeItem('token')
      saveCachedCompany(null)
      saveCachedCompanies([])
    },
  },
})
