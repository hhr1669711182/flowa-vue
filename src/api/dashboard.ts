/*
 * @Author: huanghuanrong
 * @Date: 2026-04-08 11:36:55
 * @LastEditTime: 2026-04-17 19:03:39
 * @LastEditors: huanghuanrong
 * @Description: 文件描述
 * @FilePath: \flowa-vue\src\api\dashboard.ts
 */
import { alovaInstance } from '@/services/alova';
import { useAppStoreWithOut } from '@/store/modules/app'

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
  if (useAppStoreWithOut().useMock) {
    return { success: true, data: { payment_url: 'https://example.com/pay' } }
  }
  return alovaInstance.Post<any>('create_recharge', params)
}
