import { defineMock } from '@alova/mock'
import type {
  InProgressInventoryStatus,
  InProgressOrderRecord,
  InProgressOrderStage,
  InProgressOrderStatus,
  InProgressServiceSummary
} from '@/api/order/inProgress'

const stagePool: InProgressOrderStage[] = [
  'Review & Fix',
  'Warehouse Processing',
  'Export Processing',
  'Local Delivery'
]

const statusPool: InProgressOrderStatus[] = [
  'Pick & Pack',
  'Awaiting Handover',
  'Dispatched',
  'Waiting Export',
  'Exporting',
  'Destination Country',
  'Customs Clearance',
  'In Transit'
]

const inventoryPool: InProgressInventoryStatus[] = ['In Stock', 'Reserved', 'Out of Stock']

const formatDate = (date: Date) => {
  const mm = `${date.getMonth() + 1}`.padStart(2, '0')
  const dd = `${date.getDate()}`.padStart(2, '0')
  return `${date.getFullYear()}-${mm}-${dd}`
}

const randomDate = (from: Date, to: Date) => {
  const ts = from.getTime() + Math.random() * (to.getTime() - from.getTime())
  return new Date(ts)
}

const seedServices = (seed: number): InProgressServiceSummary[] => {
  const base = (123 + (seed % 18)).toString().padStart(4, '0')
  return [
    {
      id: `Service X${base}`,
      type: 'Order Interception',
      typeDescription: `Order Interception (${statusPool[seed % statusPool.length]!})`,
      approvedDate: 'dd/mm/yyyy',
      approvedBy: 'Evan Su',
      price: '$0,00',
      uom: 'Per Item',
      quantity: 3,
      subtotal: '$0,00',
      totalVat: '$0,00',
      total: '$0,00'
    }
  ]
}

const seedOrders = (): InProgressOrderRecord[] => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - 2, 1)
  return Array.from({ length: 88 }).map((_, index) => {
    const created = randomDate(start, now)
    const due = new Date(created)
    due.setDate(created.getDate() + ((index % 10) + 2))
    const stage = stagePool[index % stagePool.length]!
    const status =
      stage === 'Warehouse Processing'
        ? (['Pick & Pack', 'Awaiting Handover', 'Dispatched'][index % 3] as InProgressOrderStatus)
        : stage === 'Export Processing'
          ? (['Waiting Export', 'Exporting', 'Destination Country', 'Customs Clearance'][index % 4] as InProgressOrderStatus)
          : stage === 'Local Delivery'
            ? ('In Transit' as InProgressOrderStatus)
            : ('Awaiting' as InProgressOrderStatus)
    const inventoryStatus = inventoryPool[index % inventoryPool.length]!
    const createdText = formatDate(created)
    const dueText = formatDate(due)
    return {
      id: `IP-${1000 + index}`,
      orderId: `Order X${(120000 + index).toString().padStart(6, '0')}`,
      platformId: `LGF${20240200 + index}`,
      stage,
      status,
      customerName: ['Evan Su', 'Olivia Hall', 'Noah Lee', 'Liam Carter', 'Mia Allen'][index % 5]!,
      customerRegion: ['UK/England', 'UK/London', 'US/California', 'CA/Ontario', 'DE/Berlin'][index % 5]!,
      inventoryStatus,
      createDate: createdText,
      dueDate: dueText,
      title: `Order X${(12345 + (index % 50)).toString().padStart(6, '0')}`,
      code: '00/00/2026',
      deliveryStatus: status,
      carrier: ['Australia Post / 3J85', 'DHL / 8H12', 'FedEx / 2A31'][index % 3]!,
      method: ['Regular Shipping', 'Express Shipping'][index % 2]!,
      trackingNo: `012345${(6700 + index).toString().padStart(4, '0')}`,
      destination: 'London, UK/England',
      etaText: '20th to 24th of February',
      arrivalAtText: 'February 20, 2025 at 12:34',
      services: seedServices(index)
    }
  })
}

let inProgressDb: InProgressOrderRecord[] = seedOrders()

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
  '/api/orders/in-progress': ({ query }) => {
    const page = parseInt(query.page || '1', 10)
    const pageSize = parseInt(query.pageSize || '10', 10)
    const keyword = (query.keyword || '').toLowerCase()
    const quickRange = query.quickRange || 'all'
    const stage = query.stage || ''
    const status = query.status || ''
    const inventory = query.inventory || ''
    const dateRange = query.dateRange

    let filtered = [...inProgressDb]

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
      const { services, ...rest } = item
      return rest
    })

    return { total, list, page, pageSize }
  },

  '/api/orders/in-progress/detail': ({ query }) => {
    return inProgressDb.find((item) => item.id === query.id) || inProgressDb[0]
  },

  '[POST]/api/orders/in-progress/ticket': () => {
    return { success: true }
  },

  '[POST]/api/orders/in-progress/intercept': ({ data }) => {
    inProgressDb = inProgressDb.map((item) =>
      item.id === data.id
        ? {
            ...item,
            status: 'Awaiting' as InProgressOrderStatus,
            deliveryStatus: 'Awaiting',
            etaText: data.note || item.etaText
          }
        : item
    )
    return { success: true }
  }
})
