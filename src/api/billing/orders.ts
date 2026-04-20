import { alovaInstance } from '@/services/alova';
import { site } from '@/api/useAddress';

const OMS_API = site.UU_API_OMS_UI;

export interface BillingRecentOrder {
  id: number | string;
  name?: string;
  title: string;
  sales_order?: string;
  code: string;
  order_time?: string;
  pack_time?: string;
  action: string;
  status: string;
  statusNote: string;
  shipping: string;
  tax: string;
  grandTotal: string;
  total_cost_usd?: number;
  image: string;
  destination_country?: string;
  tracking_no?: string;
  charge_weight?: number;
  deliveryStatus?: string;
  trackingNo?: string;
  carrier?: string;
  method?: string;
  itemQuantity?: string;
  chargingWeight?: string;
  pickingFirst?: string;
  pickingAdditional?: string;
  packagingUsed?: string;
  packagingCost?: string;
  shippingCost?: string;
  docFee?: string;
  taxVat?: string;
  taxSurcharge?: string;
}

/** 暂无独立接口，返回空列表。表格数据请使用 getOutboundBillingList */
export const getBillingRecentOrders = (params?: { page?: number; pageSize?: number }) => {
  return alovaInstance.Post<{
    total: number;
    list: BillingRecentOrder[];
    page: number;
    pageSize: number;
  }>(`${OMS_API}.get_billing_recent_orders`, params, {
    transform: () => ({ list: [], total: 0, page: 1, pageSize: 10 })
  });
}

export const getBillingOrderDetail = (id: string | number) => {
  return alovaInstance.Post<BillingRecentOrder | null>(`${OMS_API}.get_billing_order_detail`, { id }, {
    transform: () => null
  });
}
