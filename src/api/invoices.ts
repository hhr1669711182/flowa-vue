import { alovaInstance } from '@/services/alova'

export type InvoiceStatus = 'Paid' | 'Pending' | 'Overdue'

export interface InvoiceLineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
}

export interface InvoiceRecord {
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

export interface InvoiceListResponse {
  total: number
  list: InvoiceRecord[]
}

export interface InvoiceSummary {
  totalInvoices: number
  totalAmount: number
  paidCount: number
  pendingCount: number
  overdueCount: number
}

export interface InvoiceListParams {
  page?: number
  pageSize?: number
  status?: InvoiceStatus | ''
  keyword?: string
  quickRange?: 'last7' | 'last30' | 'thisMonth' | 'all'
  dateRange?: [string, string] | []
}

export const getInvoiceList = (params: InvoiceListParams) => {
  return alovaInstance.Get<InvoiceListResponse>('/api/invoices', { params })
}

export const getInvoiceSummary = () => {
  return alovaInstance.Get<InvoiceSummary>('/api/invoices/summary')
}

export const getInvoiceDetail = (id: string) => {
  return alovaInstance.Get<InvoiceRecord>('/api/invoices/detail', { params: { id } })
}

export const downloadAllInvoices = () => {
  return alovaInstance.Get<{ url: string; fileName: string }>('/api/invoices/download/all')
}

export const downloadInvoiceById = (id: string) => {
  return alovaInstance.Get<{ url: string; fileName: string }>('/api/invoices/download/one', {
    params: { id }
  })
}
