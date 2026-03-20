import { alovaInstance } from '@/services/alova'

export type DeliveredOrderStage =
  | 'Review & Fix'
  | 'Warehouse'
  | 'Export'
  | 'Local Delivery'
  | 'Redelivery'
  | 'Delivered'

export type DeliveredOrderStatus =
  | 'Delivered'
  | 'Partially Delivered'
  | 'Returned'
  | 'Delivery Failed'

export interface DeliveredOrderItem {
  id: string
  name: string
  sku: string
  details: string
  quantity: number
  price: string
  warehouse: string
  image?: string
}

export interface DeliveredOrderRecord {
  id: string
  orderId: string
  platformId: string
  stage: DeliveredOrderStage
  status: DeliveredOrderStatus
  customerName: string
  customerRegion: string
  createDate: string
  arrivalDate: string
  title?: string
  code?: string
  deliveryStatus?: string
  carrier?: string
  method?: string
  trackingNo?: string
  itemQuantity?: string
  chargingWeight?: string
  destination?: string
  etaText?: string
  arrivalAtText?: string
  items?: DeliveredOrderItem[]
}

export interface DeliveredOrderListParams {
  page?: number
  pageSize?: number
  keyword?: string
  quickRange?: 'last7' | 'last30' | 'thisMonth' | 'all'
  dateRange?: [string, string] | []
  stage?: DeliveredOrderStage | ''
  status?: DeliveredOrderStatus | ''
  segmented?: 'all' | 'success' | 'issue'
}

export interface DeliveredOrderListResponse {
  total: number
  list: DeliveredOrderRecord[]
  segmented: {
    all: number
    success: number
    issue: number
  }
}

export const getDeliveredOrderList = (params: DeliveredOrderListParams) => {
  return alovaInstance.Get<DeliveredOrderListResponse>('/api/orders/delivered', { params })
}

export const getDeliveredOrderDetail = (id: string) => {
  return alovaInstance.Get<DeliveredOrderRecord>('/api/orders/delivered/detail', {
    params: { id }
  })
}

export const updateDeliveredOrderNote = (payload: { id: string; note: string }) => {
  return alovaInstance.Post<{ success: boolean }>('/api/orders/delivered/note', payload)
}

export const updateDeliveredOrderStatus = (payload: {
  id: string
  status: DeliveredOrderStatus
}) => {
  return alovaInstance.Post<{ success: boolean }>('/api/orders/delivered/status', payload)
}

export const createDeliveredSupportTicket = (payload: {
  id: string
  subject: string
  message: string
  priority: 'High' | 'Medium' | 'Low'
}) => {
  return alovaInstance.Post<{ success: boolean }>('/api/orders/delivered/ticket', payload)
}
