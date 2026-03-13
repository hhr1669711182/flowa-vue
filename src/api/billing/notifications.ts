import { alovaInstance } from '@/services/alova';

export interface BillingNotification {
  id: number;
  title: string;
  time: string;
  iconType: string;
  bg: string;
  unread: boolean;
}

export const getBillingNotifications = () => {
  return alovaInstance.Get<BillingNotification[]>('/api/billing/notifications');
}

export const markBillingNotificationAsRead = (id?: number) => {
  return alovaInstance.Post('/api/billing/notifications/read', { id });
}
