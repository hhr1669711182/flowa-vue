import { alovaInstance } from '@/services/alova'
import { OMS_API } from '@/api/omsApiBase'

const TMS_TRACKING_API = '/api/method/upsystem.upsystem.api_tms_tracking'
const API_BASE = '/api/method/upsystem.upsystem.api'

export function getShopShipments(params: { page?: number; page_size?: number }) {
  return alovaInstance.Post<any>(`${TMS_TRACKING_API}.get_shop_shipments`, {
    page: params.page ?? 1,
    page_size: params.page_size ?? 20,
  })
}

export function batchTracking(trackingNumbers: string[]) {
  return alovaInstance.Post<any>(`${API_BASE}.batch_tracking`, {
    tracking_numbers: trackingNumbers,
  })
}

export function getTrackingBySalesOrders(params: { company: string; sales_orders: string[] }) {
  return alovaInstance.Post<any>(`${OMS_API}.get_tracking_by_sales_orders`, {
    company: params.company?.trim() || '',
    sales_orders: params.sales_orders || [],
  })
}

export function getPublicTrackingByNumber(trackingOrWaybill: string) {
  return alovaInstance.Post<any>(`${OMS_API}.get_public_tracking_by_number`, {
    tracking_or_waybill: String(trackingOrWaybill || '').trim(),
  })
}

