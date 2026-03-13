import { defineMock } from '@alova/mock'

type InvoiceStatus = 'Paid' | 'Pending' | 'Overdue'

interface InvoiceLineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
}

interface InvoiceRecord {
  id: string
  invoiceId: string
  reference: string
  invoiceDate: string
  periodStart: string
  periodEnd: string
  dueDate: string
  total: number
  currency: string
  status: InvoiceStatus
  lineItems: InvoiceLineItem[]
}

const statusPool: InvoiceStatus[] = ['Paid', 'Pending', 'Overdue']
const servicePool = ['Outbound Fulfillment', 'Storage Plan', 'Packaging Service', 'Return Handling']

const randomDate = (from: Date, to: Date) => {
  const ts = from.getTime() + Math.random() * (to.getTime() - from.getTime())
  return new Date(ts)
}

const formatDate = (date: Date) => {
  const mm = `${date.getMonth() + 1}`.padStart(2, '0')
  const dd = `${date.getDate()}`.padStart(2, '0')
  const yyyy = date.getFullYear()
  return `${yyyy}-${mm}-${dd}`
}

const buildLineItems = (invoiceIndex: number): InvoiceLineItem[] => {
  return servicePool.map((service, idx) => {
    const quantity = (invoiceIndex + idx) % 3 + 1
    const unitPrice = Number((18 + ((invoiceIndex + idx) % 8) * 6.25).toFixed(2))
    return {
      id: `${invoiceIndex}-${idx + 1}`,
      description: service,
      quantity,
      unitPrice,
      amount: Number((quantity * unitPrice).toFixed(2))
    }
  })
}

const seedInvoices = (): InvoiceRecord[] => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - 4, 1)
  return Array.from({ length: 80 }).map((_, index) => {
    const invoiceDate = randomDate(start, now)
    const periodStart = new Date(invoiceDate)
    periodStart.setDate(Math.max(1, invoiceDate.getDate() - 7))
    const periodEnd = new Date(invoiceDate)
    const dueDate = new Date(invoiceDate)
    dueDate.setDate(dueDate.getDate() + 14)
    const lineItems = buildLineItems(index + 1)
    const total = Number(lineItems.reduce((sum, item) => sum + item.amount, 0).toFixed(2))
    return {
      id: `INV_INTERNAL_${10001 + index}`,
      invoiceId: `Invoice X${(1000 + index).toString().padStart(4, '0')}`,
      reference: `REF-${80000 + index}`,
      invoiceDate: formatDate(invoiceDate),
      periodStart: formatDate(periodStart),
      periodEnd: formatDate(periodEnd),
      dueDate: formatDate(dueDate),
      total,
      currency: 'USD',
      status: statusPool[index % statusPool.length],
      lineItems
    }
  }) as InvoiceRecord[]
}

const invoices = seedInvoices()

const inQuickRange = (invoiceDate: string, quickRange: string) => {
  if (!quickRange || quickRange === 'all') {
    return true
  }
  const now = new Date()
  const date = new Date(invoiceDate)
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

export const mockInvoices = defineMock({
  '/api/invoices': ({ query }) => {
    const page = Number.parseInt(query.page || '1', 10)
    const pageSize = Number.parseInt(query.pageSize || '10', 10)
    const keyword = (query.keyword || '').toLowerCase()
    const status = query.status || ''
    const quickRange = query.quickRange || 'all'
    const dateRange = query.dateRange

    let filtered = [...invoices]

    if (keyword) {
      filtered = filtered.filter(
        (item) =>
          item.invoiceId.toLowerCase().includes(keyword) ||
          item.reference.toLowerCase().includes(keyword)
      )
    }

    if (status) {
      filtered = filtered.filter((item) => item.status === status)
    }

    filtered = filtered.filter((item) => inQuickRange(item.invoiceDate, quickRange))

    if (Array.isArray(dateRange) && dateRange.length === 2) {
      const [from, to] = dateRange
      filtered = filtered.filter((item) => item.invoiceDate >= from && item.invoiceDate <= to)
    }

    filtered.sort((a, b) => (a.invoiceDate > b.invoiceDate ? -1 : 1))

    const total = filtered.length
    const startIndex = (page - 1) * pageSize
    const list = filtered.slice(startIndex, startIndex + pageSize)
    return { total, list, page, pageSize }
  },
  '/api/invoices/summary': () => {
    const totalAmount = Number(invoices.reduce((sum, item) => sum + item.total, 0).toFixed(2))
    return {
      totalInvoices: invoices.length,
      totalAmount,
      paidCount: invoices.filter((item) => item.status === 'Paid').length,
      pendingCount: invoices.filter((item) => item.status === 'Pending').length,
      overdueCount: invoices.filter((item) => item.status === 'Overdue').length
    }
  },
  '/api/invoices/detail': ({ query }) => {
    const current = invoices.find((item) => item.id === query.id) || invoices[0]
    return current
  },
  '/api/invoices/download/all': () => {
    return {
      url: '/downloads/all-invoices.zip',
      fileName: 'all-invoices.zip'
    }
  },
  '/api/invoices/download/one': ({ query }) => {
    return {
      url: `/downloads/${query.id || 'invoice'}.pdf`,
      fileName: `${query.id || 'invoice'}.pdf`
    }
  }
})
