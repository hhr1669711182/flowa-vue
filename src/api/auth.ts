import { alovaInstance } from '@/services/alova'
import { OMS_API, OMS_API_FETCH, withApiBase } from '@/api/omsApiBase'
import { parseFrappeErrorBody } from '@/utils/frappeError'

export interface LoginPayload {
  email: string
  password: string
  remember?: boolean
}

export interface LoginResponse {
  message?: string
  full_name?: string
  home_page?: string
}

export interface ResetPayload {
  email: string
}

export interface ResetResponse {
  message?: string
}

export interface VerifyPayload {
  email: string
  code: string
}

export interface VerifyResponse {
  ok: boolean
  message?: string
}

export interface RegisterPayload {
  fullName: string
  company: string
  department?: string
  role?: string
  email: string
  phone: string
  password: string
}

export interface RegisterResponse {
  message?: string
  email?: string
}

export interface CurrentUserInfo {
  user_id: string
  full_name: string
  avatar?: string
  company: string
  companies?: string[]
  roles?: string[]
}

const useMock = (import.meta as any).env?.VITE_USE_MOCK === 'true'

/** 登录：mock 时走 /api/auth/login；否则 POST /api/method/login */
export const login = async (data: LoginPayload): Promise<LoginResponse & { token?: string; user?: any }> => {
  if (useMock) {
    const res = await alovaInstance.Post<any>('/api/auth/login', {
      email: data.email,
      password: data.password
    })
    return res
  }

  const { createAppError } = await import('@/utils/errorCenter')
  const { ensureFrappeCsrfToken, getFrappeCsrfToken } = await import('@/services/alova')
  await ensureFrappeCsrfToken()
  const params: Record<string, string> = { usr: data.email, pwd: data.password }
  const csrf = getFrappeCsrfToken()
  if (csrf) params.csrf_token = csrf
  const body = new URLSearchParams(params).toString()
  const headers: Record<string, string> = { 'Content-Type': 'application/x-www-form-urlencoded' }
  if (csrf) headers['X-Frappe-CSRF-Token'] = csrf
  let res: Response
  try {
    res = await fetch('/api/method/login', {
      method: 'POST',
      headers,
      body,
      credentials: 'include'
    })
  } catch (e) {
    throw createAppError('NETWORK_ERROR', e instanceof Error ? e.message : String(e))
  }
  let json: any
  try {
    const text = await res.text()
    if (!text || text.trim() === '') throw new SyntaxError('Empty response')
    json = JSON.parse(text)
  } catch (_) {
    throw createAppError('INVALID_RESPONSE', 'Server returned invalid or empty response. Please ensure the backend is running.')
  }
  if (!res.ok) {
    const msg = parseFrappeErrorBody(json)
    if (res.status === 401 || /login|password|credential|incomplete|csrf/i.test(msg)) {
      throw createAppError('INCORRECT_CREDENTIALS', msg)
    }
    throw createAppError('REQUEST_FAILED', msg)
  }
  return json
}

export const requestPasswordReset = async (data: ResetPayload): Promise<ResetResponse> => {
  const { ensureFrappeCsrfToken, getFrappeCsrfToken } = await import('@/services/alova')
  await ensureFrappeCsrfToken()
  const csrf = getFrappeCsrfToken()
  const headers: Record<string, string> = { 'Content-Type': 'application/x-www-form-urlencoded' }
  if (csrf) headers['X-Frappe-CSRF-Token'] = csrf
  const body = new URLSearchParams({ user: data.email }).toString()
  const res = await fetch('/api/method/frappe.core.doctype.user.user.reset_password', {
    method: 'POST',
    headers,
    body,
    credentials: 'include'
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || json.exc_type || 'Request failed')
  return json
}

export const updatePassword = async (key: string, newPassword: string, logoutAllSessions = false): Promise<{ message?: string }> => {
  const { ensureFrappeCsrfToken, getFrappeCsrfToken } = await import('@/services/alova')
  await ensureFrappeCsrfToken()
  const csrf = getFrappeCsrfToken()
  const headers: Record<string, string> = { 'Content-Type': 'application/x-www-form-urlencoded' }
  if (csrf) headers['X-Frappe-CSRF-Token'] = csrf
  const params: Record<string, string> = { key, new_password: newPassword }
  if (logoutAllSessions) params.logout_all_sessions = '1'
  const body = new URLSearchParams(params).toString()
  const res = await fetch(withApiBase('/api/method/frappe.core.doctype.user.user.update_password'), {
    method: 'POST',
    headers,
    body,
    credentials: 'include'
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || json.exc_type || 'Request failed')
  return json
}

export const verifyEmailCode = (data: VerifyPayload) => {
  return alovaInstance.Post<VerifyResponse>('/api/auth/verify', data)
}

export const resendEmailCode = (data: ResetPayload) => {
  return alovaInstance.Post<ResetResponse>('/api/auth/resend', data)
}

export const registerAccount = async (data: RegisterPayload): Promise<RegisterResponse> => {
  const { createAppError } = await import('@/utils/errorCenter')
  const { ensureFrappeCsrfToken, getFrappeCsrfToken } = await import('@/services/alova')
  await ensureFrappeCsrfToken()
  const csrf = getFrappeCsrfToken()
  const headers: Record<string, string> = { 'Content-Type': 'application/x-www-form-urlencoded' }
  if (csrf) headers['X-Frappe-CSRF-Token'] = csrf
  const body = new URLSearchParams({
    email: data.email,
    password: data.password,
    full_name: data.fullName
  }).toString()
  let res: Response
  try {
    res = await fetch(`${OMS_API_FETCH}.unified_register`, {
      method: 'POST',
      headers,
      body,
      credentials: 'include'
    })
  } catch (e) {
    throw createAppError('NETWORK_ERROR', e instanceof Error ? e.message : String(e))
  }
  let json: any
  try {
    const text = await res.text()
    if (!text || text.trim() === '') throw new SyntaxError('Empty response')
    json = JSON.parse(text)
  } catch (_) {
    throw createAppError('INVALID_RESPONSE', 'Server returned invalid or empty response.')
  }
  if (!res.ok) {
    const msg = parseFrappeErrorBody(json)
    throw createAppError('REQUEST_FAILED', msg)
  }
  return json
}

export const getLoggedUser = () => {
  return alovaInstance.Get<{ message?: string }>('/api/method/frappe.auth.get_logged_user')
}

export const getCurrentUserInfo = () => {
  return alovaInstance.Get<{ message: CurrentUserInfo }>(`${OMS_API}.get_current_user_info`)
}

/** 兼容 flowa-vue-main：loginOutApi 使用 logout */
export const loginOutApi = async (): Promise<any> => {
  const { ensureFrappeCsrfToken, getFrappeCsrfToken } = await import('@/services/alova')
  await ensureFrappeCsrfToken()
  const csrf = getFrappeCsrfToken()
  const headers: Record<string, string> = {}
  if (csrf) headers['X-Frappe-CSRF-Token'] = csrf
  await fetch(withApiBase('/api/method/logout'), {
    method: 'POST',
    headers,
    credentials: 'include'
  })
  return { ok: true }
}

export const logout = loginOutApi