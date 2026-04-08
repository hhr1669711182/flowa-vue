/**
 * 系统错误文案（报错中心国际化）
 * 键与 errorCenter 中的 ErrorCode 一致，便于扩展 vue-i18n 后接入 t('error.xxx')
 */
export const errorMessages: Record<string, Record<string, string>> = {
  'zh-CN': {
    NETWORK_ERROR: '网络异常，请检查网络连接后重试。',
    SERVER_NOT_AVAILABLE: '服务暂不可用，请确认后端服务已启动或稍后重试。',
    INVALID_RESPONSE: '服务器返回异常，请稍后重试。',
    REQUEST_TIMEOUT: '请求超时，请稍后重试。',
    UNAUTHORIZED: '登录已过期，请重新登录。',
    FORBIDDEN: '没有操作权限。',
    LOGIN_FAILED: '登录失败，请检查邮箱和密码。',
    INCORRECT_CREDENTIALS: '邮箱或密码错误，请重试。',
    REQUEST_FAILED: '请求失败，请稍后重试。',
    UNKNOWN_ERROR: '发生未知错误，请稍后重试或联系支持。',
  },
  en: {
    NETWORK_ERROR: 'Network error. Please check your connection and try again.',
    SERVER_NOT_AVAILABLE: 'Service unavailable. Please ensure the server is running or try again later.',
    INVALID_RESPONSE: 'Invalid response from server. Please try again later.',
    REQUEST_TIMEOUT: 'Request timeout. Please try again later.',
    UNAUTHORIZED: 'Session expired. Please sign in again.',
    FORBIDDEN: 'You do not have permission.',
    LOGIN_FAILED: 'Login failed. Please check your email and password.',
    INCORRECT_CREDENTIALS: 'Incorrect email or password. Please try again.',
    REQUEST_FAILED: 'Request failed. Please try again later.',
    UNKNOWN_ERROR: 'An unexpected error occurred. Please try again or contact support.',
  },
}

export type ErrorLocale = 'zh-CN' | 'en'
