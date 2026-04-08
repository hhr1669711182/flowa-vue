import { alovaInstance } from '@/services/alova'
import { OMS_API } from '@/api/omsApiBase'

export type CancelledOrderStage =
  | 'Review and Fix'
  | 'Warehouse Processing'
  | 'Export Processing'
  | 'Return Processing'

export type CancelledOrderStatus =
  | 'Cancelled'
  | 'Pending Reactivation'
  | 'Reactivated'
  | 'Archived'

export type CancelledReason =
  | 'Customer Request'
  | 'Payment Failed'
  | 'Address Error'
  | 'Inventory Shortage'
  | 'Compliance Block'

export type CancelledInventoryStatus = 'In Stock' | 'Reserved' | 'Out of Stock'

export interface CancelledOrderRecord {
  id: string
  orderId: string
  platformId: string
  stage: CancelledOrderStage
  status: CancelledOrderStatus
  reason: CancelledReason
  customerName: string
  customerRegion: string
  inventoryStatus: CancelledInventoryStatus
  createDate: string
  cancelledDate: string
  dueDate: string
  sku: string
  productName: string
  quantity: number
  cancelNote: string
  reopenable: boolean
  title?: string
  code?: string
  deliveryStatus?: string
  carrier?: string
  method?: string
  itemQuantity?: string
  chargingWeight?: string
}

export interface CancelledOrderListParams {
  page?: number
  pageSize?: number
  keyword?: string
  quickRange?: 'last7' | 'last30' | 'thisMonth' | 'all'
  dateRange?: [string, string] | []
  stage?: CancelledOrderStage | ''
  status?: CancelledOrderStatus | ''
  inventory?: CancelledInventoryStatus | ''
  segmented?: 'reviewFix' | 'warehouse' | 'export' | 'return'
}

export interface CancelledOrderListResponse {
  total: number
  list: CancelledOrderRecord[]
  segmented: {
    reviewFix: number
    warehouse: number
    export: number
    return: number
  }
}

export const getCancelledOrderList = (params: CancelledOrderListParams & { company?: string }) => {
  return alovaInstance.Post<any>(`${OMS_API}.flowa_list_sales_orders`, {
    company: params.company,
    page: params.page ?? 1,
    page_size: params.pageSize ?? 20,
    order_no: params.keyword || undefined,
    menu_key: 'cancelled',
    status: params.status || undefined,
  })
}

export const getCancelledOrderDetail = (id: string, company?: string) => {
  return alovaInstance.Post<any>(`${OMS_API}.get_sales_order_detail`, { name: id, company })
}

export const reactivateCancelledOrder = (payload: {
  id: string
  note: string
  targetStage: CancelledOrderStage
  company?: string
}) => {
  return alovaInstance.Post<any>(`${OMS_API}.update_sales_order_fields`, {
    name: payload.id,
    remarks: payload.note,
    company: payload.company,
  })
}

export const updateCancelledOrderStatus = (payload: {
  id: string
  status: CancelledOrderStatus
  company?: string
}) => {
  return alovaInstance.Post<any>(`${OMS_API}.update_sales_order_fields`, {
    name: payload.id,
    status: payload.status,
    company: payload.company,
  })
}

export const createCancelledSupportTicket = (payload: {
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
