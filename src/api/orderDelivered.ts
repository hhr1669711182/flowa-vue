import { alovaInstance } from '@/services/alova'

export type DeliveredStage =
  | 'Final Review'
  | 'Last Mile'
  | 'Delivered'
  | 'Returned Handling'

export type DeliveredStatus =
  | 'Delivered'
  | 'Partially Delivered'
  | 'Returned'
  | 'Delivery Failed'

export type DeliveredInventoryStatus = 'In Stock' | 'Reserved' | 'Out of Stock'

export interface DeliveredOrderRecord {
  id: string
  orderId: string
  platformId: string
  stage: DeliveredStage
  status: DeliveredStatus
  customerName: string
  customerRegion: string
  inventoryStatus: DeliveredInventoryStatus
  createDate: string
  deliveredDate: string
  dueDate: string
  sku: string
  productName: string
  quantity: number
  carrier: string
  trackingNo: string
  proofStatus: 'Signed' | 'No Signature'
  note: string
}

export interface DeliveredOrderListParams {
  page?: number
  pageSize?: number
  keyword?: string
  quickRange?: 'last7' | 'last30' | 'thisMonth' | 'all'
  dateRange?: [string, string] | []
  stage?: DeliveredStage | ''
  status?: DeliveredStatus | ''
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
  status: DeliveredStatus
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
