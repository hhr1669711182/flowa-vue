import { alovaInstance } from '@/services/alova'

export type InProgressOrderStage =
  | 'Review & Fix'
  | 'Warehouse Processing'
  | 'Export Processing'
  | 'Local Delivery'

export type InProgressOrderStatus =
  | 'Pick & Pack'
  | 'Awaiting Handover'
  | 'Dispatched'
  | 'Waiting Export'
  | 'Exporting'
  | 'Destination Country'
  | 'Customs Clearance'
  | 'In Transit'
  | 'Awaiting'

export type InProgressInventoryStatus = 'In Stock' | 'Reserved' | 'Out of Stock'

export interface InProgressServiceSummary {
  id: string
  type: string
  typeDescription: string
  approvedDate: string
  approvedBy: string
  price: string
  uom: string
  quantity: number
  subtotal: string
  totalVat: string
  total: string
}

export interface InProgressOrderRecord {
  id: string
  orderId: string
  platformId: string
  stage: InProgressOrderStage
  status: InProgressOrderStatus
  customerName: string
  customerRegion: string
  inventoryStatus: InProgressInventoryStatus
  createDate: string
  dueDate: string
  title?: string
  code?: string
  deliveryStatus?: string
  carrier?: string
  method?: string
  trackingNo?: string
  destination?: string
  etaText?: string
  arrivalAtText?: string
  services?: InProgressServiceSummary[]
}

export interface InProgressOrderListParams {
  page?: number
  pageSize?: number
  keyword?: string
  quickRange?: 'last7' | 'last30' | 'thisMonth' | 'all'
  dateRange?: [string, string] | []
  stage?: InProgressOrderStage | ''
  status?: InProgressOrderStatus | ''
  inventory?: InProgressInventoryStatus | ''
}

export interface InProgressOrderListResponse {
  total: number
  list: InProgressOrderRecord[]
}

export const getInProgressOrderList = (params: InProgressOrderListParams) => {
  return alovaInstance.Get<InProgressOrderListResponse>('/api/orders/in-progress', { params })
}

export const getInProgressOrderDetail = (id: string) => {
  return alovaInstance.Get<InProgressOrderRecord>('/api/orders/in-progress/detail', {
    params: { id }
  })
}

export const createInProgressSupportTicket = (payload: {
  id: string
  subject: string
  message: string
  priority: 'High' | 'Medium' | 'Low'
}) => {
  return alovaInstance.Post<{ success: boolean }>('/api/orders/in-progress/ticket', payload)
}

export const interceptInProgressOrder = (payload: { id: string; note: string }) => {
  return alovaInstance.Post<{ success: boolean }>('/api/orders/in-progress/intercept', payload)
}
