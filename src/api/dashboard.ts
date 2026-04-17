import { alovaInstance } from '@/services/alova';
import { OMS_API_FETCH } from '@/api/omsApiBase'

export const getDashboardStats = () => {
  return alovaInstance.Get<any>('/api/dashboard/stats');
}

export const getDashboardNotifications = () => {
  return alovaInstance.Get<any[]>('/api/dashboard/notifications');
}

export const getDashboardRecentOrders = () => {
  return alovaInstance.Get<any[]>('/api/dashboard/recent-orders');
}

export const markNotificationAsRead = (id?: number) => {
  return alovaInstance.Post('/api/dashboard/notifications/read', { id });
}

export const createRechargePayment = async (params: { amount: number; company?: string }): Promise<any> => {
  const useMock = (import.meta as any).env?.VITE_USE_MOCK === 'true'
  if (useMock) {
    return { success: true, data: { payment_url: 'https://example.com/pay' } }
  }
  return alovaInstance.Post<any>(`${OMS_API_FETCH}.create_recharge`, params)
}
