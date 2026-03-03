import { alovaInstance } from '@/services/alova';

export const getInventoryProducts = (params: any) => {
  return alovaInstance.Get<any>('/api/inventory/products', { params });
}

export const getInventoryStats = () => {
  return alovaInstance.Get<any>('/api/inventory/stats');
}
