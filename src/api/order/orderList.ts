import { alovaInstance } from '@/services/alova'
import { useAppStoreWithOut } from '@/store/modules/app'
import { parseFlowaListSalesOrdersResult, extractOmsSalesOrderDetail, unwrapFrappeMessage } from '@/utils/frappeResponse'

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

function toText(v: unknown): string {
  if (v == null) return ''
  return String(v)
}

function toDateText(v: unknown): string {
  const s = toText(v).trim()
  if (!s) return ''
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return s
  const mm = `${d.getMonth() + 1}`.padStart(2, '0')
  const dd = `${d.getDate()}`.padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

function mapOmsRowToOrderListRecord(row: Record<string, unknown>): OrderListRecord {
  const id =
    toText(row.name).trim() ||
    toText(row.id).trim() ||
    toText(row.sales_order).trim() ||
    toText(row.order_id).trim() ||
    ''

  const orderId = toText(row.sales_order || row.order_id || row.name || row.id).trim() || id
  const platformId =
    toText(row.platform_id || row.shopify_order_name || row.marketplace_order_id || row.platformId).trim() || ''
  const customerName = toText(row.customer_name || row.customer || row.customerName).trim() || ''
  const customerRegion =
    toText(row.destination_country || row.shipping_country || row.customerRegion).trim() || toText(row.country).trim() || ''

  const stage = (toText(row.stage || row.order_stage).trim() as OrderStage) || 'Review & Fix'
  const status = (toText(row.status || row.order_status).trim() as OrderStatus) || 'Processing'
  const inventoryStatus =
    (toText(row.inventory_status || row.inventoryStatus).trim() as InventoryStatus) || 'In Stock'

  const trackingNo = toText(row.tracking_no || row.trackingNo || row.tracking_number).trim() || ''
  const etaText = toText(row.eta_text || row.etaText || row.eta).trim() || ''
  const deliveryStatus = toText(row.delivery_status || row.deliveryStatus).trim() || ''
  const destination = toText(row.destination || row.destination_country).trim() || ''
  const title = toText(row.title).trim() || ''
  const code = toText(row.code).trim() || ''
  const createDate = toDateText(row.creation || row.create_date || row.createDate)
  const dueDate = toDateText(row.delivery_date || row.due_date || row.dueDate)

  return {
    id,
    orderId,
    platformId,
    stage,
    status,
    customerName,
    customerRegion,
    inventoryStatus,
    createDate,
    dueDate,
    title,
    code,
    deliveryStatus,
    destination,
    etaText,
    trackingNo,
  }
}

function mapOmsDocToOrderDetail(doc: Record<string, unknown>, idHint: string): OrderListRecord {
  const id = toText(doc.name).trim() || idHint
  const orderId = toText(doc.name || doc.sales_order).trim() || id
  const platformId = toText(doc.shopify_order_name || doc.platform_id || '').trim()
  const customerName = toText(doc.customer_name || doc.customer || '').trim()
  const customerRegion = toText(doc.destination_country || doc.shipping_country || '').trim()
  const stage = (toText(doc.stage || doc.order_stage).trim() as OrderStage) || 'Review & Fix'
  const status = (toText(doc.status || doc.order_status).trim() as OrderStatus) || 'Processing'
  const trackingNo = toText(doc.tracking_no || doc.tracking_number || '').trim()
  const destination = toText(doc.destination_country || doc.destination || '').trim()

  const itemsRaw = Array.isArray(doc.items) ? (doc.items as unknown[]) : []
  const items: OrderItem[] = itemsRaw.map((x: any, idx) => {
    const line = x && typeof x === 'object' ? (x as Record<string, unknown>) : {}
    const lineId = toText(line.name).trim() || `${id}-${idx + 1}`
    const sku = toText(line.item_code || line.sku || line.itemCode).trim()
    const name = toText(line.item_name || line.name || sku).trim() || sku
    const details = toText(line.description || '').trim()
    const quantity = Number(line.qty ?? line.quantity ?? 0) || 0
    const rate = line.rate ?? line.price
    const price = rate == null ? '' : String(rate)
    const warehouse = toText(line.warehouse || '').trim()
    return {
      id: lineId,
      name,
      sku,
      details,
      quantity,
      price,
      warehouse,
      inventoryStatus: 'In Stock',
    }
  })

  return {
    id,
    orderId,
    platformId,
    stage,
    status,
    customerName,
    customerRegion,
    inventoryStatus: 'In Stock',
    createDate: toDateText(doc.creation || doc.create_date),
    dueDate: toDateText(doc.delivery_date || doc.due_date),
    destination,
    trackingNo,
    items,
  }
}

export const getOrderList = async (params: OrderListParams): Promise<OrderListResponse> => {
  if (useAppStoreWithOut().useMock) {
    const method = alovaInstance.Get<OrderListResponse>('/api/orders/order-list', { params })
    return (await (method as any)) as OrderListResponse
  }

  const body: Record<string, unknown> = {
    page: params.page ?? 1,
    page_size: params.pageSize ?? 20,
    ...(params.keyword ? { order_no: params.keyword } : {}),
    ...(params.status ? { status: params.status } : {}),
    menu_key: 'list',
  }
  const raw = await (alovaInstance.Post<any>('flowa_list_sales_orders', body) as any)
  const parsed = parseFlowaListSalesOrdersResult(raw)
  const list = parsed.data
    .filter((x) => x && typeof x === 'object')
    .map((x) => mapOmsRowToOrderListRecord(x as Record<string, unknown>))
  return { total: parsed.total, list }
}

export const getOrderDetail = async (id: string): Promise<OrderListRecord> => {
  if (useAppStoreWithOut().useMock) {
    const method = alovaInstance.Get<OrderListRecord>('/api/orders/order-list/detail', { params: { id } })
    return (await (method as any)) as OrderListRecord
  }
  const cachedCompany = (() => {
    try {
      const s = localStorage.getItem('oms_cached_company')
      return s?.trim() ? s.trim() : undefined
    } catch {
      return undefined
    }
  })()
  const raw = await (alovaInstance.Post<any>('get_sales_order_detail', {
    name: id,
    ...(cachedCompany ? { company: cachedCompany } : {}),
  }) as any)
  const doc = extractOmsSalesOrderDetail(raw)
  if (!doc) {
    const msg = unwrapFrappeMessage(raw) as any
    throw new Error(String(msg?.error || msg?.message || 'Failed to load detail'))
  }
  return mapOmsDocToOrderDetail(doc, id)
}

export const updateOrderStatus = async (payload: { id: string; status: OrderStatus }) => {
  if (useAppStoreWithOut().useMock) {
    const method = alovaInstance.Post<{ success: boolean }>('/api/orders/order-list/status', payload)
    return (await (method as any)) as { success: boolean }
  }
  const { flowaOrderActionMarkPending, extractFlowaOrderActionResult } = await import('@/api/order/omsActions')
  const cachedCompany = (() => {
    try {
      const s = localStorage.getItem('oms_cached_company')
      return s?.trim() ? s.trim() : undefined
    } catch {
      return undefined
    }
  })()
  const raw = await (flowaOrderActionMarkPending({ sales_order_name: payload.id, company: cachedCompany }) as any)
  const parsed = extractFlowaOrderActionResult(raw)
  if (!parsed.ok) throw new Error(parsed.error || 'Failed')
  return { success: true }
}

export const createOrderTicket = async (payload: {
  id: string
  subject: string
  message: string
  priority: 'High' | 'Medium' | 'Low'
}) => {
  if (useAppStoreWithOut().useMock) {
    const method = alovaInstance.Post<{ success: boolean }>('/api/orders/order-list/ticket', payload)
    return (await (method as any)) as { success: boolean }
  }
  const { flowaOrderActionContactSupport, extractFlowaOrderActionResult } = await import('@/api/order/omsActions')
  const cachedCompany = (() => {
    try {
      const s = localStorage.getItem('oms_cached_company')
      return s?.trim() ? s.trim() : undefined
    } catch {
      return undefined
    }
  })()
  const raw = await (flowaOrderActionContactSupport({
    sales_order_name: payload.id,
    company: cachedCompany,
    subject: payload.subject,
    message: payload.message,
    priority: payload.priority,
  }) as any)
  const parsed = extractFlowaOrderActionResult(raw)
  if (!parsed.ok) throw new Error(parsed.error || 'Failed')
  return { success: true }
}

export const deleteOrderItem = async (payload: { id: string; itemId: string }) => {
  if (useAppStoreWithOut().useMock) {
    const method = alovaInstance.Post<{ success: boolean }>('/api/orders/order-list/item/delete', payload)
    return (await (method as any)) as { success: boolean }
  }
  throw new Error('This action is not supported in OMS mode yet.')
}
