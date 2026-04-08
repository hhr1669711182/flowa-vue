// import { isArray } from '@/utils/is';
import { createAlova } from 'alova';
import VueHook from 'alova/vue';
import adapterFetch from 'alova/fetch';
import { createAlovaMockAdapter } from '@alova/mock';
import router from '@/router';
import { ElMessage } from 'element-plus';
import { parseFrappeErrorBody } from '@/utils/frappeError';

const useMock = (import.meta as any).env?.VITE_USE_MOCK === 'true';
const isDev = (import.meta as any).env?.DEV === true;
const envBase = (import.meta as any).env?.VITE_API_BASE_URL || '';
const baseURL = envBase ? envBase : (isDev ? '' : '');

/** Frappe CSRF token 缓存，用于所有请求头 X-Frappe-CSRF-Token */
let frappeCsrfToken: string | null = null;
export async function ensureFrappeCsrfToken(): Promise<void> {
  if (frappeCsrfToken) return;
  try {
    const { OMS_API_FETCH } = await import('@/api/omsApiBase');
    const url = `${OMS_API_FETCH}.get_csrf_token`;
    if (!url || url === '.get_csrf_token') return;
    const r = await fetch(url, { credentials: 'include' });
    const text = await r.text();
    if (r.ok && text) {
      try {
        const j = JSON.parse(text) as { message?: string };
        const token = j?.message ?? text.trim();
        frappeCsrfToken = typeof token === 'string' ? token.trim() || null : null;
      } catch {
        frappeCsrfToken = text.trim() || null;
      }
    }
  } catch (_) {}
}
export function clearFrappeCsrfToken(): void {
  frappeCsrfToken = null;
}
export function getFrappeCsrfToken(): string | null {
  return frappeCsrfToken;
}

let requestAdapter: any;
if (useMock) {
  const mockFiles = import.meta.glob('./mock/**/*.ts', { eager: true });
  const mockGroups: any[] = [];
  Object.values(mockFiles).forEach((module: any) => {
    if (module.default) {
      mockGroups.push(module.default);
    }
    Object.keys(module).forEach(key => {
      if (key !== 'default') {
        mockGroups.push(module[key]);
      }
    });
  });
  requestAdapter = createAlovaMockAdapter(mockGroups, {
    delay: 500,
    httpAdapter: adapterFetch(),
    enable: true
  });
} else {
  requestAdapter = adapterFetch();
}

export const alovaInstance = createAlova({
  baseURL,
  statesHook: VueHook,
  requestAdapter,
  cacheLogger: false,
  async beforeRequest(method) {
    (method.config as any).credentials = 'include';
    const token = localStorage.getItem('token');
    if (token) {
      method.config.headers['Authorization'] = `Bearer ${token}`;
    }
    await ensureFrappeCsrfToken();
    const csrf = typeof frappeCsrfToken === 'string' ? frappeCsrfToken.trim() : '';
    if (csrf) {
      method.config.headers['X-Frappe-CSRF-Token'] = csrf;
    }
  },
  responded: {
    onSuccess: async (response) => {
      if (response instanceof Response) {
        const { createAppError, getDisplayMessage } = await import('@/utils/errorCenter');
        let json: any;
        try {
          const text = await response.text();
          if (!text || text.trim() === '') throw new SyntaxError('Empty response');
          json = JSON.parse(text);
        } catch (_) {
          throw createAppError('INVALID_RESPONSE', 'Server returned invalid or empty response.');
        }
        if (response.status === 401) {
          ElMessage.error(getDisplayMessage({ code: 'UNAUTHORIZED' }));
          localStorage.removeItem('token');
          router.push('/login');
          throw createAppError('UNAUTHORIZED');
        }
        if (response.status !== 200) {
          const serverMsg = parseFrappeErrorBody(json);
          throw createAppError('REQUEST_FAILED', serverMsg);
        }
        return json;
      }
      return response;
    },
    onError: async (err) => {
      const { getDisplayMessage } = await import('@/utils/errorCenter');
      const status = err?.status ?? err?.response?.status;
      const msg = err?.message;
      if (status === 401) {
        ElMessage.error(msg || getDisplayMessage({ code: 'UNAUTHORIZED' }));
        localStorage.removeItem('token');
        router.push('/login');
      } else {
        ElMessage.error(msg || getDisplayMessage(err));
      }
      throw err;
    }
  }
});
