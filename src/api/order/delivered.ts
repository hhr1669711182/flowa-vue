import { alovaInstance } from '@/services/alova'
import { site } from '@/api/useAddress'

const OMS_API = site.UU_API_OMS_UI

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
  chargingWeight?: number
  quantity?: number
  inventoryStatus?: string
  destination?: string
  etaText?: string
  arrivalAtText?: string
  items?: DeliveredOrderItem[]
  customerCountry?: string
  [key: string]: any
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

export const getDeliveredOrderList = (params: DeliveredOrderListParams & { company?: string }) => {
  return alovaInstance.Post<any>(`${OMS_API}.flowa_list_sales_orders`, {
    company: params.company,
    page: params.page ?? 1,
    page_size: params.pageSize ?? 20,
    order_no: params.keyword || undefined,
    menu_key: 'delivered',
    status: params.status || undefined,
  })
}

export const getDeliveredOrderDetail = (id: string, company?: string) => {
  return alovaInstance.Post<any>(`${OMS_API}.get_sales_order_detail`, { name: id, company })
}

export const updateDeliveredOrderNote = (payload: { id: string; note: string; company?: string }) => {
  return alovaInstance.Post<any>(`${OMS_API}.update_sales_order_fields`, {
    name: payload.id,
    remarks: payload.note,
    company: payload.company,
  })
}

export const updateDeliveredOrderStatus = (payload: {
  id: string
  status: DeliveredOrderStatus
  company?: string
}) => {
  return alovaInstance.Post<any>(`${OMS_API}.update_sales_order_fields`, {
    name: payload.id,
    status: payload.status,
    company: payload.company,
  })
}

export const createDeliveredSupportTicket = (payload: {
  id: string
  subject: string
  message: string
  priority: 'High' | 'Medium' | 'Low'
  company?: string
}) => {
  return alovaInstance.Post<any>(`${OMS_API}.create_sales_order_ticket`, {
    sales_order_name: payload.id,
    subject: payload.subject,
    message: payload.message,
    priority: payload.priority,
    company: payload.company,
  })
}
