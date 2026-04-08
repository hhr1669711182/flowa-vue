import { alovaInstance } from '@/services/alova'
import { OMS_API } from '@/api/omsApiBase'

export interface ServiceRecord {
  id: string
  serviceId: string
  approvedDate: string
  type: string
  typeDescription: string
  approvedBy: string
  price: string
  uom: string
  quantity: number
  subtotal: string
  totalVat: string
  total: string
}

export const getServicesList = (params: {
  company: string
  period_start?: string
  period_end?: string
  billing_cycle?: string
  page?: number
  pageSize?: number
  search?: string
  dateRange?: string[]
  type?: string
}) => {
  return alovaInstance.Post<any>(`${OMS_API}.get_services_billing_list`, {
    company: params.company,
    period_start: params.period_start || params.dateRange?.[0],
    period_end: params.period_end || params.dateRange?.[1],
    billing_cycle: params.billing_cycle,
    page: params.page ?? 1,
    page_size: params.pageSize ?? 10,
  })
}

export const exportServicesBilling = (params: {
  company: string
  period_start?: string
  period_end?: string
  billing_cycle?: string
}) => {
  return alovaInstance.Post<any>(`${OMS_API}.export_services_billing`, {
    company: params.company,
    period_start: params.period_start,
    period_end: params.period_end,
    billing_cycle: params.billing_cycle,
  })
}
