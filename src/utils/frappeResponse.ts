/**
 * Frappe `/api/method/*` JSON 一般为 `{ message: <whitelisted 返回值>, ... }`。
 * 请求层（alova）不会自动剥 `message`，需在此处统一处理。
 */
export function unwrapFrappeMessage<T = unknown>(raw: unknown): T {
  if (raw != null && typeof raw === 'object' && 'message' in (raw as Record<string, unknown>)) {
    return (raw as { message: T }).message
  }
  return raw as T
}

/** `flowa_list_sales_orders`：约定 `{ data, total, page?, page_size? }`；兼容 message 包裹、顶层 data、message: [""] */
export function parseFlowaListSalesOrdersResult(raw: unknown): {
  data: unknown[]
  total: number
  page?: number
  page_size?: number
} {
  // 1) 顶层已有 data/list，直接使用（避免 message: [""] 时 unwrap 得到空字符串数组）
  if (raw != null && typeof raw === 'object') {
    const o = raw as Record<string, unknown>
    if (Array.isArray(o.data) || Array.isArray(o.list)) {
      const data = Array.isArray(o.data) ? o.data : (o.list as unknown[])
      return {
        data,
        total: Number(o.total ?? data.length) || 0,
        page: o.page != null ? Number(o.page) : undefined,
        page_size: o.page_size != null ? Number(o.page_size) : undefined
      }
    }
  }

  // 2) Frappe 标准：{ message: { data, total } } 或 { message: [...] }
  let msg = unwrapFrappeMessage(raw) as unknown
  if (msg != null && typeof msg === 'object' && 'message' in (msg as Record<string, unknown>) && !('data' in (msg as Record<string, unknown>)) && !Array.isArray(msg)) {
    msg = unwrapFrappeMessage(msg)
  }
  if (Array.isArray(msg)) {
    return { data: msg, total: msg.length, page: 1, page_size: msg.length }
  }
  if (msg != null && typeof msg === 'object') {
    const m = msg as Record<string, unknown>
    const data = Array.isArray(m.data) ? m.data : Array.isArray(m.list) ? m.list : []
    return {
      data,
      total: Number(m.total ?? data.length) || 0,
      page: m.page != null ? Number(m.page) : undefined,
      page_size: m.page_size != null ? Number(m.page_size) : undefined
    }
  }
  return { data: [], total: 0 }
}

/** 仓储/入库/附加费等 OMS 分页列表：与上同形（Frappe `message` 内为 `{ data, total }`） */
export const parseOmsBillingListResult = parseFlowaListSalesOrdersResult

/** OMS `get_sales_order_detail`：`message` 内为 `{ ok, data?, error? }` */
export function extractOmsSalesOrderDetail(raw: unknown): Record<string, unknown> | null {
  const msg = unwrapFrappeMessage(raw) as Record<string, unknown> | undefined
  if (!msg || typeof msg !== 'object') return null
  if (msg.ok === false) return null
  if ('data' in msg && msg.data != null && typeof msg.data === 'object') {
    return msg.data as Record<string, unknown>
  }
  return null
}
