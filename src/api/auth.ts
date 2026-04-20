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

export const login = async (data: LoginPayload): Promise<any> => {
  if (store().useMock) {
    return alovaInstance.Post<LoginResponse | { ok: false; message: string }>('/api/auth/login', {
      email: data.email,
      password: data.password,
    })
  }

  return alovaInstance.Post<any>('login', {
    usr: data.email,
    pwd: data.password
  })
}

export const loginOutApi = (): Promise<IResponse> => {
  return alovaInstance.Get('/user/loginOut')
}

export const requestPasswordReset = (data: ResetPayload) => {
  const url = store().useMock ? '/api/auth/reset' : 'frappe.core.doctype.user.user.reset_password'
  return alovaInstance.Post<any>(url, data)
}

export const updatePassword = async (key: string, newPassword: string, logoutAllSessions = false): Promise<any> => {
  const url = store().useMock ? '/api/auth/update_password' : 'frappe.core.doctype.user.user.update_password'
  return alovaInstance.Post<any>(url, { key, newPassword, logoutAllSessions })
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
  return alovaInstance.Get<{ message?: string }>('/api/method/frappe.auth.get_logged_user')
}

export const getCurrentUserInfo = () => {
  return alovaInstance.Get<any>( site.UU_API_OMS_UI + '.get_current_user_info')
}

export const getFrappeCsrfTokenApi = () => {
  return alovaInstance.Get<{ message?: string }>(site.UU_API_OMS_UI + '.get_csrf_token')
}

export const logout = async (): Promise<{ ok: true }> => {
  if (store().useMock) {
    localStorage.removeItem('token')
    return { ok: true }
  }

  await alovaInstance.Post<any>('logout')
  localStorage.removeItem('token')
  return { ok: true }
}

export const unifiedRegister = async (payload: { email: string; password: string; full_name: string }): Promise<any> => {
  return alovaInstance.Post<any>(site.UU_API_OMS_UI + '.unified_register', payload)
}
