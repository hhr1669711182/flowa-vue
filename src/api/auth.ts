import { alovaInstance } from '@/services/alova'

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

export const login = (data: LoginPayload) => {
  return alovaInstance.Post<LoginResponse>('/api/auth/login', data)
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

