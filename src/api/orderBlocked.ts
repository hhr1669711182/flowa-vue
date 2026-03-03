import { alovaInstance } from '@/services/alova'

export type BlockedOrderStage =
  | 'Manual Hold'
  | 'Compliance Check'
  | 'Address Verification'
  | 'Payment Hold'

export type BlockedOrderStatus = 'Blocked' | 'Awaiting Review' | 'Escalated' | 'Resolved'

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

export const getBlockedOrderList = (params: BlockedOrderListParams) => {
  return alovaInstance.Get<BlockedOrderListResponse>('/api/orders/blocked', { params })
}

export const getBlockedOrderDetail = (id: string) => {
  return alovaInstance.Get<BlockedOrderRecord>('/api/orders/blocked/detail', {
    params: { id }
  })
}

export const reactivateBlockedOrder = (payload: { id: string; note: string }) => {
  return alovaInstance.Post<{ success: boolean }>('/api/orders/blocked/reactivate', payload)
}

export const updateBlockedOrderStatus = (payload: {
  id: string
  status: BlockedOrderStatus
}) => {
  return alovaInstance.Post<{ success: boolean }>('/api/orders/blocked/status', payload)
}

export const createBlockedSupportTicket = (payload: {
  id: string
  subject: string
  message: string
  priority: 'High' | 'Medium' | 'Low'
}) => {
  return alovaInstance.Post<{ success: boolean }>('/api/orders/blocked/ticket', payload)
}
