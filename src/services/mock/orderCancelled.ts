import { defineMock } from '@alova/mock'
import type {
  CancelledOrderRecord,
  CancelledOrderStage,
  CancelledOrderStatus
} from '@/api/orderCancelled'

const stagePool: CancelledOrderStage[] = [
  'Review and Fix',
  'Warehouse Processing',
  'Export Processing',
  'Return Processing'
]

const statusPool: CancelledOrderStatus[] = [
  'Cancelled',
  'Pending Reactivation',
  'Reactivated',
  'Archived'
]

const reasonPool: CancelledOrderRecord['reason'][] = [
  'Customer Request',
  'Payment Failed',
  'Address Error',
  'Inventory Shortage',
  'Compliance Block'
]

const inventoryPool: CancelledOrderRecord['inventoryStatus'][] = ['In Stock', 'Reserved', 'Out of Stock']

const formatDate = (date: Date) => {
  const mm = `${date.getMonth() + 1}`.padStart(2, '0')
  const dd = `${date.getDate()}`.padStart(2, '0')
  return `${date.getFullYear()}-${mm}-${dd}`
}

const randomDate = (from: Date, to: Date) => {
  const ts = from.getTime() + Math.random() * (to.getTime() - from.getTime())
  return new Date(ts)
}

const seedCancelledOrders = (): CancelledOrderRecord[] => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - 3, 1)
  return Array.from({ length: 90 }).map((_, index) => {
    const created = randomDate(start, now)
    const cancelled = new Date(created)
    cancelled.setDate(created.getDate() + ((index % 5) + 1))
    const due = new Date(cancelled)
    due.setDate(cancelled.getDate() + ((index % 7) + 2))
    const stage = stagePool[index % stagePool.length]!
    const status = statusPool[index % statusPool.length]!
    return {
      id: `CO-${1600 + index}`,
      orderId: `Order X${(330000 + index).toString().padStart(6, '0')}`,
      platformId: `LGF${20262000 + index}`,
      stage,
      status,
      reason: reasonPool[index % reasonPool.length]!,
      customerName: ['Amelia Clark', 'Benjamin Adams', 'Mia Turner', 'James Green', 'Harper Lewis'][index % 5]!,
      customerRegion: ['UK/London', 'US/Boston', 'DE/Berlin', 'CA/Toronto', 'AU/Sydney'][index % 5]!,
      inventoryStatus: inventoryPool[index % inventoryPool.length]!,
      createDate: formatDate(created),
      cancelledDate: formatDate(cancelled),
      dueDate: formatDate(due),
      sku: `SKU-${11200 + index}`,
      productName: ['Label Bundle', 'Paper Mailer', 'Priority Box', 'Thermal Label', 'Return Pouch'][index % 5]!,
      quantity: (index % 5) + 1,
      cancelNote:
        status === 'Reactivated'
          ? 'Reactivation completed and returned to processing.'
          : 'Order cancelled and pending manual review.',
      reopenable: status !== 'Archived'
    }
  })
}

let cancelledOrdersDb: CancelledOrderRecord[] = seedCancelledOrders()

const inQuickRange = (dateText: string, quickRange: string) => {
  if (!quickRange || quickRange === 'all') return true
  const now = new Date()
  const date = new Date(dateText)
  if (quickRange === 'last7') {
    const from = new Date(now)
    from.setDate(now.getDate() - 7)
    return date >= from && date <= now
  }
  if (quickRange === 'last30') {
    const from = new Date(now)
    from.setDate(now.getDate() - 30)
    return date >= from && date <= now
  }
  if (quickRange === 'thisMonth') {
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
  }
  return true
}

const segmentedCounter = () => ({
  reviewFix: cancelledOrdersDb.filter((item) => item.stage === 'Review and Fix').length,
  warehouse: cancelledOrdersDb.filter((item) => item.stage === 'Warehouse Processing').length,
  export: cancelledOrdersDb.filter((item) => item.stage === 'Export Processing').length,
  return: cancelledOrdersDb.filter((item) => item.stage === 'Return Processing').length
})

export default defineMock({
  '/api/orders/cancelled': ({ query }) => {
    const page = parseInt(query.page || '1', 10)
    const pageSize = parseInt(query.pageSize || '10', 10)
    const keyword = (query.keyword || '').toLowerCase()
    const quickRange = query.quickRange || 'all'
    const stage = query.stage || ''
    const status = query.status || ''
    const inventory = query.inventory || ''
    const segmented = query.segmented || ''
    const dateRange = query.dateRange

    let filtered = [...cancelledOrdersDb]

    if (keyword) {
      filtered = filtered.filter(
        (item) =>
          item.orderId.toLowerCase().includes(keyword) ||
          item.platformId.toLowerCase().includes(keyword) ||
          item.sku.toLowerCase().includes(keyword)
      )
    }

    if (stage) {
      filtered = filtered.filter((item) => item.stage === stage)
    }

    if (status) {
      filtered = filtered.filter((item) => item.status === status)
    }

    if (inventory) {
      filtered = filtered.filter((item) => item.inventoryStatus === inventory)
    }

    if (segmented === 'reviewFix') {
      filtered = filtered.filter((item) => item.stage === 'Review and Fix')
    }

    if (segmented === 'warehouse') {
      filtered = filtered.filter((item) => item.stage === 'Warehouse Processing')
    }

    if (segmented === 'export') {
      filtered = filtered.filter((item) => item.stage === 'Export Processing')
    }

    if (segmented === 'return') {
      filtered = filtered.filter((item) => item.stage === 'Return Processing')
    }

    filtered = filtered.filter((item) => inQuickRange(item.cancelledDate, quickRange))

    if (Array.isArray(dateRange) && dateRange.length === 2) {
      const [from, to] = dateRange
      filtered = filtered.filter((item) => item.cancelledDate >= from && item.cancelledDate <= to)
    }

    filtered.sort((a, b) => (a.cancelledDate > b.cancelledDate ? -1 : 1))

    const total = filtered.length
    const start = (page - 1) * pageSize
    const list = filtered.slice(start, start + pageSize)

    return {
      total,
      list,
      segmented: segmentedCounter()
    }
  },

  '/api/orders/cancelled/detail': ({ query }) => {
    return cancelledOrdersDb.find((item) => item.id === query.id) || cancelledOrdersDb[0]
  },

  '[POST]/api/orders/cancelled/reactivate': ({ data }) => {
    cancelledOrdersDb = cancelledOrdersDb.map((item) =>
      item.id === data.id
        ? {
            ...item,
            status: 'Reactivated',
            stage: data.targetStage || item.stage,
            cancelNote: data.note || item.cancelNote,
            reopenable: true
          }
        : item
    )
    return { success: true }
  },

  '[POST]/api/orders/cancelled/status': ({ data }) => {
    cancelledOrdersDb = cancelledOrdersDb.map((item) =>
      item.id === data.id
        ? {
            ...item,
            status: data.status || item.status,
            reopenable: (data.status || item.status) !== 'Archived'
          }
        : item
    )
    return { success: true }
  },

  '[POST]/api/orders/cancelled/ticket': () => {
    return { success: true }
  }
})
