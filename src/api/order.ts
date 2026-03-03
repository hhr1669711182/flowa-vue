import { alovaInstance } from '@/services/alova';

export const getOrders = (params: any) => {
  return alovaInstance.Get<any>('/api/orders', { params });
}

export const getOrderStats = () => {
  return alovaInstance.Get<any>('/api/orders/stats');
}
