/**
 * 解析 Frappe 接口返回的错误 JSON，得到可展示给用户的 message。
 * 服务端返回字段：message, _server_messages（JSON 字符串数组）, exception, exc_type
 */
export function parseFrappeErrorBody(json: unknown): string {
  if (!json || typeof json !== 'object') return 'Request failed'
  const o = json as Record<string, unknown>
  if (o.message && typeof o.message === 'string') return o.message
  if (o._server_messages && Array.isArray(o._server_messages)) {
    try {
      const first = o._server_messages[0]
      if (typeof first === 'string') {
        const parsed = JSON.parse(first) as Record<string, unknown>
        if (parsed?.message) return String(parsed.message)
      }
    } catch (_) {}
  }
  if (o.exception && typeof o.exception === 'string') {
    return o.exception.replace(/^frappe\.exceptions\.\w+:\s*/i, '')
  }
  if (o.exc_type) {
    return `${o.exc_type}: ${typeof o.message === 'string' ? o.message : 'Request failed'}`
  }
  return 'Request failed'
}
