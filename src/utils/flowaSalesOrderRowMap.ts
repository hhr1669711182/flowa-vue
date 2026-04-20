import type { CancelledOrderRecord } from '@/api/order/cancelled'
import type { BlockedOrderRecord } from '@/api/order/blocked'
import type { DeliveredOrderRecord } from '@/api/order/delivered'
import type { InProgressOrderRecord } from '@/api/order/inProgress'

/** `flowa_list_sales_orders` 单行（与 api_oms_ui 返回字段一致） */
export type FlowaSalesOrderListRow = Record<string, unknown>

/** 列表/详情「Platform ID」列：优先客户采购单号 po_no，其次自定义单号/平台编码 */
export function platformIdFromFlowaRow(o: Record<string, unknown>): string {
  const po = o.po_no
  if (po != null && String(po).trim() !== '') return String(po).trim()
  return String(o.custom_delivery_order_no ?? o.custom_yt_product_code ?? '')
}

/** 通用订单行（All Orders 列表使用，保留 API 原始 status/stage） */
export type OrderListRow = Record<string, unknown> & {
  id: string
  orderId: string
  platformId: string
  stage: string
  /** 展示用（可能为翻译后的 status_display） */
  status: string
  /** ERPNext 原始 status，用于 Actions 主按钮等逻辑 */
  statusKey: string
  inventoryStatus: string
  createDate: string
  dueDate: string
  quantity: number
  chargingWeight: number
  customerRegion: string
}

export function mapRowToOrderRecord(o: FlowaSalesOrderListRow): OrderListRow {
  const name = String(o.name ?? '')
  const rawStatus = String(o.status ?? '').trim()
  return {
    id: name,
    orderId: name,
    platformId: platformIdFromFlowaRow(o),
    stage: String(o.stage ?? o.status_display ?? ''),
    statusKey: rawStatus,
    status: String(o.status_display ?? o.status ?? ''),
    inventoryStatus: 'In Stock',
    createDate: String(o.transaction_date ?? '-'),
    dueDate: String(o.delivery_date ?? '-'),
    quantity: Number(o.total_qty ?? 0) || 0,
    chargingWeight: Number(o.charging_weight ?? o.total_weight ?? 0) || 0,
    customerRegion: String(o.customer_country ?? o.country ?? o.custom_country ?? ''),
    customerCountry: String(o.customer_country ?? o.country ?? o.custom_country ?? ''),
  }
}

export function mapRowToCancelledRecord(o: FlowaSalesOrderListRow): CancelledOrderRecord {
  const name = String(o.name ?? '')
  return {
    id: name,
    orderId: name,
    platformId: String(o.custom_delivery_order_no ?? o.custom_yt_product_code ?? ''),
    stage: 'Review and Fix',
    status: String(o.status_display ?? o.status ?? 'Cancelled') as CancelledOrderRecord['status'],
    reason: 'Customer Request',
    customerName: '-',
    customerRegion: String(o.customer_country ?? o.country ?? o.custom_country ?? ''),
    customerCountry: String(o.customer_country ?? o.country ?? o.custom_country ?? ''),
    inventoryStatus: 'In Stock',
    createDate: String(o.transaction_date ?? '-'),
    cancelledDate: String(o.transaction_date ?? '-'),
    dueDate: String(o.delivery_date ?? '-'),
    sku: String(o.custom_yt_product_code ?? '-'),
    productName: '-',
    quantity: Number(o.total_qty ?? 0) || 0,
    cancelNote: '',
    reopenable: true,
    chargingWeight: Number(o.charging_weight ?? o.total_weight ?? 0) || 0,
  }
}

export function mapRowToBlockedRecord(o: FlowaSalesOrderListRow): BlockedOrderRecord {
  const name = String(o.name ?? '')
  return {
    id: name,
    orderId: name,
    platformId: platformIdFromFlowaRow(o),
    stage: 'Manual Hold',
    status: String(o.status_display ?? o.status ?? 'Blocked') as BlockedOrderRecord['status'],
    holdReason: 'Address Error',
    holdLevel: 'Medium',
    holdNote: '',
    customerName: '-',
    customerRegion: String(o.customer_country ?? o.country ?? o.custom_country ?? ''),
    customerCountry: String(o.customer_country ?? o.country ?? o.custom_country ?? ''),
    inventoryStatus: 'In Stock',
    createDate: String(o.transaction_date ?? '-'),
    blockedDate: String(o.transaction_date ?? '-'),
    dueDate: String(o.delivery_date ?? '-'),
    sku: String(o.custom_yt_product_code ?? '-'),
    productName: '-',
    quantity: Number(o.total_qty ?? 0) || 0,
    holdDays: 0,
    chargingWeight: Number(o.charging_weight ?? o.total_weight ?? 0) || 0,
  }
}

