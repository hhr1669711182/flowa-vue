import { alovaInstance } from '@/services/alova';

export interface BillingRecentOrder {
  id: number;
  title: string;
  code: string;
  action: string;
  status: string;
  statusNote: string;
  image: string;
}

export const getBillingRecentOrders = () => {
  return alovaInstance.Get<BillingRecentOrder[]>('/api/billing/recent-orders');
}
