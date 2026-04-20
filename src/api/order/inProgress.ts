import { alovaInstance } from '@/services/alova'
import { site } from '@/api/useAddress'

const OMS_API = site.UU_API_OMS_UI

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

/** 与 `InProgressOrderStage` 同义，兼容 `@/views/order/inProgress.vue` */
export type InProgressStage = InProgressOrderStage

/** 兼容列表页 UI 状态 + ERP 状态 */
export type InProgressStatus =
  | InProgressOrderStatus
  | 'Awaiting Approval'
  | 'Need Attention'
  | 'Processing'
  | 'Blocked'

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
  customerCountry?: string
  [key: string]: any
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

export const getInProgressOrderList = (params: InProgressOrderListParams & { company?: string }) => {
  return alovaInstance.Post<any>(`${OMS_API}.flowa_list_sales_orders`, {
    company: params.company,
    page: params.page ?? 1,
    page_size: params.pageSize ?? 20,
    order_no: params.keyword || undefined,
    menu_key: 'in_progress',
    status: params.status || undefined,
  })
}

export const getInProgressOrderDetail = (id: string, company?: string) => {
  return alovaInstance.Post<any>(`${OMS_API}.get_sales_order_detail`, { name: id, company })
}

export const createInProgressSupportTicket = (payload: {
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
    ...(payload.company ? { company: payload.company } : {}),
  })
}

export const interceptInProgressOrder = (payload: { id: string; note: string; company?: string }) => {
  return alovaInstance.Post<any>(`${OMS_API}.block_sales_order_waybill`, {
    sales_order_name: payload.id,
    ...(payload.company ? { company: payload.company } : {}),
  })
}

/** Review & Fix 提交：写入备注/交期（`update_sales_order_fields`） */
export const submitInProgressReview = (payload: {
  id: string
  issueType: string
  note: string
  dueDate: string
  company?: string
}) => {
  const remarks = `[Review & Fix] ${payload.issueType}: ${payload.note}`
  return alovaInstance.Post<any>(`${OMS_API}.update_sales_order_fields`, {
    name: payload.id,
    ...(payload.company ? { company: payload.company } : {}),
    remarks,
    ...(payload.dueDate ? { delivery_date: payload.dueDate } : {}),
  })
}

/** 行内状态更新（如下拉 Mark Processing / Blocked） */
export const updateInProgressOrderStatus = (payload: {
  id: string
  status: InProgressStatus
  company?: string
}) => {
  return alovaInstance.Post<any>(`${OMS_API}.update_sales_order_fields`, {
    name: payload.id,
    ...(payload.company ? { company: payload.company } : {}),
    status: payload.status,
  })
}
