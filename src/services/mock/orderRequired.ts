import { defineMock } from '@alova/mock'
import type {
  RequiredIssueType,
  RequiredOrderRecord,
  RequiredOrderStage,
  RequiredOrderStatus
} from '@/api/orderRequired'

const stagePool: RequiredOrderStage[] = [
  'Review & Fix',
  'Warehouse Processing',
  'Labeling',
  'Export Processing'
]

const statusPool: RequiredOrderStatus[] = ['Awaiting Approval', 'Need Attention', 'Processing', 'Blocked']

const issuePool: RequiredIssueType[] = [
  'Address Error',
  'Info Missing',
  'Wrong Declaration',
  'Inventory Mismatch',
  'Payment Risk'
]

const inventoryPool: RequiredOrderRecord['inventoryStatus'][] = ['In Stock', 'Reserved', 'Out of Stock']

const formatDate = (date: Date) => {
  const mm = `${date.getMonth() + 1}`.padStart(2, '0')
  const dd = `${date.getDate()}`.padStart(2, '0')
  return `${date.getFullYear()}-${mm}-${dd}`
}

const randomDate = (from: Date, to: Date) => {
  const ts = from.getTime() + Math.random() * (to.getTime() - from.getTime())
  return new Date(ts)
}

const seedRequiredOrders = (): RequiredOrderRecord[] => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - 2, 1)
  return Array.from({ length: 96 }).map((_, index) => {
    const created = randomDate(start, now)
    const due = new Date(created)
    due.setDate(created.getDate() + ((index % 8) + 1))
    const issueType = issuePool[index % issuePool.length]!
    const status = statusPool[index % statusPool.length]!
    return {
      id: `RO-${2200 + index}`,
      orderId: `Order X${(510000 + index).toString().padStart(6, '0')}`,
      platformId: `LGF${20265000 + index}`,
      stage: stagePool[index % stagePool.length]!,
      status,
      statusNote: status === 'Need Attention' || status === 'Blocked' ? issueType : '',
      issueType,
      issueSummary:
        status === 'Need Attention' || status === 'Blocked'
          ? `${issueType} requires manual validation before release.`
          : 'No pending issue.',
      customerName: ['Ava Martin', 'Noah Walker', 'Sophia Carter', 'Liam Scott', 'Ella Ross'][index % 5]!,
      customerRegion: ['UK/London', 'US/Boston', 'DE/Berlin', 'CA/Toronto', 'AU/Sydney'][index % 5]!,
      inventoryStatus: inventoryPool[index % inventoryPool.length]!,
      createDate: formatDate(created),
      dueDate: formatDate(due),
      sku: `SKU-${13000 + index}`,
      productName: ['Thermal Label', 'Paper Mailer', 'Shipping Box', 'Return Bag', 'Barcode Sticker'][index % 5]!,
      quantity: (index % 4) + 1
    }
  })
}

let requiredOrdersDb: RequiredOrderRecord[] = seedRequiredOrders()

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
  awaiting: requiredOrdersDb.filter((item) => item.status === 'Awaiting Approval').length,
  process: requiredOrdersDb.filter((item) => item.status === 'Processing').length,
  error: requiredOrdersDb.filter((item) => item.status === 'Need Attention' || item.status === 'Blocked').length
})

export default defineMock({
  '/api/orders/required': ({ query }) => {
    const page = parseInt(query.page || '1', 10)
    const pageSize = parseInt(query.pageSize || '10', 10)
    const keyword = (query.keyword || '').toLowerCase()
    const quickRange = query.quickRange || 'all'
    const stage = query.stage || ''
    const status = query.status || ''
    const inventory = query.inventory || ''
    const segmented = query.segmented || 'awaiting'
    const dateRange = query.dateRange

    let filtered = [...requiredOrdersDb]

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

    if (segmented === 'awaiting') {
      filtered = filtered.filter((item) => item.status === 'Awaiting Approval')
    }

    if (segmented === 'process') {
      filtered = filtered.filter((item) => item.status === 'Processing')
    }

    if (segmented === 'error') {
      filtered = filtered.filter((item) => item.status === 'Need Attention' || item.status === 'Blocked')
    }

    filtered = filtered.filter((item) => inQuickRange(item.createDate, quickRange))

    if (Array.isArray(dateRange) && dateRange.length === 2) {
      const [from, to] = dateRange
      filtered = filtered.filter((item) => item.createDate >= from && item.createDate <= to)
    }

    filtered.sort((a, b) => (a.createDate > b.createDate ? -1 : 1))

    const total = filtered.length
    const start = (page - 1) * pageSize
    const list = filtered.slice(start, start + pageSize)

    return {
      total,
      list,
      segmented: segmentedCounter()
    }
  },

  '/api/orders/required/detail': ({ query }) => {
    return requiredOrdersDb.find((item) => item.id === query.id) || requiredOrdersDb[0]
  },

  '[POST]/api/orders/required/review': ({ data }) => {
    requiredOrdersDb = requiredOrdersDb.map((item) =>
      item.id === data.id
        ? {
            ...item,
            stage: 'Review & Fix',
            status: 'Need Attention',
            statusNote: data.issueType || item.statusNote,
            issueType: data.issueType || item.issueType,
            dueDate: data.dueDate || item.dueDate,
            issueSummary: data.note || item.issueSummary
          }
        : item
    )
    return { success: true }
  },

  '[POST]/api/orders/required/status': ({ data }) => {
    requiredOrdersDb = requiredOrdersDb.map((item) =>
      item.id === data.id
        ? {
            ...item,
            status: data.status || item.status,
            statusNote:
              data.status === 'Awaiting Approval' || data.status === 'Processing'
                ? ''
                : item.statusNote || item.issueType
          }
        : item
    )
    return { success: true }
  },

  '[POST]/api/orders/required/ticket': () => {
    return { success: true }
  }
})
