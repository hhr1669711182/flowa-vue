import { defineMock } from '@alova/mock'
import type { DeliveredOrderRecord, DeliveredOrderStage, DeliveredOrderStatus } from '@/api/order/delivered'

const stagePool: DeliveredOrderStage[] = [
  'Review & Fix',
  'Warehouse',
  'Export',
  'Local Delivery',
  'Redelivery',
  'Delivered'
]

const statusPool: DeliveredOrderStatus[] = ['Delivered', 'Partially Delivered', 'Returned', 'Delivery Failed']

const formatDate = (date: Date) => {
  const mm = `${date.getMonth() + 1}`.padStart(2, '0')
  const dd = `${date.getDate()}`.padStart(2, '0')
  return `${date.getFullYear()}-${mm}-${dd}`
}

const randomDate = (from: Date, to: Date) => {
  const ts = from.getTime() + Math.random() * (to.getTime() - from.getTime())
  return new Date(ts)
}

const seedItems = (seed: number) => {
  return Array.from({ length: 3 + (seed % 3) }).map((_, idx) => ({
    id: `ITEM-${seed}-${idx}`,
    name: ['Black Shirt S', 'Thermal Label Roll', 'Packing Tape', 'Mailer Bag'][idx % 4]!,
    sku: `SKU ${12000 + seed * 10 + idx}`,
    details: ['Cotton · Size S', '4x6 · 500 labels', '48mm · 100m', 'Poly mailer · M'][idx % 4]!,
    quantity: 1 + ((seed + idx) % 3),
    price: '$0,00',
    warehouse: ['FGSH01', 'FGSH02', 'AUS01'][idx % 3]!
  }))
}

const seedDeliveredOrders = (): DeliveredOrderRecord[] => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - 3, 1)
  return Array.from({ length: 84 }).map((_, index) => {
    const created = randomDate(start, now)
    const arrival = new Date(created)
    arrival.setDate(created.getDate() + ((index % 6) + 1))
    const stage = stagePool[index % stagePool.length]!
    const status = (index % 7 === 0 ? statusPool[(index % statusPool.length) || 0] : 'Delivered') as DeliveredOrderStatus
    const createdText = formatDate(created)
    const arrivalText = formatDate(arrival)
    return {
      id: `DO-${1200 + index}`,
      orderId: `Order X${(310000 + index).toString().padStart(6, '0')}`,
      platformId: `LGF${20262000 + index}`,
      stage: stage === 'Delivered' ? 'Local Delivery' : stage,
      status,
      customerName: ['Evan Su', 'Emma Wilson', 'Liam Scott', 'Sophia Hall', 'Noah Miller'][index % 5]!,
      customerRegion: ['UK/England', 'UK/London', 'US/Texas', 'DE/Hamburg', 'CA/Vancouver'][index % 5]!,
      createDate: createdText,
      arrivalDate: arrivalText,
      title: `Order X${(12345 + (index % 50)).toString().padStart(6, '0')}`,
      code: '00/00/2026',
      deliveryStatus: status,
      carrier: ['Australia Post / 3J85', 'DHL / 8H12', 'FedEx / 2A31'][index % 3]!,
      method: ['Regular Shipping', 'Express Shipping'][index % 2]!,
      trackingNo: `TRK${(880000 + index).toString().padStart(8, '0')}`,
      itemQuantity: `${(index % 7) + 1}`.padStart(2, '0'),
      chargingWeight: `${(index % 8) + 1},0 kg`,
      destination: 'London, UK/England',
      etaText: '20th to 24th of February',
      arrivalAtText: 'February 20, 2025 at 12:34',
      items: seedItems(index)
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

const segmentedCounter = () => ({
  all: deliveredOrdersDb.length,
  success: deliveredOrdersDb.filter((item) => item.status === 'Delivered').length,
  issue: deliveredOrdersDb.filter((item) => item.status !== 'Delivered').length
})

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
          (item.trackingNo || '').toLowerCase().includes(keyword)
      )
    }

    if (stage) {
      filtered = filtered.filter((item) => item.stage === stage)
    }

    if (status) {
      filtered = filtered.filter((item) => item.status === status)
    }

    filtered = filtered.filter((item) => inQuickRange(item.arrivalDate, quickRange))

    if (Array.isArray(dateRange) && dateRange.length === 2) {
      const [from, to] = dateRange
      filtered = filtered.filter((item) => item.arrivalDate >= from && item.arrivalDate <= to)
    }

    if (segmented === 'success') {
      filtered = filtered.filter((item) => item.status === 'Delivered')
    }

    if (segmented === 'issue') {
      filtered = filtered.filter((item) => item.status !== 'Delivered')
    }

    filtered.sort((a, b) => (a.arrivalDate > b.arrivalDate ? -1 : 1))

    const total = filtered.length
    const start = (page - 1) * pageSize
    const list = filtered.slice(start, start + pageSize).map((item) => {
      const { items, ...rest } = item
      return rest
    })

    return { total, list, page, pageSize, segmented: segmentedCounter() }
  },

  '/api/orders/delivered/detail': ({ query }) => {
    return deliveredOrdersDb.find((item) => item.id === query.id) || deliveredOrdersDb[0]
  },

  '[POST]/api/orders/delivered/note': ({ data }) => {
    deliveredOrdersDb = deliveredOrdersDb.map((item) =>
      item.id === data.id
        ? {
            ...item,
            etaText: data.note || item.etaText
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
            deliveryStatus: data.status || item.deliveryStatus
          }
        : item
    )
    return { success: true }
  },

  '[POST]/api/orders/delivered/ticket': () => {
    return { success: true }
  }
})
