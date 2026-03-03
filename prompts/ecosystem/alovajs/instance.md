# Vue 3 Prompt Corpus: AlovaJS - Instance Setup

## Context
Use this prompt when setting up a global `alova` instance for data fetching.

## Guidelines

### 1. Create Instance (`createAlova`)
- Configure `baseURL` from environment variables (`VITE_API_URL`).
- Set `statesHook` to `VueHook` for Vue 3 reactivity.
- Set `requestAdapter` (`GlobalFetch` or custom).
- Use global interceptors (`beforeRequest`, `responded`) for auth tokens and error handling.

### 2. Example
```ts
import { createAlova } from 'alova';
import GlobalFetch from 'alova/GlobalFetch';
import VueHook from 'alova/vue';

export const alovaInstance = createAlova({
  baseURL: import.meta.env.VITE_API_URL,
  statesHook: VueHook,
  requestAdapter: GlobalFetch(),
  timeout: 5000,
  beforeRequest(method) {
    method.config.headers.Authorization = `Bearer ${getToken()}`;
  },
  responded: {
    onSuccess: async (response, method) => {
      const data = await response.json();
      if (data.code !== 200) throw new Error(data.msg);
      return data.data;
    },
    onError: (err) => {
      console.error('Request failed:', err);
      throw err;
    }
  }
});
```
