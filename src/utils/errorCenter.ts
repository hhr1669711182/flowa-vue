/**
 * 报错中心：统一处理系统/接口错误，并支持国际化展示
 */
import { errorMessages, type ErrorLocale } from '@/locales/errors'

export type ErrorCode =
  | 'NETWORK_ERROR'
  | 'SERVER_NOT_AVAILABLE'
  | 'INVALID_RESPONSE'
  | 'REQUEST_TIMEOUT'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'LOGIN_FAILED'
  | 'INCORRECT_CREDENTIALS'
  | 'REQUEST_FAILED'
  | 'UNKNOWN_ERROR'

export interface NormalizedError {
  code: ErrorCode
  message?: string
  detail?: unknown
}

const LOCALE_KEY = 'flowa_locale'
const DEFAULT_LOCALE: ErrorLocale = 'zh-CN'

export function getCurrentErrorLocale(): ErrorLocale {
  try {
    const stored = localStorage.getItem(LOCALE_KEY)
    if (stored === 'en' || stored === 'zh-CN') return stored
  } catch (_) {}
  return DEFAULT_LOCALE
}

export function setErrorLocale(locale: ErrorLocale): void {
  try {
    localStorage.setItem(LOCALE_KEY, locale)
  } catch (_) {}
}

export function getErrorMessage(code: ErrorCode, locale?: ErrorLocale): string {
  const lang = locale ?? getCurrentErrorLocale()
  const map = errorMessages?.[lang] ?? errorMessages?.['zh-CN']
  if (!map || typeof map !== 'object') return String(code ?? 'UNKNOWN_ERROR')
  return (map[code] ?? map.UNKNOWN_ERROR ?? code) as string
}

export function normalizeError(err: unknown): NormalizedError {
  if (err && typeof err === 'object' && 'code' in err && typeof (err as any).code === 'string') {
    return {
      code: (err as any).code as ErrorCode,
      message: (err as any).message,
      detail: err,
    }
  }
  const msg = err instanceof Error ? err.message : String(err ?? '')
  if (msg.includes('fetch') || msg.includes('NetworkError') || msg.includes('Failed to fetch')) {
    return { code: 'NETWORK_ERROR', message: msg, detail: err }
  }
  if (msg.includes('json') || msg.includes('Unexpected end of JSON') || msg.includes('JSON')) {
    return { code: 'INVALID_RESPONSE', message: msg, detail: err }
  }
  if (msg.includes('timeout') || msg.includes('Timeout')) {
    return { code: 'REQUEST_TIMEOUT', message: msg, detail: err }
  }
  if (msg.includes('401') || msg.includes('Unauthorized')) {
    return { code: 'UNAUTHORIZED', message: msg, detail: err }
  }
  if (msg.includes('403') || msg.includes('Forbidden')) {
    return { code: 'FORBIDDEN', message: msg, detail: err }
  }
  if (msg.includes('Incomplete login') || msg.includes('password') || msg.includes('credential')) {
    return { code: 'INCORRECT_CREDENTIALS', message: msg, detail: err }
  }
  return { code: 'REQUEST_FAILED', message: msg, detail: err }
}

export function getDisplayMessage(err: unknown, locale?: ErrorLocale): string {
  try {
    const normalized = normalizeError(err)
    if (normalized?.code) return getErrorMessage(normalized.code, locale)
  } catch (_) {}
  return typeof err === 'string' ? err : (err instanceof Error ? err.message : 'Unknown error')
}

export function createAppError(code: ErrorCode, message?: string): Error & { code: ErrorCode } {
  const e = new Error(message ?? code) as Error & { code: ErrorCode }
  e.code = code
  return e
}
