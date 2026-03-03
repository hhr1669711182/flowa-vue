import { alovaInstance } from '@/services/alova';

export const getOrders = (params: any) => {
  return alovaInstance.Get<any>('/api/orders', { params });
}

export const getOrderStats = () => {
  return alovaInstance.Get<any>('/api/orders/stats');
}

export type InProgressStage =
  | 'Review & Fix'
  | 'Warehouse Processing'
  | 'Labeling'
  | 'Export Processing'

export type InProgressStatus =
  | 'Awaiting Approval'
  | 'Need Attention'
  | 'Processing'
  | 'Blocked'

export type InventoryStatus = 'In Stock' | 'Low Stock' | 'Out of Stock'

export interface InProgressOrderRecord {
  id: string
  orderId: string
  platformId: string
  stage: InProgressStage
  status: InProgressStatus
  statusNote: string
  customerName: string
  customerRegion: string
  inventoryStatus: InventoryStatus
  createDate: string
  dueDate: string
  sku: string
  productName: string
  quantity: number
  issueSummary: string
}

export interface InProgressOrderListResponse {
  total: number
  list: InProgressOrderRecord[]
}

export interface InProgressOrderListParams {
  page?: number
  pageSize?: number
  keyword?: string
  quickRange?: 'last7' | 'last30' | 'thisMonth' | 'all'
  dateRange?: [string, string] | []
  stage?: InProgressStage | ''
  status?: InProgressStatus | ''
}

export const getInProgressOrderList = (params: InProgressOrderListParams) => {
  return alovaInstance.Get<InProgressOrderListResponse>('/api/orders/in-progress', { params })
}

export const getInProgressOrderDetail = (id: string) => {
  return alovaInstance.Get<InProgressOrderRecord>('/api/orders/in-progress/detail', {
    params: { id }
  })
}

export const submitInProgressReview = (payload: {
  id: string
  issueType: string
  note: string
  dueDate: string
}) => {
  return alovaInstance.Post<{ success: boolean }>('/api/orders/in-progress/review', payload)
}

export const updateInProgressOrderStatus = (payload: {
  id: string
  status: InProgressStatus
}) => {
  return alovaInstance.Post<{ success: boolean }>('/api/orders/in-progress/status', payload)
}
