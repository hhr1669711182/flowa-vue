import { defineMock } from '@alova/mock'
import type { DeliveredOrderRecord, DeliveredStatus } from '@/api/orderDelivered'

const stagePool: DeliveredOrderRecord['stage'][] = [
  'Final Review',
  'Last Mile',
  'Delivered',
  'Returned Handling'
]

const statusPool: DeliveredStatus[] = [
  'Delivered',
  'Partially Delivered',
  'Returned',
  'Delivery Failed'
]

const inventoryPool: DeliveredOrderRecord['inventoryStatus'][] = ['In Stock', 'Reserved', 'Out of Stock']
const carrierPool = ['DHL', 'FedEx', 'UPS', 'Royal Mail']

const formatDate = (date: Date) => {
  const mm = `${date.getMonth() + 1}`.padStart(2, '0')
  const dd = `${date.getDate()}`.padStart(2, '0')
  return `${date.getFullYear()}-${mm}-${dd}`
}

const randomDate = (from: Date, to: Date) => {
  const ts = from.getTime() + Math.random() * (to.getTime() - from.getTime())
  return new Date(ts)
}

const seedDeliveredOrders = (): DeliveredOrderRecord[] => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - 3, 1)
  return Array.from({ length: 80 }).map((_, index) => {
    const created = randomDate(start, now)
    const delivered = new Date(created)
    delivered.setDate(created.getDate() + ((index % 6) + 1))
    const due = new Date(created)
    due.setDate(created.getDate() + ((index % 4) + 1))
    const status = statusPool[index % statusPool.length]!
    return {
      id: `DO-${1200 + index}`,
      orderId: `Order X${(200000 + index).toString().padStart(6, '0')}`,
      platformId: `LGF${20260000 + index}`,
      stage: stagePool[index % stagePool.length]!,
      status,
      customerName: ['Emma Wilson', 'Liam Scott', 'Sophia Hall', 'Noah Miller', 'Mason Lee'][index % 5]!,
      customerRegion: ['UK/Leeds', 'US/Texas', 'DE/Hamburg', 'CA/Vancouver', 'AU/Melbourne'][index % 5]!,
      inventoryStatus: inventoryPool[index % inventoryPool.length]!,
      createDate: formatDate(created),
      deliveredDate: formatDate(delivered),
      dueDate: formatDate(due),
      sku: `SKU-${9500 + index}`,
      productName: ['Parcel Box L', 'Label Roll 4x6', 'Bubble Mailer', 'Return Pouch', 'Manual Kit'][index % 5]!,
      quantity: (index % 5) + 1,
      carrier: carrierPool[index % carrierPool.length]!,
      trackingNo: `TRK${(880000 + index).toString().padStart(8, '0')}`,
      proofStatus: status === 'Delivered' ? 'Signed' : 'No Signature',
      note: status === 'Delivered' ? 'Delivered to front desk.' : 'Delivery exception needs follow-up.'
    }
  })
}

let deliveredOrdersDb: DeliveredOrderRecord[] = seedDeliveredOrders()

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

export default defineMock({
  '/api/orders/delivered': ({ query }) => {
    const page = parseInt(query.page || '1', 10)
    const pageSize = parseInt(query.pageSize || '10', 10)
    const keyword = (query.keyword || '').toLowerCase()
    const quickRange = query.quickRange || 'all'
    const stage = query.stage || ''
    const status = query.status || ''
    const segmented = query.segmented || 'all'
    const dateRange = query.dateRange

    let filtered = [...deliveredOrdersDb]

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

    filtered = filtered.filter((item) => inQuickRange(item.deliveredDate, quickRange))

    if (Array.isArray(dateRange) && dateRange.length === 2) {
      const [from, to] = dateRange
      filtered = filtered.filter((item) => item.deliveredDate >= from && item.deliveredDate <= to)
    }

    if (segmented === 'success') {
      filtered = filtered.filter((item) => item.status === 'Delivered')
    }

    if (segmented === 'issue') {
      filtered = filtered.filter((item) => item.status !== 'Delivered')
    }

    filtered.sort((a, b) => (a.deliveredDate > b.deliveredDate ? -1 : 1))

    const total = filtered.length
    const start = (page - 1) * pageSize
    const list = filtered.slice(start, start + pageSize)

    const segmentedCounter = {
      all: deliveredOrdersDb.length,
      success: deliveredOrdersDb.filter((item) => item.status === 'Delivered').length,
      issue: deliveredOrdersDb.filter((item) => item.status !== 'Delivered').length
    }

    return { total, list, page, pageSize, segmented: segmentedCounter }
  },

  '/api/orders/delivered/detail': ({ query }) => {
    return deliveredOrdersDb.find((item) => item.id === query.id) || deliveredOrdersDb[0]
  },

  '[POST]/api/orders/delivered/note': ({ data }) => {
    deliveredOrdersDb = deliveredOrdersDb.map((item) =>
      item.id === data.id
        ? {
            ...item,
            note: data.note || item.note
          }
        : item
    )
    return { success: true }
  },

  '[POST]/api/orders/delivered/status': ({ data }) => {
    deliveredOrdersDb = deliveredOrdersDb.map((item) =>
      item.id === data.id
        ? {
            ...item,
            status: data.status || item.status,
            proofStatus: data.status === 'Delivered' ? 'Signed' : 'No Signature'
          }
        : item
    )
    return { success: true }
  },

  '[POST]/api/orders/delivered/ticket': () => {
    return { success: true }
  }
})
