export function unwrapFrappeMessage<T = unknown>(raw: unknown): T {
  if (raw != null && typeof raw === 'object' && 'message' in (raw as Record<string, unknown>)) {
    return (raw as { message: T }).message
  }
  return raw as T
}

export function parseFlowaListSalesOrdersResult(raw: unknown): {
  data: unknown[]
  total: number
  page?: number
  page_size?: number
} {
  if (raw != null && typeof raw === 'object') {
    const o = raw as Record<string, unknown>
    if (Array.isArray(o.data) || Array.isArray(o.list)) {
      const data = Array.isArray(o.data) ? o.data : (o.list as unknown[])
      return {
        data,
        total: Number(o.total ?? data.length) || 0,
        page: o.page != null ? Number(o.page) : undefined,
        page_size: o.page_size != null ? Number(o.page_size) : undefined,
      }
    }
  }

  let msg = unwrapFrappeMessage(raw) as unknown
  if (
    msg != null &&
    typeof msg === 'object' &&
    'message' in (msg as Record<string, unknown>) &&
    !('data' in (msg as Record<string, unknown>)) &&
    !Array.isArray(msg)
  ) {
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
      page_size: m.page_size != null ? Number(m.page_size) : undefined,
    }
  }
  return { data: [], total: 0 }
}

export const parseOmsBillingListResult = parseFlowaListSalesOrdersResult

export function extractOmsSalesOrderDetail(raw: unknown): Record<string, unknown> | null {
  const msg = unwrapFrappeMessage(raw) as Record<string, unknown> | undefined
  if (!msg || typeof msg !== 'object') return null
  if (msg.ok === false) return null
  if ('data' in msg && msg.data != null && typeof msg.data === 'object') {
    return msg.data as Record<string, unknown>
  }
  return null
}

