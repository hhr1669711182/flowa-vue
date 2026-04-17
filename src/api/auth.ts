import { alovaInstance } from '@/services/alova'
import { OMS_API, OMS_API_FETCH, withApiBase } from '@/api/omsApiBase'
import { parseFrappeErrorBody } from '@/utils/frappeError'

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

const useMock = (import.meta as any).env?.VITE_USE_MOCK === 'true'

export const login = async (data: LoginPayload): Promise<any> => {
  if (useMock) {
    return alovaInstance.Post<LoginResponse | { ok: false; message: string }>('/api/auth/login', {
      email: data.email,
      password: data.password,
    })
  }

  return alovaInstance.Post<any>('/api/method/login', {
    usr: data.email,
    pwd: data.password
  })
}

export const loginOutApi = (): Promise<IResponse> => {
  return alovaInstance.Get('/user/loginOut')
}

export const requestPasswordReset = (data: ResetPayload) => {
  return alovaInstance.Post<ResetResponse>('/api/auth/reset', data)
}

export const verifyEmailCode = (data: VerifyPayload) => {
  return alovaInstance.Post<VerifyResponse>('/api/auth/verify', data)
}

export const resendEmailCode = (data: ResetPayload) => {
  return alovaInstance.Post<ResetResponse>('/api/auth/resend', data)
}

export const registerAccount = (data: RegisterPayload) => {
  return alovaInstance.Post<RegisterResponse>('/api/auth/register', data)
}

export const getLoggedUser = () => {
  return alovaInstance.Get<{ message?: string }>('/api/method/frappe.auth.get_logged_user')
}

export const getCurrentUserInfo = () => {
  return alovaInstance.Get<{ message: CurrentUserInfo }>(`${OMS_API}.get_current_user_info`)
}

export const getFrappeCsrfTokenApi = () => {
  return alovaInstance.Get<{ message?: string }>(`${OMS_API_FETCH}.get_csrf_token`)
}

export const logout = async (): Promise<{ ok: true }> => {
  if (useMock) {
    localStorage.removeItem('token')
    return { ok: true }
  }
  
  await alovaInstance.Post<any>(withApiBase('/api/method/logout'))
  return { ok: true }
}

export const unifiedRegister = async (payload: { email: string; password: string; full_name: string }): Promise<any> => {
  return alovaInstance.Post<any>(`${OMS_API_FETCH}.unified_register`, payload)
}

