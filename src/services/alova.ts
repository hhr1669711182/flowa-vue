// import { isArray } from '@/utils/is';
import { createAlova } from 'alova';
import VueHook from 'alova/vue';
import adapterFetch from 'alova/fetch';
import { createAlovaMockAdapter } from '@alova/mock';
import router from '@/router';
import { ElMessage } from 'element-plus';
import { parseFrappeErrorBody } from '@/utils/frappeError';

const useMock = (import.meta as any).env?.VITE_USE_MOCK === 'true';
const baseURL = (import.meta as any).env?.VITE_API_BASE_URL || '';
const linkURL = '/api/method/upsystem.upsystem.api_oms_ui';

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
  baseURL: baseURL + linkURL,
  statesHook: VueHook,
  requestAdapter,
  async beforeRequest(method) {
    (method.config as any).credentials = 'include';
    
    const isAuthReq = method.url.includes('/login') || method.url.includes('unified_register')
    
    if (!isAuthReq) {
      const token = localStorage.getItem('token');
      if (token) {
        method.config.headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const csrf = localStorage.getItem('frappe_csrf_token');
    if (csrf) {
      method.config.headers['X-Frappe-CSRF-Token'] = csrf;
    }

    // Auto-convert specific Frappe requests to application/x-www-form-urlencoded
    const needsUrlEncoded = method.url.includes('/api/method/login') || 
                            method.url.includes('unified_register') || 
                            method.url.includes('create_recharge');
                            
    if (needsUrlEncoded && method.data && typeof method.data === 'object' && !(method.data instanceof FormData) && !(method.data instanceof URLSearchParams)) {
      method.config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      const urlParams = new URLSearchParams();
      for (const key in method.data) {
        const val = (method.data as any)[key];
        if (val !== undefined && val !== null) {
          urlParams.append(key, String(val));
        }
      }
      method.data = urlParams.toString();
    }
  },
  responded: {
    onSuccess: async (response) => {
      if (response instanceof Response) {
        let json: any;
        try {
          const text = await response.text();
          if (!text || text.trim() === '') throw new SyntaxError('Empty response');
          json = JSON.parse(text);
        } catch {
          throw new Error('Server returned invalid or empty response.');
        }
        if (response.status === 401) {
          ElMessage.error('Session expired, please login again');
          localStorage.removeItem('token');
          router.push('/login');
          throw new Error('Unauthorized');
        }

        if (response.status !== 200) {
          throw new Error(parseFrappeErrorBody(json));
        }
        return json;
      }
      return response;
    },
    onError: (err) => {
      console.error('Request error:', err);
      const status = err.status || (err.response && err.response.status);
      if (status === 401) {
        ElMessage.error('Session expired, please login again');
        localStorage.removeItem('token');
        router.push('/login');
      } else {
        ElMessage.error(err.message || 'Network Error');
      }
      throw err;
    }
  }
});
