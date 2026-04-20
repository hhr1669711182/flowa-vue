import { alovaInstance } from '@/services/alova';
import { useAppStoreWithOut } from '@/store/modules/app'
import { site } from './useAddress'

/** 首页 get_home_stats 返回结构（与 Postman 一致） */
export interface HomeStats {
  company?: string
  balance?: number
  /** 当前公司 LOS reserved_fee 汇总（与字段名历史兼容） */
  reserved_logistics_today?: number
  avg_logistics_fee_usd?: number
  /** 扣除 LOS 锁定物流费后的可用余额 ÷ 平均每单物流费，向下取整（后端 get_home_stats） */
  estimated_orders_affordable?: number
  orders_all?: number
  orders_action_required?: number
  orders_in_progress?: number
  orders_delivered?: number
  orders_blocked?: number
  orders_cancelled?: number
}

/** 首页汇总统计：POST get_home_stats。company 传当前公司（与后端 get_order_menu_stats(company) 一致）；空则 body {}，由会话 _resolve_company 兜底。 */
export const getDashboardStats = (company?: string) => {
  const c = typeof company === 'string' ? company.trim() : ''
  if (useAppStoreWithOut().useMock) {
    return alovaInstance.Get<any>('/api/dashboard/stats');
  }
  return alovaInstance.Post<HomeStats>(`${site.UU_API_OMS_UI}.get_home_stats`, c ? { company: c } : {})
}

/** 销售订单状态统计：POST get_sales_order_counts，body 可选 company */
export const getSalesOrderCounts = (company?: string) => {
  return alovaInstance.Post<any>(
    `${site.UU_API_OMS_UI}.get_sales_order_counts`,
    company ? { company } : {}
  )
}

/** 启用商品数量：POST get_item_available_count。company 必填，按 company 过滤。 */
export const getItemAvailableCount = (company?: string) => {
  return alovaInstance.Post<number>(`${site.UU_API_OMS_UI}.get_item_available_count`, company ? { company } : {})
}

/** 首页未读工单列表项（与 GET 资源返回字段一致） */
export interface UnreadTroubleTicket {
  name: string
  subject?: string
  subject_en?: string
  status?: string
  created_at?: string
  priority?: string
}

/** 首页未读工单：走 OMS 接口 get_unread_trouble_tickets。bypassCache=true 时禁用缓存，用于标记已读后局部刷新。 */
export const getUnreadTroubleTickets = (
  company?: string
) => {
  if (useAppStoreWithOut().useMock) {
    return alovaInstance.Get<any>('/api/dashboard/unread-tickets', {
      params: { company },
    })
  }

  const payload: any = {}
  if (company && company.trim() !== '') {
    payload.company = company.trim()
  }

  return alovaInstance.Post<any>(`${site.UU_API_OMS_UI}.get_unread_trouble_tickets`, payload, {
    transform: (raw: any) => {
      const msg = raw?.message ?? raw
      if (msg && typeof msg === 'object' && msg.ok) {
        return {
          total_unread: msg.data?.total_unread || 0,
          list: Array.isArray(msg.data?.list) ? msg.data.list : [],
        }
      }
      return { total_unread: 0, list: [] }
    }
  })
}

/** 工单标记已查看（单条）：POST mark_trouble_ticket_viewed，Body name + company。Frappe 返回在 message 里，此处解包为 { ok, message } */
export const markTroubleTicketViewed = (name: string, company: string) => {
  if (useAppStoreWithOut().useMock) {
    return alovaInstance.Post<{ success: boolean }>(`/api/dashboard/unread-tickets/${name}/read`)
  }

  const payload: any = { name }
  if (company && company.trim() !== '') {
    payload.company = company.trim()
  }

  return alovaInstance.Post<{ success: boolean }>(`${site.UU_API_OMS_UI}.mark_trouble_ticket_viewed`, payload, {
    transform: (raw: any) => {
      const msg = raw?.message ?? raw
      if (msg && typeof msg === 'object' && msg.ok) {
        return { success: true }
      }
      throw new Error(msg?.message || msg?.error || 'Failed to mark as viewed')
    }
  })
}

/** 全部工单标记已读：POST mark_all_trouble_tickets_viewed，Body company */
export const markAllTroubleTicketsViewed = (company?: string) => {
  return alovaInstance.Post<{ ok: boolean; message?: string; updated?: number }>(
    `${site.UU_API_OMS_UI}.mark_all_trouble_tickets_viewed`,
    { company: company ?? '' }
  )
}

/** 首页 Action Required 订单列表（来自工单）：走 OMS 接口 get_action_required_sales_orders，从非关闭且关联销售订单的 Trouble Ticket 取清单。返回 { data: [], total }，每项含 name、trouble_ticket、subject、status。 */
export const getActionRequiredSalesOrders = (company?: string, limit = 20) => {
  if (!company?.trim()) {
    return Promise.resolve({ data: [], total: 0 })
  }
  return alovaInstance.Post<{ data?: any[]; total?: number } | { message?: { data?: any[]; total?: number } }>(
    `${site.UU_API_OMS_UI}.get_action_required_sales_orders`,
    { company: company.trim(), limit, deduplicate_by_order: true }
  )
}

export const getDashboardNotifications = () => {
  return alovaInstance.Get<any[]>('/api/dashboard/notifications');
}

export const getDashboardRecentOrders = (params?: { company?: string; limit_page_length?: number }) => {
  if (useAppStoreWithOut().useMock) {
    return alovaInstance.Get<any[]>('/api/dashboard/recent-orders');
  }
  const { company, limit_page_length = 10 } = params || {}
  if (!company?.trim()) {
    return Promise.resolve({ data: [], total: 0, page: 1, page_size: limit_page_length }) as any
  }
  return alovaInstance.Post<{ data?: any[]; total?: number; page?: number; page_size?: number }>(
    `${site.UU_API_OMS_UI}.flowa_list_sales_orders`,
    { company: company.trim(), page: 1, page_size: limit_page_length }
  )
}

export const markNotificationAsRead = (id?: number) => {
  return alovaInstance.Post('/api/dashboard/notifications/read', { id });
}

/** 通用 DocType 数量：POST get_doctype_count，Body: doctype（必填）, stats_filter（可选，JSON 字符串）。返回数字 */
export const getDocTypeCount = (doctype: string, statsFilter?: string) => {
  return alovaInstance.Post<number>(
    `${site.UU_API_OMS_UI}.get_doctype_count`,
    statsFilter ? { doctype, stats_filter: statsFilter } : { doctype }
  )
}

/** 充值接口返回：success, data.payment_url, data.payment_id, data.amount 等；失败时 success=false, error */
export interface CreateRechargePaymentResult {
  success: boolean
  data?: { payment_id?: string; payment_url?: string; amount?: number; currency?: string; payment_channel?: string }
  error?: string
}

export const createRechargePayment = (params: { amount: number; company?: string }) => {
  if (useAppStoreWithOut().useMock) {
    return alovaInstance.Post<{ success: boolean; data: { payment_url: string } }>('/api/dashboard/recharge', params, {
      transform: () => ({ success: true, data: { payment_url: 'https://example.com/pay' } })
    })
  }
  return alovaInstance.Post<any>(`${site.UU_API_OMS_UI}.create_recharge`, params)
}
