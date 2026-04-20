import { alovaInstance } from '@/services/alova'
import { site } from './useAddress';

const TMS_TRACKING_API = site.UU_API_OMS + '.api_tms_tracking'
const API_BASE_BATCH_TRACKING = site.UU_API_OMS + '.api.batch_tracking'

export function getShopShipments(params: { page?: number; page_size?: number }) {
  return alovaInstance.Post<any>(`${TMS_TRACKING_API}.get_shop_shipments`, {
    page: params.page ?? 1,
    page_size: params.page_size ?? 20,
  })
}

export function batchTracking(trackingNumbers: string[]) {
  return alovaInstance.Post<any>(API_BASE_BATCH_TRACKING, {
    tracking_numbers: trackingNumbers,
  })
}

export function getTrackingBySalesOrders(params: { company: string; sales_orders: string[] }) {
  return alovaInstance.Post<any>(`${site.UU_API_OMS}.get_tracking_by_sales_orders`, {
    company: params.company?.trim() || '',
    sales_orders: params.sales_orders || [],
  })
}

export function getPublicTrackingByNumber(trackingOrWaybill: string) {
  return alovaInstance.Post<any>(`${site.UU_API_OMS}.get_public_tracking_by_number`, {
    tracking_or_waybill: String(trackingOrWaybill || '').trim(),
  })
}
