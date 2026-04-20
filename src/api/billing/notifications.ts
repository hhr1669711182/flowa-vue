import { alovaInstance } from '@/services/alova';
import { site } from '@/api/useAddress';

const OMS_API = site.UU_API_OMS_UI;

export interface BillingNotification {
  id: number;
  title: string;
  time: string;
  iconType: string;
  bg: string;
  unread: boolean;
}

/** 暂无后端接口，返回空数组避免 404 */
export const getBillingNotifications = () => {
  return alovaInstance.Post<BillingNotification[]>(`${OMS_API}.get_billing_notifications`, {}, {
    transform: () => []
  });
}

export const markBillingNotificationAsRead = (id?: number) => {
  return alovaInstance.Post<void>(`${OMS_API}.mark_billing_notification_read`, { id }, {
    transform: () => {}
  });
}
