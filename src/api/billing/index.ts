export * from './outbound';
export * from './notifications';
export * from './orders';
export * from './inbound';
export * from './storage';
export * from './services';

import { alovaInstance } from '@/services/alova';
import { site } from '@/api/useAddress';
import { unwrapFrappeMessage } from '@/utils/frappeResponse';

const OMS_API = site.UU_API_OMS_UI;

export const getCountryOptions = (params?: { keyword?: string; limit?: number }) => {
  return alovaInstance.Post<any>(`${OMS_API}.get_country_options`, {
    keyword: params?.keyword,
    limit: params?.limit ?? 200,
  }, {
    transform: (raw: any) => unwrapFrappeMessage(raw)
  });
};

export const triggerBillingDownload = (
  fileUrl: string,
  fileName?: string,
  fileContentBase64?: string | null
) => {
  const name = fileName || fileUrl?.split('/').pop()?.split('?')[0] || 'download.xlsx';
  
  if (fileContentBase64) {
    const bin = atob(fileContentBase64);
    const len = bin.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
    const blob = new Blob([bytes]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return;
  }
  
  if (!fileUrl) return;
  
  const base = (import.meta as any).env?.VITE_API_BASE_URL || window.location.origin;
  const href = fileUrl.startsWith('http') ? fileUrl : `${base.replace(/\/$/, '')}${fileUrl.startsWith('/') ? fileUrl : '/' + fileUrl}`;
  
  alovaInstance.Get(href, {
    responseType: 'blob',
    withCredentials: true,
    transform: (raw: any) => raw
  }).then((blob: any) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }).catch(() => {
    const a = document.createElement('a');
    a.href = href;
    a.download = name;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
};
