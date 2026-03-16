import { alovaInstance } from '@/services/alova';

export interface BillingRecentOrder {
  id: number;
  title: string;
  code: string;
  action: string;
  status: string;
  statusNote: string;
  shipping: string;
  tax: string;
  grandTotal: string;
  image: string;
  
  // Detail fields
  deliveryStatus?: string;
  trackingNo?: string;
  carrier?: string;
  method?: string;
  itemQuantity?: string;
  chargingWeight?: string;
  
  // Cost breakdown
  pickingFirst?: string;
  pickingAdditional?: string;
  packagingUsed?: string;
  packagingCost?: string;
  shippingCost?: string;
  docFee?: string;
  taxVat?: string;
  taxSurcharge?: string;
}

export const getBillingRecentOrders = (params?: { page: number; pageSize: number }) => {
  return alovaInstance.Get<{
    total: number;
    list: BillingRecentOrder[];
    page: number;
    pageSize: number;
  }>('/api/billing/recent-orders', { params });
}

export const getBillingOrderDetail = (id: string | number) => {
  return alovaInstance.Get<BillingRecentOrder>(`/api/billing/recent-orders/${id}`);
}
