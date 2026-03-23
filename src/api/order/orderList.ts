import { alovaInstance } from '@/services/alova'

export type OrderStage =
  | 'Review & Fix'
  | 'Warehouse'
  | 'Export'
  | 'Local Delivery'
  | 'Delivered'

export type OrderStatus =
  | 'Awaiting Approval'
  | 'Need Attention'
  | 'Processing'
  | 'Blocked'
  | 'Awaiting'

export type InventoryStatus = 'In Stock' | 'Reserved' | 'Out of Stock'

export interface OrderItem {
  id: string
  name: string
  sku: string
  details: string
  quantity: number
  price: string
  warehouse: string
  inventoryStatus: InventoryStatus
}

export interface OrderListRecord {
  id: string
  orderId: string
  platformId: string
  stage: OrderStage
  status: OrderStatus
  customerName: string
  customerRegion: string
  inventoryStatus: InventoryStatus
  createDate: string
  dueDate: string
  title?: string
  code?: string
  deliveryStatus?: string
  destination?: string
  etaText?: string
  trackingNo?: string
  items?: OrderItem[]
}

export interface OrderListParams {
  page?: number
  pageSize?: number
  keyword?: string
  quickRange?: 'last7' | 'last30' | 'thisMonth' | 'all'
  dateRange?: [string, string] | []
  stage?: OrderStage | ''
  status?: OrderStatus | ''
  inventory?: InventoryStatus | ''
}

export interface OrderListResponse {
  total: number
  list: OrderListRecord[]
}

export const getOrderList = (params: OrderListParams) => {
  return alovaInstance.Get<OrderListResponse>('/api/orders/order-list', { params })
}

export const getOrderDetail = (id: string) => {
  return alovaInstance.Get<OrderListRecord>('/api/orders/order-list/detail', { params: { id } })
}

export const updateOrderStatus = (payload: { id: string; status: OrderStatus }) => {
  return alovaInstance.Post<{ success: boolean }>('/api/orders/order-list/status', payload)
}

export const createOrderTicket = (payload: {
  id: string
  subject: string
  message: string
  priority: 'High' | 'Medium' | 'Low'
}) => {
  return alovaInstance.Post<{ success: boolean }>('/api/orders/order-list/ticket', payload)
}

export const deleteOrderItem = (payload: { id: string; itemId: string }) => {
  return alovaInstance.Post<{ success: boolean }>('/api/orders/order-list/item/delete', payload)
}

