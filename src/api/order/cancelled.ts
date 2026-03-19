import { alovaInstance } from '@/services/alova'

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

export const getCancelledOrderList = (params: CancelledOrderListParams) => {
  return alovaInstance.Get<CancelledOrderListResponse>('/api/orders/cancelled', { params })
}

export const getCancelledOrderDetail = (id: string) => {
  return alovaInstance.Get<CancelledOrderRecord>('/api/orders/cancelled/detail', {
    params: { id }
  })
}

export const reactivateCancelledOrder = (payload: {
  id: string
  note: string
  targetStage: CancelledOrderStage
}) => {
  return alovaInstance.Post<{ success: boolean }>('/api/orders/cancelled/reactivate', payload)
}

export const updateCancelledOrderStatus = (payload: {
  id: string
  status: CancelledOrderStatus
}) => {
  return alovaInstance.Post<{ success: boolean }>('/api/orders/cancelled/status', payload)
}

export const createCancelledSupportTicket = (payload: {
  id: string
  subject: string
  message: string
  priority: 'High' | 'Medium' | 'Low'
}) => {
  return alovaInstance.Post<{ success: boolean }>('/api/orders/cancelled/ticket', payload)
}

