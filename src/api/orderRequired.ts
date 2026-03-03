import { alovaInstance } from '@/services/alova'

export type RequiredOrderStage =
  | 'Review & Fix'
  | 'Warehouse Processing'
  | 'Labeling'
  | 'Export Processing'

export type RequiredOrderStatus = 'Awaiting Approval' | 'Need Attention' | 'Processing' | 'Blocked'

export type RequiredIssueType =
  | 'Address Error'
  | 'Info Missing'
  | 'Wrong Declaration'
  | 'Inventory Mismatch'
  | 'Payment Risk'

export type RequiredInventoryStatus = 'In Stock' | 'Reserved' | 'Out of Stock'

export interface RequiredOrderRecord {
  id: string
  orderId: string
  platformId: string
  stage: RequiredOrderStage
  status: RequiredOrderStatus
  statusNote: string
  issueType: RequiredIssueType
  issueSummary: string
  customerName: string
  customerRegion: string
  inventoryStatus: RequiredInventoryStatus
  createDate: string
  dueDate: string
  sku: string
  productName: string
  quantity: number
}

export interface RequiredOrderListParams {
  page?: number
  pageSize?: number
  keyword?: string
  quickRange?: 'last7' | 'last30' | 'thisMonth' | 'all'
  dateRange?: [string, string] | []
  stage?: RequiredOrderStage | ''
  status?: RequiredOrderStatus | ''
  inventory?: RequiredInventoryStatus | ''
  segmented?: 'awaiting' | 'process' | 'error'
}

export interface RequiredOrderListResponse {
  total: number
  list: RequiredOrderRecord[]
  segmented: {
    awaiting: number
    process: number
    error: number
  }
}

export const getRequiredOrderList = (params: RequiredOrderListParams) => {
  return alovaInstance.Get<RequiredOrderListResponse>('/api/orders/required', { params })
}

export const getRequiredOrderDetail = (id: string) => {
  return alovaInstance.Get<RequiredOrderRecord>('/api/orders/required/detail', {
    params: { id }
  })
}

export const submitRequiredReview = (payload: {
  id: string
  issueType: RequiredIssueType
  note: string
  dueDate: string
}) => {
  return alovaInstance.Post<{ success: boolean }>('/api/orders/required/review', payload)
}

export const updateRequiredOrderStatus = (payload: {
  id: string
  status: RequiredOrderStatus
}) => {
  return alovaInstance.Post<{ success: boolean }>('/api/orders/required/status', payload)
}

export const createRequiredSupportTicket = (payload: {
  id: string
  subject: string
  message: string
  priority: 'High' | 'Medium' | 'Low'
}) => {
  return alovaInstance.Post<{ success: boolean }>('/api/orders/required/ticket', payload)
}
