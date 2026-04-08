import { alovaInstance } from '@/services/alova'
import { OMS_API, OMS_API_FETCH } from '@/api/omsApiBase'

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
  return alovaInstance.Post<HomeStats>(`${OMS_API}.get_home_stats`, c ? { company: c } : {})
}

/** 销售订单状态统计：POST get_sales_order_counts，body 可选 company */
export const getSalesOrderCounts = (company?: string) => {
  return alovaInstance.Post<any>(
    `${OMS_API}.get_sales_order_counts`,
    company ? { company } : {}
  )
}

/** 启用商品数量：POST get_item_available_count。company 必填，按 company 过滤。 */
export const getItemAvailableCount = (company?: string) => {
  return alovaInstance.Post<number>(`${OMS_API}.get_item_available_count`, company ? { company } : {})
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
export const getUnreadTroubleTickets = async (
  company?: string,
  limit = 20,
  bypassCache = false
): Promise<UnreadTroubleTicket[]> => {
  if (!company?.trim()) {
    return []
  }
  const method = alovaInstance.Get<{ message?: UnreadTroubleTicket[] } | UnreadTroubleTicket[]>(
    `${OMS_API}.get_unread_trouble_tickets`,
    {
      params: { company: company.trim(), limit: String(limit) },
      ...(bypassCache ? { cacheFor: 0 } : {}),
    }
  )
  const res = await method.send()
  const list = Array.isArray(res) ? res : (res as any)?.message
  return Array.isArray(list) ? list : []
}

/** 工单标记已查看（单条）：POST mark_trouble_ticket_viewed，Body name + company。Frappe 返回在 message 里，此处解包为 { ok, message } */
export const markTroubleTicketViewed = async (name: string, company: string) => {
  const method = alovaInstance.Post<{ message?: { ok?: boolean; message?: string } | string; ok?: boolean }>(
    `${OMS_API}.mark_trouble_ticket_viewed`,
    { name, company }
  )
  const res = await method.send()
  const inner = (res as any)?.message
  if (inner && typeof inner === 'object' && 'ok' in inner) return { ok: !!inner.ok, message: inner.message }
  return { ok: !!(res as any)?.ok, message: (res as any)?.message }
}

/** 全部工单标记已读：POST mark_all_trouble_tickets_viewed，Body company */
export const markAllTroubleTicketsViewed = (company?: string) => {
  return alovaInstance.Post<{ ok: boolean; message?: string; updated?: number }>(
    `${OMS_API}.mark_all_trouble_tickets_viewed`,
    { company: company ?? '' }
  )
}

/** 首页 Action Required 订单列表（来自工单）：走 OMS 接口 get_action_required_sales_orders，从非关闭且关联销售订单的 Trouble Ticket 取清单。返回 { data: [], total }，每项含 name、trouble_ticket、subject、status。 */
export const getActionRequiredSalesOrders = (company?: string, limit = 20) => {
  if (!company?.trim()) {
    return Promise.resolve({ data: [], total: 0 })
  }
  return alovaInstance.Post<{ data?: any[]; total?: number } | { message?: { data?: any[]; total?: number } }>(
    `${OMS_API}.get_action_required_sales_orders`,
    { company: company.trim(), limit, deduplicate_by_order: true }
  )
}

/** 首页/其他：销售订单列表 flowa_list_sales_orders，返回 { data: [] } */
export const getDashboardRecentOrders = (params: {
  company: string
  limit_page_length?: number
}) => {
  const { company, limit_page_length = 10 } = params
  if (!company?.trim()) {
    return Promise.resolve({ data: [], total: 0, page: 1, page_size: limit_page_length })
  }
  return alovaInstance.Post<{ data?: any[]; total?: number; page?: number; page_size?: number }>(
    `${OMS_API}.flowa_list_sales_orders`,
    { company: company.trim(), page: 1, page_size: limit_page_length }
  )
}

/** 通用 DocType 数量：POST get_doctype_count，Body: doctype（必填）, stats_filter（可选，JSON 字符串）。返回数字 */
export const getDocTypeCount = (doctype: string, statsFilter?: string) => {
  return alovaInstance.Post<number>(
    `${OMS_API}.get_doctype_count`,
    statsFilter ? { doctype, stats_filter: statsFilter } : { doctype }
  )
}

/** 充值接口返回：success, data.payment_url, data.payment_id, data.amount 等；失败时 success=false, error */
export interface CreateRechargePaymentResult {
  success: boolean
  data?: { payment_id?: string; payment_url?: string; amount?: number; currency?: string; payment_channel?: string }
  error?: string
}

/** 充值：POST api_oms_ui.create_recharge，入参 amount（必填）、company（当前公司）。返回 payment_url 供前端打开即唤醒立即支付。 */
export const createRechargePayment = async (
  params: { amount: number; company?: string }
): Promise<CreateRechargePaymentResult> => {
  const { ensureFrappeCsrfToken, getFrappeCsrfToken } = await import('@/services/alova')
  await ensureFrappeCsrfToken()
  const csrf = getFrappeCsrfToken()
  const headers: Record<string, string> = { 'Content-Type': 'application/x-www-form-urlencoded' }
  if (csrf) headers['X-Frappe-CSRF-Token'] = csrf
  const body = new URLSearchParams({ amount: String(params.amount) })
  if (params.company) body.set('company', params.company)
  const res = await fetch(`${OMS_API_FETCH}.create_recharge`, {
    method: 'POST',
    headers,
    body: body.toString(),
    credentials: 'include'
  })
  let json: CreateRechargePaymentResult
  try {
    const text = await res.text()
    if (!text || !text.trim()) throw new SyntaxError('Empty response')
    json = JSON.parse(text)
  } catch {
    throw new Error('Server returned invalid response')
  }
  if (!res.ok) throw new Error(json?.error || (json as { message?: string })?.message || `Request failed: ${res.status}`)
  return json
}
