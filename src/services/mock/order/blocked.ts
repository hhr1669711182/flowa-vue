import { defineMock } from '@alova/mock'
import type { BlockedOrderRecord, BlockedOrderStatus } from '@/api/order/blocked'

const stagePool: BlockedOrderRecord['stage'][] = [
  'Review and Fix',
  'Warehouse Processing',
  'Export Processing',
  'Return Processing'
]

const statusPool: BlockedOrderStatus[] = ['Blocked', 'Awaiting Review', 'Escalated', 'Resolved']
const reasonPool: BlockedOrderRecord['holdReason'][] = [
  'Address Error',
  'Payment Risk',
  'Inventory Hold',
  'Compliance Alert',
  'Manual Review'
]
const inventoryPool: BlockedOrderRecord['inventoryStatus'][] = ['In Stock', 'Reserved', 'Out of Stock']

const formatDate = (date: Date) => {
  const mm = `${date.getMonth() + 1}`.padStart(2, '0')
  const dd = `${date.getDate()}`.padStart(2, '0')
  return `${date.getFullYear()}-${mm}-${dd}`
}

const randomDate = (from: Date, to: Date) => {
  const ts = from.getTime() + Math.random() * (to.getTime() - from.getTime())
  return new Date(ts)
}

const calcHoldLevel = (status: BlockedOrderStatus, reason: BlockedOrderRecord['holdReason']) => {
  if (status === 'Escalated') return 'High'
  if (reason === 'Payment Risk' || reason === 'Compliance Alert') return 'High'
  if (status === 'Awaiting Review') return 'Medium'
  return 'Low'
}

const seedBlockedOrders = (): BlockedOrderRecord[] => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - 3, 1)
  return Array.from({ length: 86 }).map((_, index) => {
    const created = randomDate(start, now)
    const blocked = new Date(created)
    blocked.setDate(created.getDate() + (index % 3))
    const due = new Date(blocked)
    due.setDate(blocked.getDate() + ((index % 6) + 1))
    const status = statusPool[index % statusPool.length]!
    const holdReason = reasonPool[index % reasonPool.length]!
    const holdLevel = calcHoldLevel(status, holdReason)
    const holdDays = Math.max(1, Math.ceil((now.getTime() - blocked.getTime()) / (1000 * 60 * 60 * 24)))
    const createdText = formatDate(created)
    const blockedText = formatDate(blocked)
    return {
      id: `BO-${1800 + index}`,
      orderId: `Order X${(310000 + index).toString().padStart(6, '0')}`,
      platformId: `LGF${20270000 + index}`,
      stage: stagePool[index % stagePool.length]!,
      status,
      holdReason,
      holdLevel,
      holdNote:
        holdReason === 'Address Error'
          ? 'Incorrect city and postcode.'
          : holdReason === 'Payment Risk'
            ? 'Payment flagged by risk engine.'
            : holdReason === 'Inventory Hold'
              ? 'Reserved quantity unavailable.'
              : holdReason === 'Compliance Alert'
                ? 'Missing customs declaration fields.'
                : 'Manual verification pending.',
      customerName: ['Evan Su', 'Ava Cooper', 'Ethan Ward', 'Luna Price', 'Lucas Ross'][index % 5]!,
      customerRegion: ['UK/England', 'UK/London', 'US/New York', 'DE/Munich', 'CA/Toronto'][index % 5]!,
      inventoryStatus: inventoryPool[index % inventoryPool.length]!,
      createDate: createdText,
      blockedDate: blockedText,
      dueDate: formatDate(due),
      sku: `SKU-${10200 + index}`,
      productName: ['Priority Parcel', 'Fragile Kit', 'Outer Carton', 'Label Bundle', 'Seal Pack'][index % 5]!,
      quantity: (index % 5) + 1,
      holdDays,
      title: `Order X${(12345 + (index % 50)).toString().padStart(6, '0')}`,
      code: '00/00/2026',
      deliveryStatus: 'Blocked',
      carrier: ['Australia Post / 3J85', 'DHL / 8H12', 'FedEx / 2A31'][index % 3]!,
      method: ['Regular Shipping', 'Express Shipping'][index % 2]!,
      itemQuantity: `${(index % 7) + 1}`.padStart(2, '0'),
      chargingWeight: `${(index % 8) + 1},0 kg`
    }
  })
}

let blockedOrdersDb: BlockedOrderRecord[] = seedBlockedOrders()

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
  '/api/orders/blocked': ({ query }) => {
    const page = parseInt(query.page || '1', 10)
    const pageSize = parseInt(query.pageSize || '10', 10)
    const keyword = (query.keyword || '').toLowerCase()
    const quickRange = query.quickRange || 'all'
    const status = query.status || ''
    const reason = query.reason || ''
    const stage = query.stage || ''
    const inventory = query.inventory || ''
    const segmented = query.segmented || 'all'
    const dateRange = query.dateRange

    let filtered = [...blockedOrdersDb]

    if (keyword) {
      filtered = filtered.filter(
        (item) =>
          item.orderId.toLowerCase().includes(keyword) ||
          item.platformId.toLowerCase().includes(keyword) ||
          item.sku.toLowerCase().includes(keyword)
      )
    }

    if (status) {
      filtered = filtered.filter((item) => item.status === status)
    }

    if (reason) {
      filtered = filtered.filter((item) => item.holdReason === reason)
    }

    if (stage) {
      filtered = filtered.filter((item) => item.stage === stage)
    }

    if (inventory) {
      filtered = filtered.filter((item) => item.inventoryStatus === inventory)
    }

    filtered = filtered.filter((item) => inQuickRange(item.blockedDate, quickRange))

    if (Array.isArray(dateRange) && dateRange.length === 2) {
      const [from, to] = dateRange
      filtered = filtered.filter((item) => item.blockedDate >= from && item.blockedDate <= to)
    }

    if (segmented === 'active') {
      filtered = filtered.filter((item) => item.status !== 'Resolved')
    }

    if (segmented === 'resolved') {
      filtered = filtered.filter((item) => item.status === 'Resolved')
    }

    filtered.sort((a, b) => (a.blockedDate > b.blockedDate ? -1 : 1))

    const total = filtered.length
    const start = (page - 1) * pageSize
    const list = filtered.slice(start, start + pageSize)
    return {
      total,
      list,
      page,
      pageSize,
      segmented: {
        all: blockedOrdersDb.length,
        active: blockedOrdersDb.filter((item) => item.status !== 'Resolved').length,
        resolved: blockedOrdersDb.filter((item) => item.status === 'Resolved').length
      }
    }
  },

  '/api/orders/blocked/detail': ({ query }) => {
    return blockedOrdersDb.find((item) => item.id === query.id) || blockedOrdersDb[0]
  },

  '[POST]/api/orders/blocked/reactivate': ({ data }) => {
    blockedOrdersDb = blockedOrdersDb.map((item) =>
      item.id === data.id
        ? {
            ...item,
            status: 'Unblocked',
            holdLevel: 'Low',
            holdNote: data.note || 'Unblocked by operator.'
          }
        : item
    )
    return { success: true }
  },

  '[POST]/api/orders/blocked/status': ({ data }) => {
    blockedOrdersDb = blockedOrdersDb.map((item) =>
      item.id === data.id
        ? {
            ...item,
            status: data.status || item.status,
            holdLevel: data.status === 'Escalated' ? 'High' : item.holdLevel
          }
        : item
    )
    return { success: true }
  },

  '[POST]/api/orders/blocked/ticket': () => {
    return { success: true }
  }
})
