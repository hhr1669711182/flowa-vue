// import { isArray } from '@/utils/is';
import { createAlova } from 'alova';
import VueHook from 'alova/vue';
import adapterFetch from 'alova/fetch';
import { createAlovaMockAdapter } from '@alova/mock';
import router from '@/router';
import { ElMessage } from 'element-plus';


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

const mockAdapter = createAlovaMockAdapter(mockGroups, {
  delay: 500,
  httpAdapter: adapterFetch(),
  enable: true
});

export const alovaInstance = createAlova({
  baseURL: '', // import.meta.env.VITE_API_BASE_URL || '',
  statesHook: VueHook,
  requestAdapter: mockAdapter, // Use mock adapter
  beforeRequest(method) {
    // Add auth token
    const token = localStorage.getItem('token');
    if (token) {
      method.config.headers['Authorization'] = `Bearer ${token}`;
    }
  },
  responded: {
    onSuccess: async (response) => {
      // If using mock, response is already the data returned by mock function
      // If using real API, response is a Response object
      if (response instanceof Response) {
        const json = await response.json();
        console.log("🚀 ~ json:", json)
        
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
        // return isArray(json) ? json : json.data;
      }
      
      return response;
    },
    onError: (err) => {
      console.error('Request error:', err);
      // Handle network errors or other exceptions
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
