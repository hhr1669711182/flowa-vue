import { alovaInstance } from '@/services/alova';

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
