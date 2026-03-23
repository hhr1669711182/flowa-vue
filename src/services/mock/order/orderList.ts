import { defineMock } from '@alova/mock'
import type { OrderItem, OrderListRecord, OrderStage, OrderStatus, InventoryStatus } from '@/api/order/orderList'

const stagePool: OrderStage[] = ['Review & Fix', 'Warehouse', 'Export', 'Local Delivery', 'Delivered']
const statusPool: OrderStatus[] = ['Awaiting Approval', 'Need Attention', 'Processing', 'Blocked', 'Awaiting']
const inventoryPool: InventoryStatus[] = ['In Stock', 'Reserved', 'Out of Stock']

const formatDate = (date: Date) => {
  const mm = `${date.getMonth() + 1}`.padStart(2, '0')
  const dd = `${date.getDate()}`.padStart(2, '0')
  return `${date.getFullYear()}-${mm}-${dd}`
}

const randomDate = (from: Date, to: Date) => {
  const ts = from.getTime() + Math.random() * (to.getTime() - from.getTime())
  return new Date(ts)
}

const seedItems = (seed: number): OrderItem[] =>
  Array.from({ length: 3 }).map((_, idx) => ({
    id: `ITEM-${seed}-${idx}`,
    name: ['Black Shirt S', 'Black Shirt M', 'Black Shirt L'][idx]!,
    sku: `SKU ${12345 + seed * 10 + idx}`,
    details: 'Black Shirt S Cotton...',
    quantity: 1,
    price: '$0,00',
    warehouse: ['FGSH01', 'FGSH02', 'FGSH01'][idx % 3]!,
    inventoryStatus: inventoryPool[(seed + idx) % inventoryPool.length]!
  }))

const seedOrders = (): OrderListRecord[] => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - 2, 1)
  return Array.from({ length: 96 }).map((_, index) => {
    const created = randomDate(start, now)
    const due = new Date(created)
    due.setDate(created.getDate() + ((index % 8) + 2))
    const stage = stagePool[index % stagePool.length]!
    const status: OrderStatus =
      stage === 'Review & Fix'
        ? 'Awaiting Approval'
        : (statusPool[(index + 1) % statusPool.length] as OrderStatus)
    return {
      id: `OL-${1500 + index}`,
      orderId: `Order X${(12345 + index).toString().padStart(6, '0')}`,
      platformId: `LGF${20242112 + index}`,
      stage,
      status,
      customerName: 'Evan Su',
      customerRegion: 'UK/England',
      inventoryStatus: inventoryPool[index % inventoryPool.length]!,
      createDate: formatDate(created),
      dueDate: formatDate(due),
      title: `Order X${(12345 + (index % 50)).toString().padStart(6, '0')}`,
      code: '00/00/2026',
      deliveryStatus: status,
      destination: 'London, UK/England',
      etaText: '20th to 24th of February',
      trackingNo: `012345${(6700 + index).toString().padStart(4, '0')}`,
      items: seedItems(index)
    }
  })
}

let orderListDb: OrderListRecord[] = seedOrders()

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
  '/api/orders/order-list': ({ query }) => {
    const page = parseInt(query.page || '1', 10)
    const pageSize = parseInt(query.pageSize || '10', 10)
    const keyword = (query.keyword || '').toLowerCase()
    const quickRange = query.quickRange || 'all'
    const stage = query.stage || ''
    const status = query.status || ''
    const inventory = query.inventory || ''
    const dateRange = query.dateRange

    let filtered = [...orderListDb]

    if (keyword) {
      filtered = filtered.filter(
        (item) =>
          item.orderId.toLowerCase().includes(keyword) ||
          item.platformId.toLowerCase().includes(keyword) ||
          (item.trackingNo || '').toLowerCase().includes(keyword)
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

    filtered = filtered.filter((item) => inQuickRange(item.createDate, quickRange))

    if (Array.isArray(dateRange) && dateRange.length === 2) {
      const [from, to] = dateRange
      filtered = filtered.filter((item) => item.createDate >= from && item.createDate <= to)
    }

    filtered.sort((a, b) => (a.createDate > b.createDate ? -1 : 1))

    const total = filtered.length
    const start = (page - 1) * pageSize
    const list = filtered.slice(start, start + pageSize).map((item) => {
      const { items, ...rest } = item
      return rest
    })

    return { total, list, page, pageSize }
  },

  '/api/orders/order-list/detail': ({ query }) => {
    return orderListDb.find((item) => item.id === query.id) || orderListDb[0]
  },

  '[POST]/api/orders/order-list/status': ({ data }) => {
    orderListDb = orderListDb.map((item) =>
      item.id === data.id
        ? {
            ...item,
            status: data.status || item.status,
            deliveryStatus: data.status || item.deliveryStatus
          }
        : item
    )
    return { success: true }
  },

  '[POST]/api/orders/order-list/ticket': () => {
    return { success: true }
  },

  '[POST]/api/orders/order-list/item/delete': ({ data }) => {
    orderListDb = orderListDb.map((item) =>
      item.id === data.id
        ? {
            ...item,
            items: (item.items || []).filter((it) => it.id !== data.itemId)
          }
        : item
    )
    return { success: true }
  }
})

