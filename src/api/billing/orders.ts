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
export const getBillingRecentOrders = (_params?: { page?: number; pageSize?: number }) => {
  return Promise.resolve({ list: [] as BillingRecentOrder[], total: 0, page: 1, pageSize: 10 });
}

export const getBillingOrderDetail = (_id: string | number) => {
  return Promise.resolve(null as BillingRecentOrder | null);
}
