import { alovaInstance } from '@/services/alova'
import { useAppStoreWithOut as store } from '@/store/modules/app'
import { site } from '@/api/useAddress'

export interface LoginPayload {
  email: string
  password: string
  remember?: boolean
}

export interface LoginResponse {
  token: string
  user: {
    id: string
    name: string
    email: string
    role: 'Owner' | 'Admin' | 'Member'
  }
}

export interface ResetPayload {
  email: string
}

export interface ResetResponse {
  ok: boolean
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
  ok: boolean
  token?: string
}

export interface CurrentUserInfo {
  user_id: string
  full_name: string
  avatar?: string
  company: string
  companies?: string[]
  roles?: string[]
}

export const login = (data: LoginPayload) => {
  if (store().useMock) {
    return alovaInstance.Post<any>('/api/auth/login', data, {
      transform: () => ({ ok: true, message: 'Mock logged in' })
    })
  }

  const payload: any = {
    usr: data.email,
    pwd: data.password,
  }

  return alovaInstance.Post<any>('login', payload)
}

export const loginOutApi = (): Promise<IResponse> => {
  return alovaInstance.Get('/user/loginOut')
}

export const requestPasswordReset = (data: ResetPayload) => {
  const url = store().useMock ? '/api/auth/reset' : 'frappe.core.doctype.user.user.reset_password'
  return alovaInstance.Post<any>(url, data)
}

export const updatePassword = (key: string, newPassword: string, logoutAllSessions = false) => {
  return alovaInstance.Post<any>('frappe.core.doctype.user.user.update_password', {
    new_password: newPassword,
    logout_all_sessions: logoutAllSessions ? 1 : 0,
    key
  })
}

export const verifyEmailCode = (data: VerifyPayload) => {
  return alovaInstance.Post<VerifyResponse>('/api/auth/verify', data)
}

export const resendEmailCode = (data: ResetPayload) => {
  return alovaInstance.Post<ResetResponse>('/api/auth/resend', data)
}

export const registerAccount = (data: RegisterPayload) => {
  const url = store().useMock ? '/api/auth/register' : site.UU_API_OMS_UI + '.unified_register'
  return alovaInstance.Post<any>(url, {
    email: data.email,
    password: data.password,
    full_name: data.fullName
  })
}

export const getLoggedUser = () => {
  return alovaInstance.Get<{ message?: string }>('frappe.auth.get_logged_user')
}

export const getCurrentUserInfo = () => {
  return alovaInstance.Get<any>(site.UU_API_OMS_UI + '.get_current_user_info')
}

export const getFrappeCsrfTokenApi = () => {
  return alovaInstance.Get<{ message?: string }>(site.UU_API_OMS_UI + '.get_csrf_token')
}

export const logout = () => {
  if (store().useMock) {
    return alovaInstance.Post<{ ok: true }>('/api/auth/logout', {}, {
      transform: () => ({ ok: true })
    })
  }

  return alovaInstance.Post<any>('logout', {})
}

export const unifiedRegister = (payload: { email: string; password: string; full_name: string }) => {
  return alovaInstance.Post<any>(site.UU_API_OMS_UI + '.unified_register', payload)
}
