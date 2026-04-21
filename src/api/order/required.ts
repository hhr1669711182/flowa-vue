import { alovaInstance } from "@/services/alova";
import { site } from '@/api/useAddress'

const OMS_API = site.UU_API_OMS_UI

export type RequiredOrderStage =
  | 'Review & Fix'
  | 'Warehouse Processing'
  | 'Labeling'
  | 'Export Processing'
  | 'Local Delivery'

export type RequiredOrderStatus = 'Awaiting Approval' | 'Need Attention' | 'Processing' | 'Blocked' | 'In Review'

export type RequiredIssueType =
  | 'Address Error'
  | 'Info Missing'
  | 'Wrong Declaration'
  | 'Inventory Mismatch'
  | 'Payment Risk'

export type RequiredInventoryStatus = "In Stock" | "Reserved" | "Out of Stock";

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

/** Action Required 列表（来自工单+草稿）：POST get_action_required_sales_orders，含 Draft 订单及 TT Open 未关闭关联订单，返回 { data: [], total }，每项含 name、trouble_ticket、subject、status。 */
export const getActionRequiredFromTickets = (params: { company?: string; limit?: number }) => {
  return alovaInstance.Post<any>(`${OMS_API}.get_action_required_sales_orders`, {
    company: (params.company ?? '').trim(),
    limit: params.limit ?? 500,
    deduplicate_by_order: true
  })
}

/** Action Required 列表（按状态筛选的销售订单）：POST flowa_list_sales_orders，传 company、status、order_no 等 */
export const getRequiredOrderList = (params: RequiredOrderListParams & { company?: string }) => {
  return alovaInstance.Post<any>(`${OMS_API}.flowa_list_sales_orders`, {
    company: params.company,
    page: params.page ?? 1,
    page_size: params.pageSize ?? 20,
    order_no: params.keyword || undefined,
    status: params.status || undefined,
    menu_key: 'action_required',
  })
}

export const getRequiredOrderDetail = (id: string, company?: string) => {
  return alovaInstance.Post<any>(`${OMS_API}.get_sales_order_detail`, {
    name: id,
    company,
  })
}

export const submitRequiredReview = (payload: {
  id: string
  issueType: RequiredIssueType
  note: string
  dueDate: string
  company?: string
}) => {
  return alovaInstance.Post<any>(`${OMS_API}.update_sales_order_fields`, {
    name: payload.id,
    remarks: payload.note,
    company: payload.company,
  })
}

export const updateRequiredOrderStatus = (payload: {
  id: string
  status: RequiredOrderStatus
  company?: string
}) => {
  return alovaInstance.Post<any>(`${OMS_API}.update_sales_order_fields`, {
    name: payload.id,
    status: payload.status,
    company: payload.company,
  })
}

export const createRequiredSupportTicket = (payload: {
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
