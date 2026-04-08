import { alovaInstance } from '@/services/alova'
import { OMS_API } from '@/api/omsApiBase'

export type BlockedOrderStage =
  | 'Manual Hold'
  | 'Compliance Check'
  | 'Address Verification'
  | 'Payment Hold'
  | 'Review and Fix'
  | 'Warehouse Processing'
  | 'Export Processing'
  | 'Return Processing'

export type BlockedOrderStatus =
  | 'Blocked'
  | 'Awaiting Review'
  | 'Escalated'
  | 'Resolved'
  | 'Unblocked'
  | 'Cancelled'
  | 'Archived'

export type BlockedHoldReason =
  | 'Address Error'
  | 'Payment Risk'
  | 'Inventory Hold'
  | 'Compliance Alert'
  | 'Manual Review'

export type BlockedInventoryStatus = 'In Stock' | 'Reserved' | 'Out of Stock'

export interface BlockedOrderRecord {
  id: string
  orderId: string
  platformId: string
  stage: BlockedOrderStage
  status: BlockedOrderStatus
  holdReason: BlockedHoldReason
  holdLevel: 'High' | 'Medium' | 'Low'
  holdNote: string
  customerName: string
  customerRegion: string
  inventoryStatus: BlockedInventoryStatus
  createDate: string
  blockedDate: string
  dueDate: string
  sku: string
  productName: string
  quantity: number
  holdDays: number
  title?: string
  code?: string
  deliveryStatus?: string
  carrier?: string
  method?: string
  itemQuantity?: string
  chargingWeight?: string
}

export interface BlockedOrderListParams {
  page?: number
  pageSize?: number
  keyword?: string
  quickRange?: 'last7' | 'last30' | 'thisMonth' | 'all'
  dateRange?: [string, string] | []
  status?: BlockedOrderStatus | ''
  reason?: BlockedHoldReason | ''
  stage?: BlockedOrderStage | ''
  inventory?: BlockedInventoryStatus | ''
  segmented?: 'all' | 'active' | 'resolved'
}

export interface BlockedOrderListResponse {
  total: number
  list: BlockedOrderRecord[]
  segmented: {
    all: number
    active: number
    resolved: number
  }
}

export const getBlockedOrderList = (params: BlockedOrderListParams & { company?: string }) => {
  return alovaInstance.Post<any>(`${OMS_API}.flowa_list_sales_orders`, {
    company: params.company,
    page: params.page ?? 1,
    page_size: params.pageSize ?? 20,
    order_no: params.keyword || undefined,
    menu_key: 'blocked',
    status: params.status || undefined,
  })
}

export const getBlockedOrderDetail = (id: string, company?: string) => {
  return alovaInstance.Post<any>(`${OMS_API}.get_sales_order_detail`, { name: id, company })
}

export const reactivateBlockedOrder = (payload: { id: string; note: string; company?: string }) => {
  return alovaInstance.Post<any>(`${OMS_API}.update_sales_order_fields`, {
    name: payload.id,
    remarks: payload.note,
    company: payload.company,
  })
}

export const updateBlockedOrderStatus = (payload: { id: string; status: BlockedOrderStatus; company?: string }) => {
  return alovaInstance.Post<any>(`${OMS_API}.update_sales_order_fields`, {
    name: payload.id,
    status: payload.status,
    company: payload.company,
  })
}

export const createBlockedSupportTicket = (payload: {
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
