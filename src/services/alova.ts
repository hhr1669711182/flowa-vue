// import { isArray } from '@/utils/is';
import { createAlova } from 'alova';
import VueHook from 'alova/vue';
import adapterFetch from 'alova/fetch';
import { createAlovaMockAdapter } from '@alova/mock';
import router from '@/router';
import { ElMessage } from 'element-plus';

const useMock = (import.meta as any).env?.VITE_USE_MOCK === 'true';
const baseURL = (import.meta as any).env?.VITE_API_BASE_URL || '';

let requestAdapter: any;
if (useMock) {
  const mockFiles = import.meta.glob('./mock/*.ts', { eager: true });
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
  beforeRequest(method) {
    // Add auth token
    const token = localStorage.getItem('token');
    if (token) {
      method.config.headers['Authorization'] = `Bearer ${token}`;
    }
  },
  responded: {
    onSuccess: async (response) => {
      if (response instanceof Response) {
        const json = await response.json();
        if (response.status === 401) {
          ElMessage.error('Session expired, please login again');
          localStorage.removeItem('token');
          router.push('/login');
          throw new Error('Unauthorized');
        }

        if (response.status !== 200) {
          throw new Error(json.message || 'Request failed');
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
