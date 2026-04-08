import { alovaInstance } from '@/services/alova'
import { OMS_API } from '@/api/omsApiBase'

export interface StorageRecord {
  id: string
  date: string
  warehouse: string
  bins: number
  pallets: number
  total: string
}

export const getStorageList = (params: {
  company: string
  period_start?: string
  period_end?: string
  billing_cycle?: string
  page?: number
  pageSize?: number
  name?: string
  billing_date?: string
  status?: string
  search?: string
  dateRange?: string[]
}) => {
  return alovaInstance.Post<any>(`${OMS_API}.get_storage_billing_list`, {
    company: params.company,
    period_start: params.period_start || params.dateRange?.[0],
    period_end: params.period_end || params.dateRange?.[1],
    billing_cycle: params.billing_cycle,
    page: params.page ?? 1,
    page_size: params.pageSize ?? 10,
    name: params.name,
    billing_date: params.billing_date,
    status: params.status,
  })
}

export const exportStorageBilling = (params: {
  company: string
  period_start?: string
  period_end?: string
  billing_cycle?: string
  name?: string
  billing_date?: string
  status?: string
}) => {
  return alovaInstance.Post<any>(`${OMS_API}.export_storage_billing`, {
    company: params.company,
    period_start: params.period_start,
    period_end: params.period_end,
    billing_cycle: params.billing_cycle,
    name: params.name,
    billing_date: params.billing_date,
    status: params.status,
  })
}
