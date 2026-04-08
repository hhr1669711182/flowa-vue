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
  return Promise.resolve([] as BillingNotification[]);
}

export const markBillingNotificationAsRead = (_id?: number) => {
  return Promise.resolve();
}
