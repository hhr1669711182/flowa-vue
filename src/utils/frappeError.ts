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
    } catch {
      return 'Request failed'
    }
  }
  if (o.exception && typeof o.exception === 'string') {
    return o.exception.replace(/^frappe\.exceptions\.\w+:\s*/i, '')
  }
  if (o.exc_type) {
    return `${o.exc_type}: ${typeof o.message === 'string' ? o.message : 'Request failed'}`
  }
  return 'Request failed'
}