export function mapRowToDeliveredRecord(o: FlowaSalesOrderListRow): DeliveredOrderRecord {
  const name = String(o.name ?? '')
  return {
    id: name,
    orderId: name,
    platformId: platformIdFromFlowaRow(o),
    stage: 'Delivered',
    status: String(o.status_display ?? o.status ?? 'Delivered') as DeliveredOrderRecord['status'],
    customerName: '-',
    customerRegion: String(o.customer_country ?? o.country ?? o.custom_country ?? ''),
    customerCountry: String(o.customer_country ?? o.country ?? o.custom_country ?? ''),
    createDate: String(o.transaction_date ?? '-'),
    dueDate: String(o.delivery_date ?? '-'),
    arrivalDate: String(o.delivery_date ?? o.transaction_date ?? '-'),
    sku: String(o.custom_yt_product_code ?? '-'),
    productName: '-',
    quantity: Number(o.total_qty ?? 0) || 0,
    chargingWeight: Number(o.charging_weight ?? o.total_weight ?? 0) || 0,
    inventoryStatus: 'In Stock',
  }
}

export function mapRowToInProgressRecord(o: FlowaSalesOrderListRow): InProgressOrderRecord {
  const name = String(o.name ?? '')
  return {
    id: name,
    orderId: name,
    platformId: String(o.custom_delivery_order_no ?? o.custom_yt_product_code ?? ''),
    stage: 'Review & Fix',
    status: String(o.status_display ?? o.status ?? 'Pick & Pack') as InProgressOrderRecord['status'],
    customerName: '-',
    customerRegion: String(o.customer_country ?? o.country ?? o.custom_country ?? ''),
    customerCountry: String(o.customer_country ?? o.country ?? o.custom_country ?? ''),
    inventoryStatus: 'In Stock',
    createDate: String(o.transaction_date ?? '-'),
    dueDate: String(o.delivery_date ?? '-'),
    quantity: Number(o.total_qty ?? 0) || 0,
    chargingWeight: Number(o.charging_weight ?? o.total_weight ?? 0) || 0,
  }
}

/** 订单详情 Drawer：销售订单行项目（与 get_sales_order_detail items 一致） */
export interface OrderDetailLineItem {
  name: string
  idx: number
  itemCode: string
  itemName: string
  description: string
  qty: number
  uom: string
  rate: number
  amount: number
}

export function extractOrderDetailLineItems(doc: Record<string, unknown> | null): OrderDetailLineItem[] {
  if (!doc || !Array.isArray(doc.items)) return []
  return (doc.items as Record<string, unknown>[]).map((it, i) => ({
    name: String(it.name ?? ''),
    idx: Number(it.idx ?? i + 1),
    itemCode: String(it.item_code ?? ''),
    itemName: String(it.item_name ?? ''),
    description: String(it.description ?? ''),
    qty: Number(it.qty ?? 0) || 0,
    uom: String(it.uom ?? ''),
    rate: Number(it.rate ?? 0) || 0,
    amount: Number(it.amount ?? 0) || 0,
  }))
}

/** 展开行子表行结构：Sales Order, Order Date, Delivery Date, Delivery No, Delivery Order No, Country, Qty, Weight, Status */
export interface ExpandTableRow {
  salesOrder: string
  orderDate: string
  deliveryDate: string
  deliveryNo: string
  deliveryOrderNo: string
  country: string
  qty: number
  weight: number
  status: string
}

/** 从 `get_sales_order_detail` 的 data 提取展开行子表数据 */
export function extractExpandTableRows(
  doc: Record<string, unknown> | null,
  fallbackRow: Record<string, unknown>
): ExpandTableRow[] {
  if (!doc || typeof doc !== 'object') {
    return [{
      salesOrder: String(fallbackRow.orderId ?? ''),
      orderDate: String(fallbackRow.createDate ?? '-'),
      deliveryDate: String(fallbackRow.dueDate ?? '-'),
      deliveryNo: String(fallbackRow.platformId ?? '-'),
      deliveryOrderNo: String(fallbackRow.platformId ?? '-'),
      country: String(fallbackRow.customerRegion ?? '-'),
      qty: Number(fallbackRow.quantity ?? 0) || 0,
      weight: 0,
      status: String(fallbackRow.status ?? '')
    }]
  }
  const items = Array.isArray(doc.items) ? (doc.items as Record<string, unknown>[]) : []
  const name = String(doc.name ?? '')
  const orderDate = String(doc.transaction_date ?? '-')
  const deliveryDate = String(doc.delivery_date ?? doc.transaction_date ?? '-')
  const deliveryNo = String(doc.lr_no ?? doc.tracking_no ?? doc.custom_delivery_order_no ?? '-')
  const deliveryOrderNo = String(doc.custom_delivery_order_no ?? doc.custom_yt_product_code ?? '-')
  const country = String(doc.custom_country ?? doc.country ?? fallbackRow.customerRegion ?? '-')
  const status = String(doc.status_display ?? doc.status ?? fallbackRow.status ?? 'Fulfilment')

  if (items.length > 0) {
    return items.map((it: Record<string, unknown>) => ({
      salesOrder: String(it.parent ?? it.against_sales_order ?? name),
      orderDate: String(it.transaction_date ?? it.creation ?? orderDate),
      deliveryDate: String(it.delivery_date ?? deliveryDate),
      deliveryNo: String(it.lr_no ?? it.tracking_no ?? deliveryNo),
      deliveryOrderNo: String(it.custom_delivery_order_no ?? it.custom_yt_product_code ?? deliveryOrderNo),
      country: String(it.custom_country ?? it.country ?? country),
      qty: Number(it.qty ?? it.total_qty ?? 0) || 0,
      weight: Number(it.weight ?? it.total_weight ?? 0) || 0,
      status: String(it.status_display ?? it.status ?? status)
    }))
  }

  return [{
    salesOrder: name,
    orderDate,
    deliveryDate,
    deliveryNo,
    deliveryOrderNo,
    country,
    qty: Number(doc.total_qty ?? fallbackRow.quantity ?? 0) || 0,
    weight: Number(doc.total_weight ?? doc.charging_weight ?? 0) || 0,
    status
  }]
}

/** 将 `get_sales_order_detail` 返回的 `data` 合并进列表行（展开行 / 详情弹窗） */
export function patchRowFromSalesOrderDoc<T extends object>(row: T, doc: Record<string, unknown> | null): T {
  if (!doc) return row
  const items = Array.isArray(doc.items) ? (doc.items as Record<string, unknown>[]) : []
  const first = items[0]
  const r = row as unknown as Record<string, unknown>
  const name = String(doc.name ?? r.id ?? '')
  const patched: Record<string, unknown> = {
    ...row,
    id: String(r.id ?? name),
    orderId: String(r.orderId ?? name),
    platformId: platformIdFromFlowaRow(doc as Record<string, unknown>) || String(r.platformId ?? ''),
    sku: String(doc.custom_yt_product_code ?? first?.item_code ?? r.sku ?? ''),
    quantity: Number(doc.total_qty ?? r.quantity ?? 0) || 0,
    productName: String(first?.item_name ?? first?.description ?? r.productName ?? ''),
    customerName: String(doc.customer_name ?? doc.customer ?? r.customerName ?? '-'),
    shopifyCustomer: doc.shopify_customer ?? r.shopifyCustomer ?? null,
    customerRegion: String(doc.customer_country ?? doc.custom_country ?? doc.country ?? r.customerRegion ?? ''),
    customerCountry: String(doc.customer_country ?? doc.custom_country ?? doc.country ?? r.customerRegion ?? ''),
    status: String(doc.status_display ?? doc.status ?? r.status ?? ''),
    statusKey: String(doc.status ?? '').trim() || String(r.statusKey ?? '').trim(),
    createDate: String(doc.transaction_date ?? r.createDate ?? '-'),
    dueDate: String(doc.delivery_date ?? r.dueDate ?? '-'),
    chargingWeight: Number(doc.charging_weight ?? doc.total_weight ?? r.chargingWeight ?? 0) || 0,
  }
  return patched as T
}
